import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendBidAcceptedNotification } from "@/lib/email"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bidId } = await params

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        request: true,
        tasker: { select: { id: true, name: true, email: true } },
      },
    })

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    }

    if (bid.status !== "PENDING") {
      return NextResponse.json(
        { error: "Bid is no longer available" },
        { status: 400 }
      )
    }

    if (bid.request.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the request owner can accept bids" },
        { status: 403 }
      )
    }

    if (bid.request.status !== "OPEN") {
      return NextResponse.json(
        { error: "This request is no longer open" },
        { status: 400 }
      )
    }

    const [assignment] = await prisma.$transaction([
      prisma.taskerAssignment.create({
        data: {
          taskerId: bid.taskerId,
          requestId: bid.requestId,
          status: "IN_PROGRESS",
        },
      }),
      prisma.bid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      }),
      prisma.request.update({
        where: { id: bid.requestId },
        data: { status: "IN_PROGRESS" },
      }),
      prisma.bid.updateMany({
        where: {
          requestId: bid.requestId,
          id: { not: bidId },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      }),
    ])

    if (bid.tasker.email) {
      sendBidAcceptedNotification({
        to: bid.tasker.email,
        taskerName: bid.tasker.name || "Tasker",
        requestTitle: bid.request.title,
        requestId: bid.request.id,
      }).catch(() => {})
    }

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("Bid accept error:", error)
    return NextResponse.json(
      { error: "Failed to accept bid" },
      { status: 500 }
    )
  }
}
