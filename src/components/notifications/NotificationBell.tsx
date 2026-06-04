"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Bell, CheckCheck, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const notificationsHref =
    session?.user?.role === "ADMIN" ? "/dashboard/admin/notifications" : "/dashboard/notifications"

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=5")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  async function handleMarkRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function handleMarkAllRead() {
    await fetch("/api/notifications/mark-all-read", { method: "POST" })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground relative h-9 w-9"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="bg-card absolute top-full right-0 z-50 mt-2 w-80 rounded-xl border shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Bell className="text-muted-foreground/40 mb-2 h-8 w-8" />
                <p className="text-muted-foreground text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 border-b px-4 py-3 transition-colors last:border-0",
                    !n.read ? "bg-emerald-50/50" : "hover:bg-muted/30",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    {n.message && (
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                        {n.message}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => {
                          if (!n.read) handleMarkRead(n.id)
                          setOpen(false)
                        }}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t px-4 py-2.5">
            <Link
              href={notificationsHref}
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
