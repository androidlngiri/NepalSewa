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
    const roleParam = searchParams.get("role")
    const role = roleParam || session.user.role

    if (role === "ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (role === "ADMIN") {
      const [
        totalUsers,
        totalTaskers,
        totalRequests,
        completedJobs,
        totalTransactions,
        growthData,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "TASKER" } }),
        prisma.request.count(),
        prisma.request.count({ where: { status: "COMPLETED" } }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: "COMPLETED" },
        }),
        prisma.request.groupBy({
          by: ["status"],
          _count: true,
        }),
      ])

      const recentTransactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      const usersByRole = await prisma.user.groupBy({
        by: ["role"],
        _count: true,
      })

      return NextResponse.json({
        totalUsers,
        totalTaskers,
        totalRequests,
        completedJobs,
        revenue: totalTransactions._sum.amount || 0,
        growthData,
        recentTransactions,
        usersByRole,
      })
    }

    if (role === "TASKER") {
      const [activeBids, completedJobs, earnings, reviews] = await Promise.all([
        prisma.bid.count({
          where: { taskerId: session.user.id, status: "PENDING" },
        }),
        prisma.taskerAssignment.count({
          where: { taskerId: session.user.id, status: "COMPLETED" },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true, commission: true },
          where: { taskerId: session.user.id, status: "COMPLETED" },
        }),
        prisma.review.findMany({
          where: { revieweeId: session.user.id },
          select: { rating: true },
        }),
      ])

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) /
            reviews.length
          : 0

      const recentEarnings = await prisma.transaction.findMany({
        where: { taskerId: session.user.id, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 30,
      })

      return NextResponse.json({
        activeBids,
        completedJobs,
        earnedTotal: earnings._sum.amount || 0,
        totalCommission: earnings._sum.commission || 0,
        netEarnings: (earnings._sum.amount || 0) - (earnings._sum.commission || 0),
        rating: avgRating,
        recentEarnings: recentEarnings.map(
          (t: { createdAt: Date; amount: number; commission: number | null }) => ({
            date: t.createdAt.toISOString(),
            amount: t.amount,
            commission: t.commission,
          }),
        ),
      })
    }

    const [activeRequests, completedJobs, pendingBids, transactions] = await Promise.all([
      prisma.request.count({
        where: { userId: session.user.id, status: "OPEN" },
      }),
      prisma.request.count({
        where: { userId: session.user.id, status: "COMPLETED" },
      }),
      prisma.bid.count({
        where: {
          request: { userId: session.user.id },
          status: "PENDING",
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { userId: session.user.id },
      }),
    ])

    return NextResponse.json({
      activeRequests,
      completedJobs,
      pendingBids,
      totalSpent: transactions._sum.amount || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 })
  }
}
