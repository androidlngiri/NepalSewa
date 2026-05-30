import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkEpayTransactionStatus, getConfig } from "@/lib/esewa"

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
      transaction.amount
    )

    if (result.status === "COMPLETE") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED", reference: result.refId },
      })

      if (transaction.requestId) {
        await prisma.request.update({
          where: { id: transaction.requestId },
          data: { status: "COMPLETED" },
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
