import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(_req: Request, { params }: { params: Promise<{ bidId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bidId } = await params

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      select: { taskerId: true, status: true },
    })

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    }

    if (bid.taskerId !== session.user.id) {
      return NextResponse.json({ error: "Not your bid" }, { status: 403 })
    }

    if (bid.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending bids can be cancelled" }, { status: 400 })
    }

    await prisma.bid.delete({ where: { id: bidId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to cancel bid" }, { status: 500 })
  }
}
