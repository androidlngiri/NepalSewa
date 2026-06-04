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
    const allParam = searchParams.get("all")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = {}
    if (session.user.role === "ADMIN" && allParam === "true") {
    } else {
      where.userId = session.user.id
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          request: { select: { id: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({ transactions, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
