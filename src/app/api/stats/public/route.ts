import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [totalUsers, totalTaskers, completedJobs, totalRequests, reviews] =
      await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "TASKER", isActive: true } }),
        prisma.request.count({ where: { status: "COMPLETED" } }),
        prisma.request.count(),
        prisma.review.aggregate({ _avg: { rating: true } }),
      ])

    const response = NextResponse.json({
      users: totalUsers ?? 0,
      taskers: totalTaskers ?? 0,
      completedJobs: completedJobs ?? 0,
      totalRequests: totalRequests ?? 0,
      satisfactionRate: reviews._avg.rating
        ? Math.round(reviews._avg.rating * 20)
        : null,
    })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    return NextResponse.json(
      { users: 0, taskers: 0, completedJobs: 0, totalRequests: 0, satisfactionRate: null },
      { status: 200 }
    )
  }
}
