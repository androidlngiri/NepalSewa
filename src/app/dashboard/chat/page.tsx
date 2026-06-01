"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, Mail, Loader2, ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import { ChatBox } from "@/components/chat/ChatBox"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

interface Conversation {
  requestId: string
  requestTitle: string
  requestStatus: string
  otherUser: { id: string; name: string | null; image: string | null } | null
  lastMessage: { content: string; createdAt: string; senderId: string }
  unreadCount: number
}

export default function ChatPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role?.toLowerCase() || "user") as "user" | "tasker" | "admin"
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
          prev.map((c) => (c.requestId === selectedId ? { ...c, unreadCount: 0 } : c)),
        )
      })
      .catch(() => {})
  }, [selectedId, session?.user?.id])

  const selectedConv = conversations.find((c) => c.requestId === selectedId)

  return (
    <DashboardLayout role={role}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="bg-background flex h-[calc(100dvh-8rem)] flex-col gap-0 overflow-hidden rounded-2xl border lg:flex-row">
          {/* Conversation list */}
          <div
            className={cn(
              "w-full shrink-0 border-r lg:w-80",
              selectedId ? "hidden lg:block" : "block",
            )}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Mail className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold">Messages</h2>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 52px)" }}>
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                  <MessageSquare className="text-muted-foreground/30 mb-3 h-10 w-10" />
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                  <p className="text-muted-foreground/60 mt-1 text-xs">
                    Messages will appear when you interact with taskers
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.requestId}
                    onClick={() => setSelectedId(conv.requestId)}
                    className={cn(
                      "hover:bg-muted/50 w-full border-b px-4 py-3 text-left transition-colors",
                      selectedId === conv.requestId && "bg-emerald-50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                          {conv.otherUser?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {conv.otherUser?.name || "Unknown"}
                          </p>
                          <span className="text-muted-foreground shrink-0 text-[11px]">
                            {formatDate(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {conv.requestTitle}
                        </p>
                        <p className="text-muted-foreground/70 mt-0.5 truncate text-xs">
                          {conv.lastMessage.content}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-4 px-1.5 py-0 text-[10px] capitalize"
                          >
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
          <div className={cn("flex flex-1 flex-col", !selectedId ? "hidden lg:flex" : "flex")}>
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
                    <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                      {selectedConv.otherUser?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedConv.otherUser?.name || "Unknown"}
                    </p>
                    <p className="text-muted-foreground max-w-[200px] truncate text-xs">
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
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <MessageSquare className="text-muted-foreground/20 mb-4 h-14 w-14" />
                <p className="text-muted-foreground text-base font-medium">Select a conversation</p>
                <p className="text-muted-foreground/60 mt-1 text-sm">
                  Choose a conversation from the left to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
