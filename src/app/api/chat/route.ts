import { NextRequest, NextResponse } from "next/server"

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

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        reply: "I'm sorry, the chat service is not configured yet. Please contact support directly.",
      })
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-10).map((msg: any) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Groq API error:", res.status, err)
      return NextResponse.json({ reply: "I'm sorry, I couldn't process that. Please try again." })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}
