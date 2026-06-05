import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const where: any = {}
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      where.status = status
    }

    const requests = await prisma.verificationRequest.findMany({
      where,
      include: {
        tasker: {
          select: { id: true, name: true, email: true, phone: true, image: true, rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: "Failed to fetch verification requests" }, { status: 500 })
  }
}
