import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
          select: { id: true, name: true, image: true, wardNo: true },
        },
        service: {
          select: { id: true, name: true, slug: true, price: true, priceUnit: true },
        },
        bids: {
          orderBy: { amount: "asc" },
          include: {
            tasker: {
              select: { id: true, name: true, image: true, rating: true },
            },
          },
        },
        taskerAssignments: {
          include: {
            tasker: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        reviews: {
          select: { id: true, rating: true, comment: true, reviewerId: true, revieweeId: true },
        },
        transactions: {
          select: { id: true, amount: true, status: true, type: true },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const isOwner = request.userId === session.user.id
    const isAssignedTasker = request.taskerAssignments.some(
      (a: any) => a.taskerId === session.user.id,
    )
    const isBidder = request.bids.some((b: any) => b.taskerId === session.user.id)
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAssignedTasker && !isBidder && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(request)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    if (body.status && !["CANCELLED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
    }

    if (body.status === "CANCELLED" && !["OPEN", "IN_PROGRESS"].includes(existing.status)) {
      return NextResponse.json(
        { error: "Can only cancel open or in-progress requests" },
        { status: 400 },
      )
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { status: body.status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
