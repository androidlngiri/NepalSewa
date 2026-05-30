import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendPaymentConfirmation } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId } = await req.json()

    if (!requestId) {
      return NextResponse.json({ error: "requestId required" }, { status: 400 })
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { service: { select: { name: true } } },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (request.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (request.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Request is not in progress" }, { status: 400 })
    }

    const existingTx = await prisma.transaction.findFirst({
      where: { requestId, status: { in: ["PENDING", "COMPLETED"] } },
    })

    if (existingTx) {
      if (existingTx.status === "COMPLETED") {
        return NextResponse.json({ error: "Payment already completed" }, { status: 400 })
      }
      return NextResponse.json({ error: "A payment is already pending" }, { status: 409 })
    }

    const acceptedBid = await prisma.bid.findFirst({
      where: { requestId, status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
    })

    const amount = acceptedBid?.amount ?? request.budget

    if (!amount) {
      return NextResponse.json({ error: "No amount found" }, { status: 400 })
    }

    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "cash",
        status: "COMPLETED",
        requestId: request.id,
        description: `Cash payment for request: ${request.title}`,
      },
    })

    await prisma.request.update({
      where: { id: request.id },
      data: { status: "COMPLETED" },
    })

    if (session.user.email) {
      sendPaymentConfirmation({
        to: session.user.email,
        userName: session.user.name || "User",
        serviceName: request.service.name,
        amount,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process cash payment" }, { status: 500 })
  }
}
