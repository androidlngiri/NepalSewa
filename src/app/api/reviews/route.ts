import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notification"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { revieweeId, requestId, rating, comment } = body

    if (!revieweeId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: revieweeId, rating" },
        { status: 400 },
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (session.user.id === revieweeId) {
      return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 })
    }

    if (requestId) {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          taskerAssignments: {
            where: { status: { in: ["IN_PROGRESS", "AWAITING_CONFIRMATION", "COMPLETED"] } },
            select: { taskerId: true },
          },
        },
      })

      if (!request) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 })
      }

      if (request.status !== "COMPLETED") {
        return NextResponse.json({ error: "Can only review completed requests" }, { status: 400 })
      }

      const assignedTaskerIds = request.taskerAssignments.map((a: any) => a.taskerId)
      if (assignedTaskerIds.length > 0 && !assignedTaskerIds.includes(revieweeId)) {
        return NextResponse.json(
          { error: "Reviewee does not match the assigned tasker for this request" },
          { status: 400 },
        )
      }

      const isParticipant =
        request.userId === session.user.id ||
        (await prisma.taskerAssignment.findFirst({
          where: { requestId, taskerId: session.user.id },
        })) !== null

      if (!isParticipant) {
        return NextResponse.json(
          { error: "Only request participants can leave a review" },
          { status: 403 },
        )
      }
    }

    const existing = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        revieweeId,
        ...(requestId ? { requestId } : {}),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this user for this request" },
        { status: 409 },
      )
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        revieweeId,
        requestId: requestId || null,
        rating,
        comment: comment || null,
      },
    })

    const aggregation = await prisma.review.aggregate({
      where: { revieweeId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.user.update({
      where: { id: revieweeId },
      data: { rating: aggregation._avg.rating },
    })

    await createNotification({
      userId: revieweeId,
      type: "new_review",
      title: "New Review Received",
      message: `${session.user.name || "Someone"} gave you ${rating} star${rating !== 1 ? "s" : ""}${comment ? `: "${comment.substring(0, 100)}"` : ""}`,
      link: `/dashboard/reviews`,
    })

    return NextResponse.json(
      {
        review,
        averageRating: aggregation._avg.rating,
        totalReviews: aggregation._count.rating,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || session.user.id
    const filter = searchParams.get("filter")

    const where: any =
      filter === "written" ? { reviewerId: session.user.id } : { revieweeId: userId }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: { id: true, name: true, image: true },
        },
        reviewee: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
