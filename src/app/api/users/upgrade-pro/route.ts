import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateTransactionUuid, getEpayFormFields, getConfig } from "@/lib/esewa"

const PRO_PRICE = 199

function getSubscriptionUrls() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return {
    success: `${baseUrl}/api/payments/subscription-success`,
    failure: `${baseUrl}/api/payments/subscription-failure`,
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isTasker: true, tier: true, proExpiresAt: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "TASKER" && !user.isTasker) {
      return NextResponse.json({ error: "Only taskers can upgrade to Pro" }, { status: 403 })
    }

    if (user.tier === "PRO" && user.proExpiresAt && new Date(user.proExpiresAt) > new Date()) {
      return NextResponse.json(
        { error: "You already have an active Pro subscription" },
        { status: 400 },
      )
    }

    const existingPending = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        type: "subscription",
        status: "PENDING",
      },
    })

    const urls = getSubscriptionUrls()

    if (existingPending) {
      const { merchantCode } = getConfig()
      const formFields = getEpayFormFields(
        PRO_PRICE,
        existingPending.transactionUuid!,
        merchantCode,
        urls.success,
        urls.failure,
      )
      return NextResponse.json({ formFields, action: getEsewaUrl() })
    }

    const transactionUuid = generateTransactionUuid()
    const { merchantCode } = getConfig()

    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: PRO_PRICE,
        type: "subscription",
        status: "PENDING",
        transactionUuid,
        productCode: merchantCode,
        description: "NepalSewa Pro Subscription (30 days)",
      },
    })

    const formFields = getEpayFormFields(
      PRO_PRICE,
      transactionUuid,
      merchantCode,
      urls.success,
      urls.failure,
    )

    return NextResponse.json({ formFields, action: getEsewaUrl() })
  } catch (error) {
    console.error("Upgrade pro error:", error)
    return NextResponse.json({ error: "Failed to initiate Pro upgrade" }, { status: 500 })
  }
}

function getEsewaUrl(): string {
  const { isTest } = getConfig()
  return isTest
    ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
    : "https://epay.esewa.com.np/api/epay/main/v2/form"
}
