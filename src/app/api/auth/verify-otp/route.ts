import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    if (!rateLimit(`verify-otp:${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const phone = body.phone?.trim()
    const code = body.code?.trim()

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and code are required." },
        { status: 400 }
      )
    }

    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 }
      )
    }

    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    let user = await prisma.user.findUnique({ where: { phone } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: "USER",
          phoneVerified: true,
        },
      })
    } else if (!user.phoneVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isTasker: user.isTasker,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
