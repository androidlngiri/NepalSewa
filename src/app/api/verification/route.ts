import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isTasker: true },
    })

    if (!user?.isTasker) {
      return NextResponse.json({ error: "Only taskers can request verification" }, { status: 403 })
    }

    const body = await req.json()
    const { docUrl } = body

    if (!docUrl) {
      return NextResponse.json({ error: "Document URL is required" }, { status: 400 })
    }

    const existing = await prisma.verificationRequest.findFirst({
      where: { taskerId: session.user.id, status: "PENDING" },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending verification request" },
        { status: 409 },
      )
    }

    const verification = await prisma.verificationRequest.create({
      data: {
        id: crypto.randomUUID(),
        taskerId: session.user.id,
        docUrl,
      },
    })

    return NextResponse.json(verification, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to submit verification" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requests = await prisma.verificationRequest.findMany({
      where: { taskerId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: "Failed to fetch verification requests" }, { status: 500 })
  }
}
