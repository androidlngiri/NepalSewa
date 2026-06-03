import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== "TASKER" && !session.user.isTasker)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const taskerId = session.user.id

    const [totals, thisMonth, monthlyBreakdown, transactions, total, tierInfo] = await Promise.all([
      prisma.transaction.aggregate({
        where: { taskerId, status: "COMPLETED" },
        _sum: { amount: true, commission: true },
        _count: true,
        _avg: { commissionRate: true },
      }),
      prisma.transaction.aggregate({
        where: {
          taskerId,
          status: "COMPLETED",
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { amount: true, commission: true },
        _count: true,
      }),
      prisma.$queryRaw<{ month: string; amount: number; commission: number; count: bigint }[]>`
        SELECT
          to_char("createdAt", 'YYYY-MM') AS month,
          COALESCE(SUM(amount), 0) AS amount,
          COALESCE(SUM(commission), 0) AS commission,
          COUNT(*) AS count
        FROM transactions
        WHERE "taskerId" = ${taskerId} AND status = 'COMPLETED'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `,
      prisma.transaction.findMany({
        where: { taskerId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          user: { select: { id: true, name: true } },
          request: { select: { id: true, title: true, service: { select: { name: true } } } },
        },
      }),
      prisma.transaction.count({
        where: { taskerId, status: "COMPLETED" },
      }),
      prisma.user.findUnique({
        where: { id: taskerId },
        select: { tier: true, proExpiresAt: true },
      }),
    ])

    const gross = totals._sum.amount || 0
    const commissionTotal = totals._sum.commission || 0
    const thisMonthGross = thisMonth._sum.amount || 0
    const thisMonthCommission = thisMonth._sum.commission || 0

    return NextResponse.json({
      summary: {
        grossEarned: gross,
        totalCommission: commissionTotal,
        netEarned: gross - commissionTotal,
        completedJobs: totals._count,
        avgCommissionRate: totals._avg.commissionRate || 0,
        thisMonthGross: thisMonthGross,
        thisMonthCommission: thisMonthCommission,
        thisMonthNet: thisMonthGross - thisMonthCommission,
        thisMonthJobs: thisMonth._count,
      },
      tier: tierInfo?.tier || "STANDARD",
      proExpiresAt: tierInfo?.proExpiresAt,
      monthlyBreakdown: monthlyBreakdown.map((m) => ({
        month: m.month,
        gross: Number(m.amount),
        commission: Number(m.commission),
        net: Number(m.amount) - Number(m.commission),
        jobs: Number(m.count),
      })),
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        commission: tx.commission,
        commissionRate: tx.commissionRate,
        description: tx.description,
        createdAt: tx.createdAt,
        customer: tx.user,
        jobTitle: tx.request?.title || null,
        serviceName: tx.request?.service?.name || null,
      })),
      total,
      page,
      limit,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}
