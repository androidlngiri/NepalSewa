"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  createdAt: string
  sender: { id: string; name: string | null; image: string | null }
}

interface ChatBoxProps {
  requestId: string
  currentUserId: string
  otherUserName?: string
}

export function ChatBox({ requestId, currentUserId, otherUserName }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/messages?requestId=${requestId}`)
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [requestId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, content: input.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to send")
        return
      }
      const msg = await res.json()
      setMessages((prev) => [...prev, msg])
      setInput("")
    } catch {
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Chat{otherUserName ? ` with ${otherUserName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[50vh] max-h-96 min-h-[300px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
                <p className="text-xs text-muted-foreground">Send a message to get started.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender.id === currentUserId
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                        {msg.sender.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`rounded-xl px-3 py-2 text-sm ${
                          isMe
                            ? "bg-emerald-500 text-white rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 px-1">
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button
              size="icon"
              className="h-11 w-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
              onClick={handleSend}
              disabled={sending || !input.trim()}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
