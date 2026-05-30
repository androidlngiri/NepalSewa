import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendBidNotification } from "@/lib/email"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get("requestId")

    const where: any = { taskerId: session.user.id }
    if (requestId) where.requestId = requestId

    const bids = await prisma.bid.findMany({
      where,
      include: {
        request: {
          include: {
            user: {
              select: { id: true, name: true, image: true, wardNo: true },
            },
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bids)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bids" },
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

    if (session.user.role !== "TASKER") {
      return NextResponse.json(
        { error: "Only taskers can place bids" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { requestId, amount, message } = body

    if (!requestId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: { status: true, userId: true, user: { select: { isActive: true } } },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (request.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot bid on your own request" },
        { status: 400 }
      )
    }

    if (!request.user.isActive) {
      return NextResponse.json(
        { error: "Cannot bid on this request" },
        { status: 400 }
      )
    }

    if (request.status !== "OPEN") {
      return NextResponse.json(
        { error: "Can only bid on open requests" },
        { status: 400 }
      )
    }

    const existingBid = await prisma.bid.findUnique({
      where: {
        requestId_taskerId: {
          requestId,
          taskerId: session.user.id,
        },
      },
    })

    if (existingBid) {
      return NextResponse.json(
        { error: "You have already bid on this request" },
        { status: 409 }
      )
    }

    const bid = await prisma.bid.create({
      data: {
        requestId,
        taskerId: session.user.id,
        amount: parseFloat(amount),
        message,
      },
    })

    const requestWithDetails = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { email: true } },
        service: { select: { name: true } },
      },
    })

    if (requestWithDetails?.user.email) {
      sendBidNotification({
        to: requestWithDetails.user.email,
        taskerName: session.user.name || "A tasker",
        serviceName: requestWithDetails.service.name,
        amount: parseFloat(amount),
        requestId,
      }).catch(() => {})
    }

    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    )
  }
}
