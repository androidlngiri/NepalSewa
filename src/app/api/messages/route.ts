import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 })
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        userId: true,
        taskerAssignments: {
          select: { taskerId: true },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const isParticipant =
      request.userId === session.user.id ||
      request.taskerAssignments.some((a: any) => a.taskerId === session.user.id)

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { requestId },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { requestId, content } = body

    if (!requestId || !content?.trim()) {
      return NextResponse.json(
        { error: "requestId and content are required" },
        { status: 400 }
      )
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        userId: true,
        taskerAssignments: {
          select: { taskerId: true },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const taskerIds = request.taskerAssignments.map((a: any) => a.taskerId)
    const isCustomer = request.userId === session.user.id
    const isTasker = taskerIds.includes(session.user.id)

    if (!isCustomer && !isTasker) {
      return NextResponse.json({ error: "Only request participants can send messages" }, { status: 403 })
    }

    const receiverId = isCustomer ? (taskerIds[0] || null) : request.userId

    if (!receiverId) {
      return NextResponse.json({ error: "No recipient available" }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        requestId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
