import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, adminNotes } = body

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status must be APPROVED or REJECTED" }, { status: 400 })
    }

    if (status === "REJECTED" && !adminNotes) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    const request = await prisma.verificationRequest.findUnique({
      where: { id },
      select: { id: true, taskerId: true, status: true },
    })

    if (!request) {
      return NextResponse.json({ error: "Verification request not found" }, { status: 404 })
    }

    if (request.status !== "PENDING") {
      return NextResponse.json({ error: "Request already reviewed" }, { status: 400 })
    }

    const updated = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
      },
    })

    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: request.taskerId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 })
  }
}
