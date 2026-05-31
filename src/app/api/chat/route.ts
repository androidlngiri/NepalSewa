import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `You are the NepalSewa Butwal assistant — a friendly, knowledgeable helper for Butwal's local service marketplace.

Your job:
- Answer questions about how NepalSewa works (posting requests, bidding, pricing, payments via eSewa)
- Explain services available: plumbing, electrical, painting, cleaning, moving/delivery, tech support, tutoring, salon/spa
- Help users understand the bidding model (taskers bid, you choose)
- Guide taskers on how to sign up and find work
- Keep answers short, friendly, and practical
- If asked something outside NepalSewa scope, politely redirect
- When unsure, say you'll connect them to human support

Do NOT make up specific pricing, tasker counts, or availability numbers.
Do NOT give legal or financial advice.
Keep replies under 3 paragraphs.`

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        reply: "I'm sorry, the chat service is not configured yet. Please contact support directly.",
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    })

    const chat = model.startChat({
      history: (history || []).slice(-10).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    })

    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}
