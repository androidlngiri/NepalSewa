"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Loader2,
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, cn } from "@/lib/utils"

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  read: boolean
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  const LIMIT = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/notifications?page=${page}&limit=${LIMIT}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setNotifications(data.notifications || [])
      setTotal(data.total || 0)
      setUnreadCount(data.unreadCount || 0)
    } catch {
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/admin"
              className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllRead} className="gap-1.5">
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              className="h-11 w-11"
              onClick={fetchData}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
              <h3 className="mb-1 text-lg font-medium">Failed to load notifications</h3>
              <p className="text-muted-foreground mb-4 text-sm">{error}</p>
              <Button variant="outline" onClick={fetchData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : loading && notifications.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="text-muted-foreground/20 mb-4 h-16 w-16" />
              <h3 className="mb-1 text-lg font-medium">No notifications yet</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                When users post requests, taskers bid, or jobs are completed, you&apos;ll see it
                here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="divide-y p-0">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-4 px-4 py-4 transition-colors sm:px-6",
                      !n.read ? "bg-emerald-50/50" : "hover:bg-muted/30",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        !n.read ? "bg-emerald-500" : "bg-transparent",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      {n.message && (
                        <p className="text-muted-foreground mt-0.5 text-sm">{n.message}</p>
                      )}
                    </div>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => {
                          if (!n.read) handleMarkRead(n.id)
                        }}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <p className="text-muted-foreground text-sm">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
