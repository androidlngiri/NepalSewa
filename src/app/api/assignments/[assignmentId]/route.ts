import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendAssignmentCompletedNotification } from "@/lib/email"

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

    if (!status || !["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be IN_PROGRESS, COMPLETED, or CANCELLED" },
        { status: 400 }
      )
    }

    const assignment = await prisma.taskerAssignment.findUnique({
      where: { id: assignmentId },
      include: { request: { include: { user: { select: { isActive: true } } } }, tasker: { select: { isActive: true } } },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    const isTasker = assignment.taskerId === session.user.id
    const isCustomer = assignment.request.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isTasker && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to update this assignment" },
        { status: 403 }
      )
    }

    if (!assignment.request.user.isActive || !assignment.tasker.isActive) {
      return NextResponse.json(
        { error: "Cannot update assignment for inactive user" },
        { status: 400 }
      )
    }

    const validTransitions: Record<string, string[]> = {
      OPEN: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
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

    const updated = await prisma.$transaction(async (tx: any) => {
      const updatedAssignment = await tx.taskerAssignment.update({
        where: { id: assignmentId },
        data: { status },
      })

      await tx.request.update({
        where: { id: assignment.requestId },
        data: { status },
      })

      return updatedAssignment
    })

    if (status === "COMPLETED") {
      const fullAssignment = await prisma.taskerAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          request: { include: { user: { select: { email: true, name: true } } } },
        },
      })
      if (fullAssignment?.request.user.email) {
        sendAssignmentCompletedNotification({
          to: fullAssignment.request.user.email,
          userName: fullAssignment.request.user.name || "User",
          requestTitle: fullAssignment.request.title,
        }).catch(() => {})
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
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
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
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
