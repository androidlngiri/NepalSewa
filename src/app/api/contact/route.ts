import { NextResponse } from "next/server"
import { resend, wrapHtml } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Server not configured for email" },
        { status: 500 }
      )
    }

    const safeName = name.replace(/[<>&"']/g, "")
    const safeEmail = email.replace(/[<>&"']/g, "")
    const safeMessage = message.replace(/[<>&"']/g, "")

    await resend.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: process.env.CONTACT_EMAIL || "admin@nepalsewa.com",
      subject: `Contact form message from ${safeName}`,
      html: wrapHtml(`
        <h2 style="font-size:18px;margin:0 0 16px">New Contact Form Submission</h2>
        <p style="font-size:14px;color:#374151;margin:0 0 8px"><strong>Name:</strong> ${safeName}</p>
        <p style="font-size:14px;color:#374151;margin:0 0 8px"><strong>Email:</strong> ${safeEmail}</p>
        <p style="font-size:14px;color:#374151;margin:0 0 8px"><strong>Message:</strong></p>
        <p style="font-size:14px;color:#374151;margin:0">${safeMessage}</p>
      `),
    })

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
