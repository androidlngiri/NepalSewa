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
      select: { portfolioImages: true },
    })

    return NextResponse.json({ images: user?.portfolioImages || [] })
  } catch {
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { portfolioImages: true, isTasker: true },
    })

    if (!user?.isTasker) {
      return NextResponse.json({ error: "Only taskers can manage portfolio" }, { status: 403 })
    }

    const currentImages = user.portfolioImages || []
    if (currentImages.length >= 20) {
      return NextResponse.json(
        { error: "Portfolio limit reached (max 20 images)" },
        { status: 400 },
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { portfolioImages: [...currentImages, imageUrl] },
    })

    return NextResponse.json({ images: [...currentImages, imageUrl] })
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get("imageUrl")

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { portfolioImages: true },
    })

    const updated = (user?.portfolioImages || []).filter((url) => url !== imageUrl)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { portfolioImages: updated },
    })

    return NextResponse.json({ images: updated })
  } catch {
    return NextResponse.json({ error: "Failed to remove image" }, { status: 500 })
  }
}
