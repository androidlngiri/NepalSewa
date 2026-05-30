"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, ArrowLeft, MapPin, IndianRupee, Clock, AlertCircle, User,
  Trash2, Ban, Mail, Phone, Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface RequestDetail {
  id: string
  title: string
  description: string
  status: string
  budget: number | null
  urgency: string | null
  wardNo: number | null
  location: string | null
  scheduledDate: string | null
  createdAt: string
  images: string[]
  service: { id: string; name: string; slug: string; price: number | null; priceUnit: string | null }
  user: { id: string; name: string | null; email: string; image: string | null; phone: string | null; wardNo: number | null }
  bids: {
    id: string
    amount: number
    status: string
    message: string | null
    createdAt: string
    tasker: { id: string; name: string | null; email: string; image: string | null; phone: string | null; rating: number | null }
  }[]
  taskerAssignments: {
    id: string
    status: string
    tasker: { id: string; name: string | null; email: string; image: string | null; phone: string | null }
  }[]
  transactions: { id: string; amount: number; status: string; type: string; reference: string | null }[]
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

function AdminRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")

  async function loadRequest() {
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${params.id}`)
      if (res.status === 404) {
        setRequest(null)
        return
      }
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setRequest(data)
    } catch {
      toast.error("Failed to load request details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequest() }, [params.id])

  async function handleCancel() {
    if (!confirm("Cancel this request?")) return
    setActionLoading("cancel")
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Request cancelled")
      loadRequest()
    } catch {
      toast.error("Failed to cancel request")
    } finally {
      setActionLoading("")
    }
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this request? This cannot be undone.")) return
    setActionLoading("delete")
    try {
      const res = await fetch(`/api/requests/${params.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Request deleted")
      router.push("/dashboard/admin/requests")
    } catch {
      toast.error("Failed to delete request")
      setActionLoading("")
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">Request not found</h3>
          <p className="text-sm text-muted-foreground">This request may have been deleted.</p>
        </div>
      </DashboardLayout>
    )
  }

  const activeAssignment = request.taskerAssignments?.[0]
  const canCancel = request.status === "OPEN" || request.status === "IN_PROGRESS"

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/admin/requests"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{request.title}</h1>
            <p className="text-muted-foreground">{request.service.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={!!actionLoading}
                className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <Ban className="h-4 w-4" />
                {actionLoading === "cancel" ? "Cancelling..." : "Cancel"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              {actionLoading === "delete" ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[request.status] || ""}>
                    {request.status.replace("_", " ")}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Created {formatDate(request.createdAt)}</span>
                </div>

                <p className="text-sm leading-relaxed">{request.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {request.budget && (
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span>Budget: <strong>{formatPrice(request.budget)}</strong></span>
                    </div>
                  )}
                  {request.service.price && (
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span>Service price: <strong>{formatPrice(request.service.price)}</strong>
                        {request.service.priceUnit ? `/${request.service.priceUnit}` : ""}
                      </span>
                    </div>
                  )}
                  {request.wardNo && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Ward {request.wardNo}</span>
                    </div>
                  )}
                  {request.urgency && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">Urgency: {request.urgency}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                </div>

                {request.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{request.location}</span>
                  </div>
                )}

                {request.images && request.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {request.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Image ${i + 1}`}
                        className="h-24 w-24 rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {request.bids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bids ({request.bids.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {request.bids.map((bid) => (
                    <div key={bid.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{bid.tasker?.name || "Unknown"}</span>
                            {bid.tasker?.rating && (
                              <span className="text-sm text-amber-500">
                                <Star className="h-3.5 w-3.5 inline mr-0.5" />
                                {bid.tasker.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {bid.message && (
                            <p className="text-sm text-muted-foreground mt-1">{bid.message}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{bid.tasker?.email}</span>
                            {bid.tasker?.phone && (
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{bid.tasker.phone}</span>
                            )}
                            <span>{formatDate(bid.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-lg font-bold text-emerald-600">
                            {formatPrice(bid.amount)}
                          </span>
                          <Badge variant="outline" className={
                            bid.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-700" :
                            bid.status === "REJECTED" ? "bg-red-50 text-red-700" :
                            "bg-blue-50 text-blue-700"
                          }>
                            {bid.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {request.transactions && request.transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y text-sm">
                    {request.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2">
                        <span>{formatPrice(tx.amount)} {tx.type ? `(${tx.type})` : ""}</span>
                        <Badge variant="outline" className={
                          tx.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                          tx.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                          tx.status === "FAILED" ? "bg-red-50 text-red-700" :
                          "bg-gray-50 text-gray-700"
                        }>
                          {tx.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-10 w-10 rounded-full bg-emerald-100 p-2 text-emerald-600" />
                  <div>
                    <p className="font-medium">{request.user.name || "Unnamed"}</p>
                    <p className="text-muted-foreground text-xs">Customer</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{request.user.email}</span>
                  </div>
                  {request.user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{request.user.phone}</span>
                    </div>
                  )}
                  {request.user.wardNo && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Ward {request.user.wardNo}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {activeAssignment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assigned Tasker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="h-10 w-10 rounded-full bg-amber-100 p-2 text-amber-600" />
                    <div>
                      <p className="font-medium">{activeAssignment.tasker.name || "Unknown"}</p>
                      <Badge variant="outline" className={statusColors[activeAssignment.status] || ""}>
                        {activeAssignment.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{activeAssignment.tasker.email}</span>
                    </div>
                    {activeAssignment.tasker.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{activeAssignment.tasker.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/admin/transactions?request=${request.id}`)}
                className="w-full"
              >
                View Related Transactions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminRequestDetailPage
