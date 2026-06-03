import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notification"
import { sendNewRequestNotification } from "@/lib/email"

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

    const isAdmin = session.user.role === "ADMIN"
    if (isAdmin) {
      // admins see all requests (optional status filter still applies)
    } else if (role === "tasker") {
      // Taskers see all OPEN requests (excluding their own and ones they already bid on)
      where.status = "OPEN"
      where.userId = { not: session.user.id }
      where.bids = { none: { taskerId: session.user.id } }
    } else {
      where.userId = session.user.id
    }

    if (status && !(role === "tasker" && where.status)) where.status = status
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
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              reviewerId: true,
              revieweeId: true,
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
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
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
      customServiceName,
      title,
      description,
      location,
      wardNo,
      budget,
      urgency,
      scheduledDate,
      images,
    } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let finalServiceId = serviceId

    // Handle custom service: find-or-create a "General" category + "Other" service
    if (!finalServiceId && customServiceName) {
      const generalCategory = await prisma.category.upsert({
        where: { slug: "general" },
        update: {},
        create: {
          name: "General",
          slug: "general",
          description: "General and custom services",
          isActive: true,
          sortOrder: 999,
        },
      })

      const otherService = await prisma.service.upsert({
        where: { categoryId_slug: { categoryId: generalCategory.id, slug: "other" } },
        update: {},
        create: {
          categoryId: generalCategory.id,
          name: "Other",
          slug: "other",
          description: "Custom service requests",
          isActive: true,
        },
      })

      finalServiceId = otherService.id
    }

    if (!finalServiceId) {
      return NextResponse.json({ error: "Please select or enter a service" }, { status: 400 })
    }

    const request = await prisma.request.create({
      data: {
        userId: session.user.id,
        serviceId: finalServiceId,
        title,
        description,
        location,
        wardNo: wardNo ? parseInt(wardNo) : null,
        budget: budget ? parseFloat(budget) : null,
        urgency: urgency || "normal",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        images: images || [],
      },
      include: { service: { select: { name: true } } },
    })

    // Notify all active taskers (fire-and-forget, don't block response)
    prisma.user
      .findMany({
        where: {
          isTasker: true,
          isActive: true,
          id: { not: session.user.id },
        },
        select: { id: true, name: true, email: true },
      })
      .then((taskers) => {
        for (const tasker of taskers) {
          createNotification({
            userId: tasker.id,
            type: "new_request",
            title: "New Job Available",
            message: `A new ${request.service.name} request: "${title}"`,
            link: `/dashboard/tasker/jobs/${request.id}`,
          })
          if (tasker.email) {
            sendNewRequestNotification({
              to: tasker.email,
              taskerName: tasker.name || "Tasker",
              serviceName: request.service.name,
              requestTitle: title,
              requestId: request.id,
              urgency: urgency || "normal",
            }).catch(() => {})
          }
        }
      })
      .catch(() => {})

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
