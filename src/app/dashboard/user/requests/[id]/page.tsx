"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2,
  ArrowLeft,
  MapPin,
  IndianRupee,
  Clock,
  AlertCircle,
  User,
  CheckCircle2,
  Wallet,
  ThumbsUp,
  Star,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EsewaPayButton } from "@/components/payments/eSewaPayButton"
import { CashPayButton } from "@/components/payments/CashPayButton"
import { PaymentStatus } from "@/components/payments/PaymentStatus"
import { ChatBox } from "@/components/chat/ChatBox"
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
  location: string | null
  scheduledDate: string | null
  createdAt: string
  service: { id: string; name: string; slug: string }
  user: { id: string; name: string; image: string | null }
  bids: {
    id: string
    amount: number
    status: string
    message: string | null
    createdAt: string
    tasker: { id: string; name: string; image: string | null; rating: number | null }
  }[]
  taskerAssignments: {
    id: string
    status: string
    tasker: { id: string; name: string; image: string | null }
  }[]
  reviews?: {
    id: string
    rating: number
    comment: string | null
    reviewerId: string
    revieweeId: string
  }[]
  transactions?: {
    id: string
    amount: number
    status: string
  }[]
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  AWAITING_CONFIRMATION: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

export default function UserRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [detailRes, sessionRes] = await Promise.all([
          fetch(`/api/requests/${params.id}`),
          fetch("/api/auth/session"),
        ])
        if (sessionRes.ok) {
          const sess = await sessionRes.json()
          setCurrentUserId(sess?.user?.id || null)
        }
        if (detailRes.ok) {
          setRequest(await detailRes.json())
        } else if (detailRes.status === 403) {
          toast.error("You don't have access to this request")
        } else if (detailRes.status === 404) {
          setRequest(null)
        }
      } catch {
        toast.error("Failed to load request")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function refreshData() {
    try {
      const res = await fetch(`/api/requests/${params.id}`)
      if (res.ok) setRequest(await res.json())
    } catch {
      // silent
    }
  }

  async function handleAcceptBid(bidId: string) {
    try {
      const res = await fetch(`/api/bids/${bidId}/accept`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to accept bid")
        return
      }
      toast.success("Tasker assigned!")
      await refreshData()
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleSubmitReview(taskerId: string) {
    if (reviewRating < 1) {
      toast.error("Please select a rating")
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: taskerId,
          requestId: params.id,
          rating: reviewRating,
          comment: reviewComment || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to submit review")
        return
      }
      toast.success("Review submitted!")
      setReviewRating(0)
      setReviewComment("")
      await refreshData()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleConfirmCompletion(assignmentId: string) {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to confirm completion")
        return
      }
      toast.success("Job confirmed as complete!")
      await refreshData()
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleCancelRequest() {
    if (!confirm("Are you sure you want to cancel this request?")) return
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to cancel request")
        return
      }
      toast.success("Request cancelled")
      await refreshData()
    } catch {
      toast.error("Something went wrong")
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout role="user">
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <AlertCircle className="text-muted-foreground/40 mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">Request not found</h3>
          <p className="text-muted-foreground text-sm">This request may have been deleted.</p>
        </div>
      </DashboardLayout>
    )
  }

  const activeAssignment = request.taskerAssignments?.[0]
  const pendingBids = (request.bids || []).filter((b) => b.status === "PENDING")

  return (
    <DashboardLayout role="user">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/dashboard/user/requests"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{request.title}</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">{request.service.name}</p>
              </div>
              <Badge variant="outline" className={statusColors[request.status] || ""}>
                {request.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{request.description}</p>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {request.budget && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="text-muted-foreground h-4 w-4" />
                  <span>
                    Budget: <strong>{formatPrice(request.budget)}</strong>
                  </span>
                </div>
              )}
              {request.urgency && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-muted-foreground h-4 w-4" />
                  <span className="capitalize">Urgency: {request.urgency}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span>{formatDate(request.createdAt)}</span>
              </div>
            </div>

            {request.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span>{request.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {["OPEN", "IN_PROGRESS"].includes(request.status) && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleCancelRequest}
            >
              Cancel Request
            </Button>
          </div>
        )}

        {activeAssignment && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Tasker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-10 w-10 rounded-full bg-emerald-100 p-2 text-emerald-600" />
                  <div>
                    <p className="font-medium">{activeAssignment.tasker.name}</p>
                    <Badge variant="outline" className={statusColors[activeAssignment.status]}>
                      {activeAssignment.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeAssignment && currentUserId && (
          <ChatBox
            requestId={request.id}
            currentUserId={currentUserId}
            otherUserName={activeAssignment.tasker.name}
          />
        )}

        {activeAssignment && request.status === "IN_PROGRESS" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-500" />
                {activeAssignment.status === "AWAITING_CONFIRMATION"
                  ? "Confirm Completion"
                  : "Payment"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAssignment.status === "AWAITING_CONFIRMATION" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    The tasker has marked this job as complete. Please review the work and confirm.
                  </p>
                  <Button
                    onClick={() => handleConfirmCompletion(activeAssignment.id)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Confirm Completion
                  </Button>
                </div>
              ) : (
                (() => {
                  const paymentTx = request.transactions?.find((t) => t.status === "COMPLETED")
                  const pendingTx = request.transactions?.find((t) => t.status === "PENDING")
                  if (paymentTx) {
                    return (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-600">Payment Completed</p>
                          <p className="text-muted-foreground text-sm">
                            {formatPrice(request.budget || 0)}
                          </p>
                        </div>
                        <PaymentStatus transactionId={paymentTx.id} initialStatus="COMPLETED" />
                      </div>
                    )
                  }
                  if (pendingTx) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Payment Pending</p>
                            <p className="text-muted-foreground text-sm">
                              {formatPrice(request.budget || 0)}
                            </p>
                          </div>
                          <PaymentStatus transactionId={pendingTx.id} initialStatus="PENDING" />
                        </div>
                        <EsewaPayButton requestId={request.id} amount={request.budget || 0} />
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Pay for this service</p>
                          <p className="text-muted-foreground text-sm">
                            Amount: {formatPrice(request.budget || 0)}
                          </p>
                        </div>
                      </div>
                      <EsewaPayButton requestId={request.id} amount={request.budget || 0} />
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card text-muted-foreground px-2">or</span>
                        </div>
                      </div>
                      <CashPayButton requestId={request.id} amount={request.budget || 0} />
                    </div>
                  )
                })()
              )}
            </CardContent>
          </Card>
        )}

        {request.status === "COMPLETED" &&
          activeAssignment &&
          (() => {
            const existingReview = (request.reviews || []).find(
              (r) => r.reviewerId === currentUserId && r.revieweeId === activeAssignment.tasker.id,
            )
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    {existingReview ? "Your Review" : "Leave a Review"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {existingReview ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`h-4 w-4 ${
                              j < existingReview.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      {existingReview.comment && (
                        <p className="text-muted-foreground text-sm">
                          &ldquo;{existingReview.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => setReviewRating(j + 1)}
                            className="p-1 transition-colors"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                j < reviewRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted hover:fill-amber-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Share your experience (optional)"
                        className="border-input w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm"
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                      <Button
                        onClick={() => handleSubmitReview(activeAssignment.tasker.id)}
                        disabled={submittingReview}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      >
                        {submittingReview ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        Submit Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}

        {request.status === "OPEN" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Bids ({pendingBids.length})
                </CardTitle>
                {pendingBids.length > 0 && (
                  <span className="text-muted-foreground text-xs">Sorted by price</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pendingBids.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="mb-1 text-sm font-medium">Waiting for bids</h3>
                  <p className="text-muted-foreground mx-auto max-w-xs text-sm">
                    Taskers are reviewing your request. You&apos;ll be notified when a bid comes in.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...pendingBids]
                    .sort((a, b) => a.amount - b.amount)
                    .map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                          index === 0
                            ? "border-emerald-300 bg-emerald-50/30"
                            : "hover:border-emerald-100"
                        }`}
                      >
                        {index === 0 && pendingBids.length > 1 && (
                          <div className="absolute -top-2.5 right-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                              <TrendingUp className="h-3 w-3" />
                              Best Price
                            </span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                                {bid.tasker?.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {bid.tasker?.name || "Unknown Tasker"}
                                </p>
                                {bid.tasker.rating && (
                                  <span className="flex items-center gap-1 text-xs text-amber-500">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {bid.tasker.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {bid.message && (
                              <p className="text-muted-foreground mt-2 ml-10 line-clamp-2 text-sm">
                                &ldquo;{bid.message}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <div className="text-right">
                              <span
                                className={`text-xl font-bold ${
                                  index === 0 ? "text-emerald-600" : "text-gray-700"
                                }`}
                              >
                                {formatPrice(bid.amount)}
                              </span>
                              {index === 0 && pendingBids.length > 1 && (
                                <p className="text-[10px] font-medium text-emerald-500">
                                  Lowest bid
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-white hover:from-emerald-600 hover:to-teal-700"
                              onClick={() => handleAcceptBid(bid.id)}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
