import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { chatLoop, SYSTEM_PROMPT } from "@/lib/chat-tools"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Chat service is not configured. Please contact support.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const session = await auth()

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-10).map((msg: any) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatLoop(messages, session, apiKey)) {
            if (chunk.startsWith("__TOOL_START__:")) {
              const toolName = chunk.slice("__TOOL_START__:".length)
              const event = JSON.stringify({ type: "tool_start", tool: toolName })
              controller.enqueue(encoder.encode(`data: ${event}\n\n`))
            } else if (chunk.startsWith("__TOOL_END__:")) {
              const toolName = chunk.slice("__TOOL_END__:".length)
              const event = JSON.stringify({ type: "tool_end", tool: toolName })
              controller.enqueue(encoder.encode(`data: ${event}\n\n`))
            } else {
              const event = JSON.stringify({ type: "text", content: chunk })
              controller.enqueue(encoder.encode(`data: ${event}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } catch (err) {
          console.error("Chat stream error:", err)
          const event = JSON.stringify({
            type: "text",
            content: "I'm sorry, something went wrong. Please try again.",
          })
          controller.enqueue(encoder.encode(`data: ${event}\n\n`))
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat error:", error)
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
