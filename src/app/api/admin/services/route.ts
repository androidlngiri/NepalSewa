import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      include: {
        services: { orderBy: { price: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    if (body.type === "category") {
      if (!body.name || !body.slug) {
        return NextResponse.json({ error: "Missing name or slug" }, { status: 400 })
      }
      const category = await prisma.category.create({
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description || null,
          icon: body.icon || null,
          sortOrder: body.sortOrder || 0,
        },
      })
      return NextResponse.json(category, { status: 201 })
    }

    if (body.type === "service") {
      if (!body.name || !body.slug || !body.categoryId) {
        return NextResponse.json({ error: "Missing name, slug, or categoryId" }, { status: 400 })
      }
      const service = await prisma.service.create({
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description || null,
          price: body.price || 0,
          priceUnit: body.priceUnit || "per hour",
          categoryId: body.categoryId,
          image: body.image || null,
        },
      })
      return NextResponse.json(service, { status: 201 })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    if (body.type === "category") {
      if (!body.id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 })
      }
      const data: any = {}
      if (body.name !== undefined) data.name = body.name
      if (body.slug !== undefined) data.slug = body.slug
      if (body.description !== undefined) data.description = body.description
      if (body.isActive !== undefined) data.isActive = body.isActive
      if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

      const updated = await prisma.category.update({
        where: { id: body.id },
        data,
      })
      return NextResponse.json(updated)
    }

    if (body.type === "service") {
      if (!body.id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 })
      }
      const data: any = {}
      if (body.name !== undefined) data.name = body.name
      if (body.slug !== undefined) data.slug = body.slug
      if (body.description !== undefined) data.description = body.description
      if (body.price !== undefined) data.price = body.price
      if (body.priceUnit !== undefined) data.priceUnit = body.priceUnit
      if (body.isActive !== undefined) data.isActive = body.isActive

      const updated = await prisma.service.update({
        where: { id: body.id },
        data,
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    )
  }
}
