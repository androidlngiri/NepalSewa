import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { sendSms } from "@/lib/sms"

function isValidNepaliPhone(phone: string): boolean {
  return /^(98|97|96)\d{8}$/.test(phone)
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const body = await req.json()
    const phone = body.phone?.trim()

    if (!phone || !isValidNepaliPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Must be a 10-digit Nepali number (98/97/96...)." },
        { status: 400 }
      )
    }

    const rateKey = `send-otp:${phone}`
    if (!rateLimit(rateKey, 1, 60000)) {
      return NextResponse.json(
        { error: "Please wait 1 minute before requesting another code." },
        { status: 429 }
      )
    }

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.oTPCode.create({
      data: { phone, code, expiresAt },
    })

    const message = `Your NepalSewa OTP is ${code}. Valid for 5 minutes.`
    const smsResult = await sendSms(phone, message)

    if (!smsResult.success) {
      console.warn("SMS send failed:", smsResult.error)
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      ...(!smsResult.success && { devOtp: code }),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
