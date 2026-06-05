"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface VerificationRequest {
  id: string
  docUrl: string
  status: string
  adminNotes: string | null
  createdAt: string
  reviewedAt: string | null
  tasker: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
    rating: number | null
  }
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
}

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set("status", filter)
      const res = await fetch(`/api/admin/verifications?${params}`)
      if (res.ok) setRequests(await res.json())
    } catch {
      toast.error("Failed to load verifications")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleApprove(id: string) {
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to approve")
        return
      }
      toast.success("Tasker verified!")
      fetchData()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setActionId(null)
    }
  }

  async function handleReject(id: string) {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", adminNotes: rejectNotes }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to reject")
        return
      }
      toast.success("Verification rejected")
      setShowRejectModal(null)
      setRejectNotes("")
      fetchData()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setActionId(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Verification Requests</h1>
            <p className="text-muted-foreground">
              Review and approve tasker identity verification.
            </p>
          </div>
          <Button variant="outline" className="h-11 w-11" onClick={fetchData} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex gap-2">
          {[null, "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status ?? "all"}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === status
                  ? "text-foreground bg-gray-100"
                  : "text-muted-foreground hover:bg-gray-50"
              }`}
            >
              {status || "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="text-muted-foreground/40 mb-4 h-12 w-12" />
              <h3 className="mb-1 text-lg font-medium">No verification requests</h3>
              <p className="text-muted-foreground text-sm">
                Tasker verification requests will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="bg-muted h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        {req.tasker.image ? (
                          <img
                            src={req.tasker.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-sm font-bold text-emerald-700">
                            {req.tasker.name?.charAt(0)?.toUpperCase() || "T"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{req.tasker.name}</p>
                          <Badge variant="outline" className={statusColors[req.status]}>
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {req.tasker.email} {req.tasker.phone && `• ${req.tasker.phone}`}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          Submitted {formatDate(req.createdAt)}
                          {req.reviewedAt && ` • Reviewed ${formatDate(req.reviewedAt)}`}
                        </p>
                        {req.adminNotes && (
                          <p className="mt-1 text-xs text-red-600">Reason: {req.adminNotes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={req.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                      >
                        View Document
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {req.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setShowRejectModal(req.id)}
                            disabled={actionId === req.id}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => handleApprove(req.id)}
                            disabled={actionId === req.id}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reject Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Reason for rejection (required)</Label>
                  <Textarea
                    placeholder="e.g., Document is blurry, name doesn't match..."
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(null)
                      setRejectNotes("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(showRejectModal)}
                    disabled={actionId === showRejectModal || !rejectNotes.trim()}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
