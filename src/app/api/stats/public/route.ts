import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [totalUsers, totalTaskers, completedJobs, totalRequests, reviews, recentJobs, previousJobs] =
      await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "TASKER", isActive: true } }),
        prisma.request.count({ where: { status: "COMPLETED" } }),
        prisma.request.count(),
        prisma.review.aggregate({ _avg: { rating: true } }),
        prisma.request.count({
          where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.request.count({
          where: { status: "COMPLETED", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        }),
      ])

    const growthRate =
      previousJobs > 0 ? Math.round(((recentJobs - previousJobs) / previousJobs) * 100) : null

    return NextResponse.json({
      users: totalUsers ?? 0,
      taskers: totalTaskers ?? 0,
      completedJobs: completedJobs ?? 0,
      totalRequests: totalRequests ?? 0,
      satisfactionRate: reviews._avg.rating
        ? Math.round(reviews._avg.rating * 20)
        : null,
      growthRate,
    })
  } catch {
    return NextResponse.json(
      { users: 0, taskers: 0, completedJobs: 0, totalRequests: 0, satisfactionRate: null, growthRate: null },
      { status: 200 }
    )
  }
}
