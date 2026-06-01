import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isTasker: true,
        tier: true,
        proExpiresAt: true,
        wardNo: true,
        address: true,
        bio: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, wardNo, address, bio, isTasker } = body

    function sanitize(str: string | undefined): string | undefined {
      return str ? str.replace(/[<>&"']/g, "").trim() : undefined
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: sanitize(name) }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone }),
        ...(wardNo !== undefined && { wardNo: wardNo ? parseInt(wardNo) : null }),
        ...(address !== undefined && { address }),
        ...(bio !== undefined && { bio: sanitize(bio) }),
        ...(isTasker !== undefined && { isTasker }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isTasker: true,
        wardNo: true,
        address: true,
        bio: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
