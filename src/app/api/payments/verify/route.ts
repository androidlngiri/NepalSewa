import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkEpayTransactionStatus, getConfig } from "@/lib/esewa"
import { createNotification } from "@/lib/notification"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transactionId } = await req.json()
    if (!transactionId) {
      return NextResponse.json({ error: "transactionId required" }, { status: 400 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json({ status: transaction.status })
    }

    const { merchantCode } = getConfig()
    const result = await checkEpayTransactionStatus(
      transaction.productCode || merchantCode,
      transaction.transactionUuid || "",
      transaction.amount,
    )

    if (result.status === "COMPLETE") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED", reference: result.refId },
      })

      if (transaction.requestId) {
        await prisma.$transaction(async (tx: any) => {
          await tx.request.update({
            where: { id: transaction.requestId },
            data: { status: "COMPLETED" },
          })

          const assignment = await tx.taskerAssignment.findFirst({
            where: {
              requestId: transaction.requestId,
              status: { in: ["IN_PROGRESS", "AWAITING_CONFIRMATION"] },
            },
          })

          if (assignment) {
            await tx.taskerAssignment.update({
              where: { id: assignment.id },
              data: { status: "COMPLETED" },
            })
          }

          if (transaction.taskerId && transaction.commission !== null) {
            const netAmount =
              Math.round((transaction.amount - (transaction.commission || 0)) * 100) / 100
            await tx.user.update({
              where: { id: transaction.taskerId },
              data: { balance: { increment: netAmount } },
            })
          }
        })
      }

      if (transaction.taskerId) {
        await createNotification({
          userId: transaction.taskerId,
          type: "payment_received",
          title: "eSewa Payment Received",
          message: `Payment of रू ${transaction.amount.toLocaleString()} confirmed for your job`,
          link: `/dashboard/tasker/earnings`,
        })
      }

      return NextResponse.json({ status: "COMPLETED", refId: result.refId })
    }

    if (result.status === "NOT_FOUND" || result.status === "CANCELED") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      })
      return NextResponse.json({ status: "FAILED" })
    }

    return NextResponse.json({ status: result.status, refId: result.refId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
