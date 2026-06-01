import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resend, wrapHtml } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
    }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: { identifier: `reset-${email}`, token, expires },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password/${token}`

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Reset your NepalSewa password",
        html: wrapHtml(`
          <p style="font-size:16px;margin:0 0 16px">Hi there,</p>
          <p style="font-size:14px;color:#374151;margin:0 0 16px">
            You requested a password reset. Click the button below to set a new password.
            This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px">
            Reset Password
          </a>
          <p style="font-size:13px;color:#6b7280;margin:24px 0 0">
            If you didn't request this, you can safely ignore this email.
          </p>
        `),
      })
    }

    return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
