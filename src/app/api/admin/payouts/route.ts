import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notification"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payouts = await prisma.payoutRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tasker: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error("Admin payouts GET error:", error)
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { payoutId, status } = await req.json()

    if (!payoutId || !status || !["PROCESSING", "COMPLETED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid payoutId or status" }, { status: 400 })
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    })

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }

    if (payout.status !== "PENDING" && payout.status !== "PROCESSING") {
      return NextResponse.json(
        { error: `Cannot update payout with status ${payout.status}` },
        { status: 400 },
      )
    }

    if (status === "REJECTED") {
      await prisma.$transaction([
        prisma.payoutRequest.update({
          where: { id: payoutId },
          data: { status: "REJECTED" },
        }),
        prisma.user.update({
          where: { id: payout.taskerId },
          data: { balance: { increment: payout.amount } },
        }),
      ])

      await createNotification({
        userId: payout.taskerId,
        type: "payout_rejected",
        title: "Withdrawal Rejected",
        message: `Your withdrawal request of रू ${payout.amount.toLocaleString()} has been rejected. Funds returned to your balance.`,
        link: `/dashboard/tasker/earnings`,
      })

      return NextResponse.json({ success: true, status: "REJECTED" })
    }

    await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status,
        ...(status === "COMPLETED" ? { processedAt: new Date() } : {}),
      },
    })

    const notifType = status === "COMPLETED" ? "payout_completed" : "payout_processing"
    const notifTitle = status === "COMPLETED" ? "Withdrawal Completed" : "Withdrawal Processing"
    const notifMsg =
      status === "COMPLETED"
        ? `Your withdrawal of रू ${payout.amount.toLocaleString()} has been processed.`
        : `Your withdrawal of रू ${payout.amount.toLocaleString()} is being processed.`

    await createNotification({
      userId: payout.taskerId,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      link: `/dashboard/tasker/earnings`,
    })

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("Admin payouts PATCH error:", error)
    return NextResponse.json({ error: "Failed to update payout" }, { status: 500 })
  }
}
