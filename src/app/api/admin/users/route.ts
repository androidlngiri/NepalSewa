import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const q = searchParams.get("q") || ""
    const roleFilter = searchParams.get("role") || ""
    const activeFilter = searchParams.get("active")

    const where: any = {}
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ]
    }
    if (roleFilter) where.role = roleFilter
    if (activeFilter === "true") where.isActive = true
    if (activeFilter === "false") where.isActive = false

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          wardNo: true,
          rating: true,
          createdAt: true,
          _count: { select: { requests: true, bids: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, limit })
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { userId, isActive, role } = body
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const data: any = {}
    if (typeof isActive === "boolean") data.isActive = isActive
    if (role) data.role = role

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
