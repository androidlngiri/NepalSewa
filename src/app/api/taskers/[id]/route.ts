import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const tasker = await prisma.user.findUnique({
      where: { id, isTasker: true },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        skills: true,
        rating: true,
        isVerified: true,
        verifiedAt: true,
        tier: true,
        address: true,
        wardNo: true,
        createdAt: true,
        portfolioImages: true,
        _count: {
          select: {
            taskerRequests: true,
            reviewsReceived: true,
            bids: true,
          },
        },
      },
    })

    if (!tasker) {
      return NextResponse.json({ error: "Tasker not found" }, { status: 404 })
    }

    const [reviews, recentAssignments] = await Promise.all([
      prisma.review.findMany({
        where: { revieweeId: id },
        include: {
          reviewer: { select: { id: true, name: true, image: true } },
          request: { select: { id: true, title: true, service: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.taskerAssignment.findMany({
        where: { taskerId: id, status: "COMPLETED" },
        include: {
          request: {
            select: {
              id: true,
              title: true,
              service: { select: { name: true } },
              images: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    return NextResponse.json({ ...tasker, reviews, recentAssignments })
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasker" }, { status: 500 })
  }
}
