import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const MIN_WITHDRAWAL = 100

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== "TASKER" && !session.user.isTasker)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [payouts, balance] = await Promise.all([
      prisma.payoutRequest.findMany({
        where: { taskerId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true },
      }),
    ])

    return NextResponse.json({
      payouts,
      balance: balance?.balance ?? 0,
    })
  } catch (error) {
    console.error("Payout GET error:", error)
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== "TASKER" && !session.user.isTasker)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, method, accountDetails } = await req.json()

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is रू ${MIN_WITHDRAWAL}` },
        { status: 400 },
      )
    }

    if (!method || !["ESEWA", "BANK"].includes(method)) {
      return NextResponse.json({ error: "Method must be ESEWA or BANK" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    })

    if (!user || user.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const pendingPayout = await prisma.payoutRequest.findFirst({
      where: {
        taskerId: session.user.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    })

    if (pendingPayout) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal request" },
        { status: 409 },
      )
    }

    const [payout] = await prisma.$transaction([
      prisma.payoutRequest.create({
        data: {
          taskerId: session.user.id,
          amount,
          method,
          accountDetails: accountDetails || null,
          status: "PENDING",
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: { decrement: amount } },
      }),
    ])

    return NextResponse.json({ success: true, payout })
  } catch (error) {
    console.error("Payout POST error:", error)
    return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 })
  }
}
