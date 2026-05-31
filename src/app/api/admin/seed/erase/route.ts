import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const seedEmails = ["ram@example.com", "sita@example.com", "hari@example.com", "gita@example.com"]

    const seedUsers = await prisma.user.findMany({
      where: { email: { in: seedEmails } },
      select: { id: true },
    })
    const seedUserIds = seedUsers.map((u) => u.id)

    await prisma.message.deleteMany({
      where: { OR: [{ senderId: { in: seedUserIds } }, { receiverId: { in: seedUserIds } }] },
    })
    await prisma.transaction.deleteMany({
      where: { id: { in: ["seed-tx-1", "seed-tx-2"] } },
    })
    await prisma.transaction.deleteMany({
      where: { userId: { in: seedUserIds } },
    })
    await prisma.transaction.deleteMany({
      where: { taskerId: { in: seedUserIds } },
    })
    await prisma.review.deleteMany({
      where: { OR: [{ reviewerId: { in: seedUserIds } }, { revieweeId: { in: seedUserIds } }] },
    })
    await prisma.taskerAssignment.deleteMany({
      where: { taskerId: { in: seedUserIds } },
    })
    await prisma.bid.deleteMany({
      where: { taskerId: { in: seedUserIds } },
    })
    await prisma.request.deleteMany({
      where: { id: { in: ["seed-req-1", "seed-req-2", "seed-req-3", "seed-req-4"] } },
    })
    await prisma.request.deleteMany({
      where: { userId: { in: seedUserIds } },
    })
    await prisma.user.deleteMany({
      where: { email: { in: seedEmails } },
    })
    await prisma.testimonial.deleteMany()

    return NextResponse.json({ success: true, message: "Seed data erased successfully." })
  } catch (error) {
    console.error("Erase API error:", error)
    return NextResponse.json({ error: "Failed to erase seed data" }, { status: 500 })
  }
}
