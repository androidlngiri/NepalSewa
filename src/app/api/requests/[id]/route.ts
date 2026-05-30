import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, phone: true, wardNo: true },
        },
        service: {
          select: { id: true, name: true, slug: true, price: true, priceUnit: true },
        },
        bids: {
          orderBy: { amount: "asc" },
          include: {
            tasker: {
              select: { id: true, name: true, image: true, email: true, phone: true, rating: true },
            },
          },
        },
        taskerAssignments: {
          include: {
            tasker: {
              select: { id: true, name: true, image: true, email: true, phone: true },
            },
          },
        },
        reviews: {
          select: { id: true, rating: true, comment: true, reviewerId: true, revieweeId: true },
        },
        transactions: {
          select: { id: true, amount: true, status: true, type: true, reference: true },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json(request)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await prisma.request.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (body.status && !["CANCELLED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { status: body.status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.request.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await prisma.request.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    )
  }
}
