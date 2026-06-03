import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyEpaySignature } from "@/lib/esewa"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const encodedData = searchParams.get("data")

    if (!encodedData) {
      return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=failed", req.url))
    }

    let decoded: any
    try {
      const jsonStr = Buffer.from(encodedData, "base64").toString("utf-8")
      decoded = JSON.parse(jsonStr)
    } catch {
      return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=failed", req.url))
    }

    const { status, total_amount, transaction_uuid, product_code, signature } = decoded

    if (!signature || !total_amount || !transaction_uuid || !product_code) {
      return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=failed", req.url))
    }

    const isValid = verifyEpaySignature(
      String(total_amount),
      transaction_uuid,
      product_code,
      signature,
    )

    if (!isValid) {
      return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=invalid", req.url))
    }

    const transaction = await prisma.transaction.findFirst({
      where: { transactionUuid: transaction_uuid, type: "subscription" },
    })

    if (!transaction) {
      return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=notfound", req.url))
    }

    if (Number(total_amount) !== transaction.amount) {
      return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=failed", req.url))
    }

    const isComplete = status === "COMPLETE"

    const updated = await prisma.transaction.updateMany({
      where: { id: transaction.id, status: "PENDING" },
      data: {
        status: isComplete ? "COMPLETED" : "FAILED",
        reference: decoded.transaction_code || null,
      },
    })

    if (updated.count === 0) {
      return transaction.status === "COMPLETED"
        ? NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=already", req.url))
        : NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=failed", req.url))
    }

    if (isComplete) {
      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
        select: { proExpiresAt: true },
      })

      const now = new Date()
      const currentExpiry = user?.proExpiresAt ? new Date(user.proExpiresAt) : null
      const newExpiry =
        currentExpiry && currentExpiry > now
          ? new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          tier: "PRO",
          proExpiresAt: newExpiry,
        },
      })
    }

    const redirectParam = isComplete ? "success" : "failed"
    return NextResponse.redirect(
      new URL(`/dashboard/tasker/settings?pro=${redirectParam}`, req.url),
    )
  } catch (error) {
    console.error("Subscription success error:", error)
    return NextResponse.redirect(new URL("/dashboard/tasker/settings?pro=error", req.url))
  }
}
