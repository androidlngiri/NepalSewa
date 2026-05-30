"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, ArrowLeft, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"

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

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

function AdminRequestsContent() {
  const searchParams = useSearchParams()
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const statusFilter = searchParams.get("status")

  useEffect(() => {
    const params = new URLSearchParams({ role: "admin" })
    if (statusFilter) params.set("status", statusFilter)
    fetch(`/api/requests?${params}`)
      .then((r) => r.json())
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter])

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
          <h1 className="text-2xl font-bold tracking-tight">
            {statusFilter ? `${statusFilter.replace("_", " ")} Requests` : "All Requests"}
          </h1>
          <p className="text-muted-foreground">
            {statusFilter
              ? `Showing requests with status: ${statusFilter.replace("_", " ")}`
              : "Browse all platform requests."}
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No requests found</h3>
                <p className="text-sm text-muted-foreground">
                  {statusFilter
                    ? `No requests with status "${statusFilter.replace("_", " ")}".`
                    : "No requests have been posted yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {requests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/dashboard/user/requests/${req.id}`}
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
