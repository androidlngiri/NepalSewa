"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Loader2, Bot, User, Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  content: string
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
      <span className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
      <span className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
    </span>
  )
}

function ToolStatus({ tool, done }: { tool: string; done: boolean }) {
  const labels: Record<string, string> = {
    search_services: "Searching services",
    check_auth_status: "Checking login",
    create_booking_request: "Creating request",
  }
  return (
    <div className="text-muted-foreground flex items-center gap-2 px-3 py-1.5 text-xs">
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Search className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
      )}
      <span>{labels[tool] || tool}...</span>
    </div>
  )
}

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the NepalSewa assistant. Ask me anything about our services, or just tell me what you need done and I'll help you book a service.",
    },
  ])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [activeTools, setActiveTools] = useState<Record<string, boolean>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming, activeTools])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  async function sendMessage() {
    if (!input.trim() || streaming) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Please try again." },
        ])
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      let buffer = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop()!

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6)
          if (data === "[DONE]") continue

          try {
            const event = JSON.parse(data)

            if (event.type === "text") {
              assistantContent += event.content
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                }
                return updated
              })
            } else if (event.type === "tool_start") {
              setActiveTools((prev) => ({ ...prev, [event.tool]: false }))
            } else if (event.type === "tool_end") {
              setActiveTools((prev) => ({ ...prev, [event.tool]: true }))
              setTimeout(() => {
                setActiveTools((prev) => {
                  const next = { ...prev }
                  delete next[event.tool]
                  return next
                })
              }, 1500)
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Please try again." },
        ])
      }
    } finally {
      setStreaming(false)
      setActiveTools({})
      abortRef.current = null
    }
  }

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-20 z-50 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 lg:bottom-6"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {open && (
        <div className="bg-background fixed right-4 bottom-20 z-50 flex w-80 flex-col rounded-2xl border shadow-2xl lg:bottom-6 lg:w-96">
          <div className="flex items-center justify-between rounded-t-2xl bg-emerald-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="text-sm font-semibold">NepalSewa Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex h-80 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <Bot className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                )}
                <div
                  className={`prose prose-sm dark:prose-invert max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    msg.role === "user"
                      ? "prose-strong:text-white prose-code:text-white bg-emerald-600 text-white"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    msg.content ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <TypingDots />
                    )
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {Object.entries(activeTools).map(([tool, done]) => (
              <div key={tool} className="flex gap-2">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Bot className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <ToolStatus tool={tool} done={done} />
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t p-3">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your question..."
              className="bg-muted/50 flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={streaming}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
