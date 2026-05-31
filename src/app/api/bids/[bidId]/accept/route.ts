import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendBidAcceptedNotification } from "@/lib/email"
import { createNotification } from "@/lib/notification"

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
        request: { include: { user: { select: { isActive: true } } } },
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

    if (!bid.request.user.isActive) {
      return NextResponse.json(
        { error: "Cannot accept bids on this request" },
        { status: 400 }
      )
    }

    const existingAssignment = await prisma.taskerAssignment.findFirst({
      where: { requestId: bid.requestId },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: "An assignment already exists for this request" },
        { status: 400 }
      )
    }

    const accepted = await prisma.bid.updateMany({
      where: { id: bidId, status: "PENDING" },
      data: { status: "ACCEPTED" },
    })

    if (accepted.count === 0) {
      return NextResponse.json(
        { error: "Bid could not be accepted" },
        { status: 409 }
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

    await createNotification({
      userId: bid.taskerId,
      type: "bid_accepted",
      title: "Bid Accepted!",
      message: `Your bid of रू ${bid.amount.toLocaleString()} on "${bid.request.title}" has been accepted`,
      link: `/dashboard/tasker/my-bids?requestId=${bid.request.id}`,
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to accept bid" },
      { status: 500 }
    )
  }
}
