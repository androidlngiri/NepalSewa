import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendCompletionAwaitingNotification, sendJobConfirmedNotification } from "@/lib/email"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId } = await params
    const body = await req.json()
    const { status } = body

    const validStatuses = ["IN_PROGRESS", "AWAITING_CONFIRMATION", "COMPLETED", "CANCELLED"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const assignment = await prisma.taskerAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        request: {
          include: {
            user: { select: { id: true, name: true, email: true, isActive: true } },
            service: { select: { name: true } },
          },
        },
        tasker: { select: { id: true, name: true, email: true, isActive: true, tier: true, proExpiresAt: true } },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const isTasker = assignment.taskerId === session.user.id
    const isCustomer = assignment.request.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isTasker && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to update this assignment" }, { status: 403 })
    }

    if (!assignment.request.user.isActive || !assignment.tasker.isActive) {
      return NextResponse.json({ error: "Cannot update assignment for inactive user" }, { status: 400 })
    }

    const validTransitions: Record<string, string[]> = {
      OPEN: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["AWAITING_CONFIRMATION", "CANCELLED"],
      AWAITING_CONFIRMATION: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    }

    const allowed = validTransitions[assignment.status] || []
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${assignment.status} to ${status}` },
        { status: 400 }
      )
    }

    if (status === "AWAITING_CONFIRMATION" && !isTasker) {
      return NextResponse.json(
        { error: "Only the assigned tasker can mark as complete" },
        { status: 403 }
      )
    }

    if (status === "COMPLETED" && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: "Only the customer can confirm completion" },
        { status: 403 }
      )
    }

    if (status === "AWAITING_CONFIRMATION") {
      await prisma.taskerAssignment.update({
        where: { id: assignmentId },
        data: { status: "AWAITING_CONFIRMATION" },
      })

      if (assignment.request.user.email) {
        sendCompletionAwaitingNotification({
          to: assignment.request.user.email,
          userName: assignment.request.user.name || "User",
          requestTitle: assignment.request.title,
          requestId: assignment.request.id,
        }).catch(() => {})
      }

      return NextResponse.json({ status: "AWAITING_CONFIRMATION" })
    }

    if (status === "COMPLETED") {
      const updated = await prisma.$transaction(async (tx: any) => {
        const updatedAssignment = await tx.taskerAssignment.update({
          where: { id: assignmentId },
          data: { status: "COMPLETED" },
        })

        await tx.request.update({
          where: { id: assignment.requestId },
          data: { status: "COMPLETED" },
        })

        const existingTx = await tx.transaction.findFirst({
          where: { requestId: assignment.requestId, status: "COMPLETED" },
        })

        if (!existingTx) {
          const acceptedBid = await tx.bid.findFirst({
            where: { requestId: assignment.requestId, status: "ACCEPTED" },
            orderBy: { createdAt: "desc" },
          })
          const amount = acceptedBid?.amount ?? assignment.request.budget
          if (amount) {
            const commissionRate = 
              assignment.tasker.tier === "PRO" && 
              assignment.tasker.proExpiresAt && 
              new Date(assignment.tasker.proExpiresAt) > new Date()
                ? 0.03
                : 0.05
            const commission = Math.round(amount * commissionRate * 100) / 100

            await tx.transaction.create({
              data: {
                userId: assignment.request.user.id,
                amount,
                type: "cash",
                status: "COMPLETED",
                requestId: assignment.request.id,
                description: `Cash payment confirmed for request: ${assignment.request.title}`,
                commission,
                commissionRate,
                taskerId: assignment.tasker.id,
              },
            })
          }
        }

        return updatedAssignment
      })

      if (assignment.request.user.email) {
        const { sendAssignmentCompletedNotification } = await import("@/lib/email")
        sendAssignmentCompletedNotification({
          to: assignment.request.user.email,
          userName: assignment.request.user.name || "User",
          requestTitle: assignment.request.title,
          requestId: assignment.request.id,
        }).catch(() => {})
      }

      if (assignment.tasker.email) {
        sendJobConfirmedNotification({
          to: assignment.tasker.email,
          taskerName: assignment.tasker.name || "Tasker",
          requestTitle: assignment.request.title,
        }).catch(() => {})
      }

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Invalid transition" }, { status: 400 })
  } catch (error) {
    console.error("Assignment PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId } = await params

    const assignment = await prisma.taskerAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        tasker: {
          select: {
            id: true, name: true, image: true, rating: true, phone: true,
          },
        },
        request: {
          include: {
            user: {
              select: { id: true, name: true, image: true, phone: true, wardNo: true },
            },
            service: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const isTasker = assignment.taskerId === session.user.id
    const isCustomer = assignment.request.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isTasker && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    )
  }
}
