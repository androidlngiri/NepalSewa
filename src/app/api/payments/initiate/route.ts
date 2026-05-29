import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateTransactionUuid, getEpayFormFields, getBaseUrl, getConfig } from "@/lib/esewa"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, amount } = await req.json()

    if (!requestId || !amount) {
      return NextResponse.json({ error: "requestId and amount required" }, { status: 400 })
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (request.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { merchantCode } = getConfig()
    const transactionUuid = generateTransactionUuid()
    const numericAmount = Number(amount)

    const formFields = getEpayFormFields(numericAmount, transactionUuid, merchantCode)

    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: numericAmount,
        type: "payment",
        status: "PENDING",
        requestId: request.id,
        transactionUuid,
        productCode: merchantCode,
        description: `Payment for request: ${request.title}`,
      },
    })

    return NextResponse.json({
      action: getBaseUrl(),
      fields: formFields,
      transactionUuid,
    })
  } catch (error) {
    console.error("Payment initiate error:", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}
