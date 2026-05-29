import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyEpaySignature, getConfig } from "@/lib/esewa"
import { sendPaymentConfirmation } from "@/lib/email"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const encodedData = searchParams.get("data")

    if (!encodedData) {
      return NextResponse.redirect(new URL("/dashboard/user?payment=failed", req.url))
    }

    let decoded: any
    try {
      const jsonStr = Buffer.from(encodedData, "base64").toString("utf-8")
      decoded = JSON.parse(jsonStr)
    } catch {
      return NextResponse.redirect(new URL("/dashboard/user?payment=failed", req.url))
    }

    const { status, total_amount, transaction_uuid, product_code, signature, signed_field_names } = decoded

    if (!signature || !total_amount || !transaction_uuid || !product_code) {
      return NextResponse.redirect(new URL("/dashboard/user?payment=failed", req.url))
    }

    const isValid = verifyEpaySignature(
      String(total_amount),
      transaction_uuid,
      product_code,
      signature
    )

    if (!isValid) {
      return NextResponse.redirect(new URL("/dashboard/user?payment=invalid", req.url))
    }

    const transaction = await prisma.transaction.findFirst({
      where: { transactionUuid: transaction_uuid },
    })

    if (!transaction) {
      return NextResponse.redirect(new URL("/dashboard/user?payment=notfound", req.url))
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.redirect(new URL("/dashboard/user?payment=already", req.url))
    }

    const isComplete = status === "COMPLETE"

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: isComplete ? "COMPLETED" : "FAILED",
        reference: decoded.transaction_code || null,
      },
    })

    if (isComplete && transaction.requestId) {
      await prisma.request.update({
        where: { id: transaction.requestId },
        data: { status: "COMPLETED" },
      })

      const fullTx = await prisma.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          user: { select: { email: true, name: true } },
        },
      })
      if (fullTx?.user.email) {
        const req = await prisma.request.findUnique({
          where: { id: transaction.requestId },
          include: { service: { select: { name: true } } },
        })
        sendPaymentConfirmation({
          to: fullTx.user.email,
          userName: fullTx.user.name || "User",
          serviceName: req?.service.name || "Service",
          amount: transaction.amount,
        }).catch(() => {})
      }
    }

    const redirectParam = isComplete ? "success" : "failed"
    return NextResponse.redirect(new URL(`/dashboard/user?payment=${redirectParam}`, req.url))
  } catch (error) {
    console.error("Payment success error:", error)
    return NextResponse.redirect(new URL("/dashboard/user?payment=error", req.url))
  }
}
