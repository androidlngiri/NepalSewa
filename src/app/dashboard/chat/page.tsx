"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MessageSquare, Mail, Loader2, ArrowLeft, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import { ChatBox } from "@/components/chat/ChatBox"

interface Conversation {
  requestId: string
  requestTitle: string
  requestStatus: string
  otherUser: { id: string; name: string | null; image: string | null } | null
  lastMessage: { content: string; createdAt: string; senderId: string }
  unreadCount: number
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    fetch("/api/messages/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data)
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].requestId)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedId || !session?.user?.id) return
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: selectedId }),
    })
      .then(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c.requestId === selectedId ? { ...c, unreadCount: 0 } : c
          )
        )
      })
      .catch(() => {})
  }, [selectedId, session?.user?.id])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const selectedConv = conversations.find((c) => c.requestId === selectedId)

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col lg:flex-row gap-0 overflow-hidden rounded-2xl border bg-background">
      {/* Conversation list */}
      <div className={cn(
        "w-full shrink-0 border-r lg:w-80",
        selectedId ? "hidden lg:block" : "block"
      )}>
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Mail className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Messages</h2>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 52px)" }}>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Messages will appear when you interact with taskers
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.requestId}
                onClick={() => setSelectedId(conv.requestId)}
                className={cn(
                  "w-full text-left border-b px-4 py-3 transition-colors hover:bg-muted/50",
                  selectedId === conv.requestId && "bg-emerald-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {conv.otherUser?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {conv.otherUser?.name || "Unknown"}
                      </p>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatDate(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.requestTitle}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                      {conv.lastMessage.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                        {conv.requestStatus.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={cn(
        "flex flex-1 flex-col",
        !selectedId ? "hidden lg:flex" : "flex"
      )}>
        {selectedConv && session?.user?.id ? (
          <>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <button
                className="lg:hidden"
                onClick={() => setSelectedId(null)}
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                  {selectedConv.otherUser?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {selectedConv.otherUser?.name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {selectedConv.requestTitle}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-[10px] capitalize">
                {selectedConv.requestStatus.toLowerCase().replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatBox
                requestId={selectedConv.requestId}
                currentUserId={session.user.id}
                otherUserName={selectedConv.otherUser?.name || undefined}
                inline
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
            <MessageSquare className="h-14 w-14 text-muted-foreground/20 mb-4" />
            <p className="text-base font-medium text-muted-foreground">Select a conversation</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Choose a conversation from the left to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
