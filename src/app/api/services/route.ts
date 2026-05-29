import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            priceUnit: true,
            image: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Services fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}
