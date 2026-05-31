import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const whereCommission = { commission: { not: null } }

    const [
      totalCommissionResult,
      thisMonthResult,
      commissionTxns,
      total,
      taskerBreakdown,
      tierCounts,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: whereCommission,
        _sum: { commission: true },
        _avg: { commissionRate: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          ...whereCommission,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { commission: true },
        _count: true,
      }),
      prisma.transaction.findMany({
        where: whereCommission,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          user: { select: { id: true, name: true } },
          tasker: { select: { id: true, name: true } },
          request: { select: { id: true, title: true } },
        },
      }),
      prisma.transaction.count({ where: whereCommission }),
      prisma.transaction.groupBy({
        by: ["taskerId"],
        where: { taskerId: { not: null }, commission: { not: null } },
        _sum: { commission: true, amount: true },
        _count: true,
        _avg: { commissionRate: true },
        orderBy: { _sum: { commission: "desc" } },
      }),
      prisma.user.groupBy({
        by: ["tier"],
        where: { role: "TASKER" },
        _count: true,
      }),
    ])

    const taskerIds = taskerBreakdown.map((t) => t.taskerId).filter(Boolean) as string[]
    const taskerMap = new Map<string, string>()
    if (taskerIds.length > 0) {
      const taskers = await prisma.user.findMany({
        where: { id: { in: taskerIds } },
        select: { id: true, name: true },
      })
      taskers.forEach((t) => taskerMap.set(t.id, t.name || "Unknown"))
    }

    const breakdown = taskerBreakdown.map((t) => ({
      taskerId: t.taskerId,
      taskerName: taskerMap.get(t.taskerId || "") || "Unknown",
      totalCommission: t._sum.commission || 0,
      totalRevenue: t._sum.amount || 0,
      jobCount: t._count,
      avgRate: t._avg.commissionRate || 0,
    }))

    return NextResponse.json({
      summary: {
        totalCommission: totalCommissionResult._sum.commission || 0,
        totalCommissionRate: totalCommissionResult._avg.commissionRate || 0,
        totalCommissionJobs: totalCommissionResult._count,
        thisMonthCommission: thisMonthResult._sum.commission || 0,
        thisMonthJobs: thisMonthResult._count,
      },
      tierCounts: tierCounts.reduce(
        (acc, t) => {
          acc[t.tier?.toLowerCase() || "standard"] = t._count
          return acc
        },
        {} as Record<string, number>,
      ),
      transactions: commissionTxns.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        commission: tx.commission,
        commissionRate: tx.commissionRate,
        description: tx.description,
        createdAt: tx.createdAt,
        user: tx.user,
        tasker: tx.tasker,
        request: tx.request,
      })),
      breakdown,
      total,
      page,
      limit,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch commissions" }, { status: 500 })
  }
}
