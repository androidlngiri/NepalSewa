import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notification"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get("requestId")
    const take = Math.min(Number(searchParams.get("take")) || 50, 100)
    const before = searchParams.get("before")

    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 })
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        userId: true,
        taskerAssignments: { select: { taskerId: true } },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const bidderIds = (
      await prisma.bid.findMany({
        where: { requestId },
        select: { taskerId: true },
      })
    ).map((b) => b.taskerId)

    const taskerIds = request.taskerAssignments.map((a: any) => a.taskerId)
    const participantIds = new Set([request.userId, ...taskerIds, ...bidderIds])

    if (!participantIds.has(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const where: any = { requestId }
    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    })

    return NextResponse.json(messages.reverse())
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
    const { requestId, content, receiverId: explicitReceiverId } = body

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
        taskerAssignments: { select: { taskerId: true } },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const bidderIds = (
      await prisma.bid.findMany({
        where: { requestId, status: { in: ["PENDING", "ACCEPTED"] } },
        select: { taskerId: true },
      })
    ).map((b) => b.taskerId)

    const taskerIds = request.taskerAssignments.map((a: any) => a.taskerId)
    const participantIds = new Set([request.userId, ...taskerIds, ...bidderIds])

    if (!participantIds.has(session.user.id)) {
      return NextResponse.json(
        { error: "Only request participants can send messages" },
        { status: 403 }
      )
    }

    const isCustomer = request.userId === session.user.id
    let receiverId = explicitReceiverId || null

    if (!receiverId) {
      if (isCustomer) {
        const lastMsg = await prisma.message.findFirst({
          where: { requestId, senderId: { not: session.user.id } },
          orderBy: { createdAt: "desc" },
          select: { senderId: true },
        })
        receiverId = lastMsg?.senderId || bidderIds[0] || taskerIds[0] || null
      } else {
        receiverId = request.userId
      }
    }

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

    await createNotification({
      userId: receiverId,
      type: "new_message",
      title: "New Message",
      message: `${session.user.name || "Someone"} sent you a message`,
      link: `/dashboard/chat/${requestId}`,
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
