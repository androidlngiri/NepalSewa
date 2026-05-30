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

    const { requestId, amount: clientAmount } = await req.json()

    if (!requestId || !clientAmount) {
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

    const acceptedBid = await prisma.bid.findFirst({
      where: { requestId, status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
    })

    const dbAmount = acceptedBid?.amount ?? request.budget

    if (!dbAmount) {
      return NextResponse.json(
        { error: "No accepted bid or budget found for this request" },
        { status: 400 }
      )
    }

    if (Number(clientAmount) !== dbAmount) {
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      )
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { requestId, status: { in: ["PENDING", "COMPLETED"] } },
      orderBy: { createdAt: "desc" },
    })

    if (existingTransaction) {
      if (existingTransaction.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Payment already completed for this request" },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "A payment is already pending for this request" },
        { status: 409 }
      )
    }

    const { merchantCode } = getConfig()
    const transactionUuid = generateTransactionUuid()
    const numericAmount = dbAmount

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
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}
