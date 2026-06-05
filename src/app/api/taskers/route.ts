import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const skill = searchParams.get("skill")
    const minRating = searchParams.get("minRating")
    const verifiedOnly = searchParams.get("verified") === "true"
    const search = searchParams.get("q")
    const sort = searchParams.get("sort") || "rating"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {
      isTasker: true,
      isActive: true,
    }

    if (verifiedOnly) where.isVerified = true
    if (minRating) where.rating = { gte: parseFloat(minRating) }
    if (skill) where.skills = { has: skill }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ]
    }

    const orderBy: any =
      sort === "jobs"
        ? { taskerAssignments: { _count: "desc" } }
        : sort === "newest"
          ? { createdAt: "desc" }
          : { rating: "desc" }

    const [taskers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          skills: true,
          rating: true,
          isVerified: true,
          tier: true,
          address: true,
          createdAt: true,
          _count: {
            select: {
              taskerRequests: true,
              reviewsReceived: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ taskers, total, page, limit })
  } catch {
    return NextResponse.json({ error: "Failed to fetch taskers" }, { status: 500 })
  }
}
