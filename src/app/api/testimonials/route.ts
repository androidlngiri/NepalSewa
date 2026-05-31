import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        location: true,
        role: true,
        content: true,
        rating: true,
        avatarUrl: true,
      },
    })
    return NextResponse.json(testimonials)
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}
