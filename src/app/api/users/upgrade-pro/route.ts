import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
      return NextResponse.json(
        { error: "Only taskers can upgrade to Pro" },
        { status: 403 }
      )
    }

    const now = new Date()
    const currentExpiry = user.proExpiresAt ? new Date(user.proExpiresAt) : null
    const newExpiry = currentExpiry && currentExpiry > now
      ? new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tier: "PRO",
        proExpiresAt: newExpiry,
      },
      select: {
        id: true,
        tier: true,
        proExpiresAt: true,
      },
    })

    return NextResponse.json({
      message: "Upgraded to Pro successfully",
      ...updated,
      expiresAt: newExpiry.toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upgrade to Pro" },
      { status: 500 }
    )
  }
}
