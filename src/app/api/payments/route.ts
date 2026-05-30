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

    const where: any = {}
    if (session.user.role === "ADMIN" && allParam === "true") {
    } else {
      where.userId = session.user.id
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: allParam === "true" ? 100 : 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
