"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, ArrowLeft, MapPin, IndianRupee, Clock, AlertCircle, User,
  CheckCircle2, Wallet, ThumbsUp, Star,
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
  wardNo: number | null
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
        const [reqRes, txRes, sessionRes] = await Promise.all([
          fetch(`/api/requests?role=user`),
          fetch(`/api/payments`),
          fetch("/api/auth/session"),
        ])
        if (sessionRes.ok) {
          const sess = await sessionRes.json()
          setCurrentUserId(sess?.user?.id || null)
        }
        if (reqRes.ok) {
          const requests = await reqRes.json()
          const list: RequestDetail[] = Array.isArray(requests) ? requests : []
          const found: RequestDetail | null = list.find((r: any) => r.id === params.id) || null
          if (found && txRes.ok) {
            const transactions = await txRes.json()
            found.transactions = (Array.isArray(transactions) ? transactions : []).filter((t: any) => t.requestId === params.id)
          }
          setRequest(found)
        }
      } catch {
        toast.error("Failed to load request")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleAcceptBid(bidId: string) {
    try {
      const res = await fetch(`/api/bids/${bidId}/accept`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to accept bid")
        return
      }
      toast.success("Tasker assigned!")
      router.refresh()
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
      router.refresh()
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
      router.refresh()
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
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">Request not found</h3>
          <p className="text-sm text-muted-foreground">This request may have been deleted.</p>
        </div>
      </DashboardLayout>
    )
  }

  const activeAssignment = request.taskerAssignments?.[0]
  const pendingBids = (request.bids || []).filter((b) => b.status === "PENDING")

  return (
    <DashboardLayout role="user">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/user/requests"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
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
                <p className="text-sm text-muted-foreground mt-1">
                  {request.service.name}
                </p>
              </div>
              <Badge variant="outline" className={statusColors[request.status] || ""}>
                {request.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{request.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {request.budget && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span>Budget: <strong>{formatPrice(request.budget)}</strong></span>
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
          </CardContent>
        </Card>

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

        {activeAssignment && (request.status === "IN_PROGRESS" || request.status === "AWAITING_CONFIRMATION") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-500" />
                {activeAssignment.status === "AWAITING_CONFIRMATION" ? "Confirm Completion" : "Payment"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAssignment.status === "AWAITING_CONFIRMATION" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
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
              ) : (() => {
                const paymentTx = request.transactions?.find(t => t.status === "COMPLETED")
                const pendingTx = request.transactions?.find(t => t.status === "PENDING")
                if (paymentTx) {
                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-emerald-600">Payment Completed</p>
                        <p className="text-sm text-muted-foreground">
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
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(request.budget || 0)}
                          </p>
                        </div>
                        <PaymentStatus transactionId={pendingTx.id} initialStatus="PENDING" />
                      </div>
                      <EsewaPayButton
                        requestId={request.id}
                        amount={request.budget || 0}
                      />
                    </div>
                  )
                }
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pay for this service</p>
                        <p className="text-sm text-muted-foreground">
                          Amount: {formatPrice(request.budget || 0)}
                        </p>
                      </div>
                    </div>
                    <EsewaPayButton
                      requestId={request.id}
                      amount={request.budget || 0}
                    />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>
                    <CashPayButton
                      requestId={request.id}
                      amount={request.budget || 0}
                    />
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {request.status === "COMPLETED" && activeAssignment && (() => {
          const existingReview = (request.reviews || []).find(
            (r) => r.reviewerId === currentUserId && r.revieweeId === activeAssignment.tasker.id
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
                      <p className="text-sm text-muted-foreground">&ldquo;{existingReview.comment}&rdquo;</p>
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
                          className="transition-colors p-1"
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
                      className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none"
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
              <CardTitle>Bids ({pendingBids.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingBids.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No bids yet. Check back soon.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{bid.tasker?.name || "Unknown Tasker"}</p>
                            {bid.tasker.rating && (
                              <span className="text-sm text-amber-500">
                                ★ {bid.tasker.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {bid.message && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {bid.message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-lg font-bold text-emerald-600">
                            {formatPrice(bid.amount)}
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
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
