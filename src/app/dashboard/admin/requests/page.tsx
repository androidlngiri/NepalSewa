"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, ArrowLeft, ClipboardList, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"

const LIMIT = 20

interface RequestItem {
  id: string
  title: string
  status: string
  budget: number | null
  createdAt: string
  user: { name: string | null }
  service: { name: string }
  bids: { id: string }[]
  taskerAssignments: { id: string; status: string }[]
}

const statuses = ["ALL", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

const tabStyles: Record<string, string> = {
  ALL: "bg-gray-100 text-gray-700",
  OPEN: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
}

function AdminRequestsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const statusFilter = searchParams.get("status") || ""
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ role: "admin", page: String(page), limit: String(LIMIT) })
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/requests?${params}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      if (data.requests) {
        setRequests(data.requests)
        setTotal(data.total || 0)
      } else {
        setRequests(data)
        setTotal(data.length)
      }
    } catch {
      setError("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  function setStatus(s: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (s && s !== "ALL") params.set("status", s)
    else params.delete("status")
    router.replace(`/dashboard/admin/requests?${params}`)
    setPage(1)
  }

  const activeStatus = statusFilter || "ALL"

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
          <p className="text-muted-foreground">
            {activeStatus !== "ALL"
              ? `Showing ${activeStatus.replace("_", " ").toLowerCase()} requests`
              : "Browse all platform requests."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeStatus === s
                  ? `${tabStyles[s]} ring-2 ring-offset-1 ring-emerald-500/50`
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
          <Button variant="ghost" size="icon" className="ml-auto" onClick={fetchRequests} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-medium mb-1">Failed to load requests</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={fetchRequests} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : loading && requests.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No requests found</h3>
                <p className="text-sm text-muted-foreground">
                  {activeStatus !== "ALL"
                    ? `No requests with status "${activeStatus.replace("_", " ")}".`
                    : "No requests have been posted yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {requests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/dashboard/admin/requests/${req.id}`}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{req.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {req.service.name} • {req.user.name || "Unknown"} •{" "}
                        {formatDate(req.createdAt)} • {req.bids.length} bids
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {req.budget && (
                        <span className="text-sm font-medium text-emerald-600">
                          {formatPrice(req.budget)}
                        </span>
                      )}
                      <Badge variant="outline" className={statusColors[req.status] || ""}>
                        {req.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
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
      </div>
    </DashboardLayout>
  )
}

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    }>
      <AdminRequestsContent />
    </Suspense>
  )
}
