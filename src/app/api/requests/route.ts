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
    const status = searchParams.get("status")
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const wardNo = searchParams.get("wardNo")
    const serviceId = searchParams.get("serviceId")
    const urgency = searchParams.get("urgency")
    const minBudget = searchParams.get("minBudget")
    const maxBudget = searchParams.get("maxBudget")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = {}

    if (role === "tasker") {
      where.taskerAssignments = { some: { taskerId: session.user.id } }
    } else {
      where.userId = session.user.id
    }

    if (status) where.status = status
    if (wardNo) where.wardNo = parseInt(wardNo)
    if (serviceId) where.serviceId = serviceId
    if (urgency) where.urgency = urgency

    if (minBudget || maxBudget) {
      where.budget = {}
      if (minBudget) where.budget.gte = parseFloat(minBudget)
      if (maxBudget) where.budget.lte = parseFloat(maxBudget)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true, wardNo: true },
          },
          service: {
            select: { id: true, name: true, slug: true },
          },
          bids: {
            select: {
              id: true,
              amount: true,
              status: true,
              tasker: {
                select: { id: true, name: true, image: true, rating: true },
              },
            },
          },
          taskerAssignments: {
            select: {
              id: true,
              status: true,
              tasker: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.request.count({ where }),
    ])

    if (searchParams.has("page")) {
      return NextResponse.json({ requests, total, page, limit })
    }
    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      serviceId,
      title,
      description,
      location,
      wardNo,
      budget,
      urgency,
      scheduledDate,
      images,
    } = body

    if (!serviceId || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const request = await prisma.request.create({
      data: {
        userId: session.user.id,
        serviceId,
        title,
        description,
        location,
        wardNo: wardNo ? parseInt(wardNo) : null,
        budget: budget ? parseFloat(budget) : null,
        urgency: urgency || "normal",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        images: images || [],
      },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    )
  }
}
