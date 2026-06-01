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
  Send,
  CheckCircle2,
  TrendingUp,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { ChatBox } from "@/components/chat/ChatBox"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface JobDetail {
  id: string
  title: string
  description: string
  status: string
  budget: number | null
  urgency: string | null
  location: string | null
  createdAt: string
  service: { id: string; name: string; slug: string }
  user: { id: string; name: string; image: string | null }
  myBid?: { id: string; amount: number; status: string }
  taskerAssignments?: { id: string; status: string }[]
}

export default function TaskerJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [reqRes, bidRes, sessionRes] = await Promise.all([
          fetch("/api/requests"),
          fetch("/api/bids"),
          fetch("/api/auth/session"),
        ])
        if (sessionRes.ok) {
          const sess = await sessionRes.json()
          setCurrentUserId(sess?.user?.id || null)
        }
        if (reqRes.ok) {
          const jobs = await reqRes.json()
          const list = Array.isArray(jobs) ? jobs : []
          const found = list.find((j: any) => j.id === params.id)
          if (found && bidRes.ok) {
            const myBids = await bidRes.json()
            found.myBid = (Array.isArray(myBids) ? myBids : []).find(
              (b: any) => b.requestId === params.id,
            )
            found.taskerAssignments = found.taskerAssignments || []
          }
          setJob(found || null)
        }
      } catch {
        toast.error("Failed to load job")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleBid() {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount")
      return
    }
    setBidding(true)
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: params.id, amount: bidAmount, message: bidMessage }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to place bid")
        return
      }
      toast.success("Bid placed successfully!")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBidding(false)
    }
  }

  async function handleMarkComplete(assignmentId: string) {
    setMarkingComplete(true)
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "AWAITING_CONFIRMATION" }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to mark as complete")
        return
      }
      toast.success("Marked as complete! Waiting for customer confirmation.")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setMarkingComplete(false)
    }
  }

  const assignment = job?.taskerAssignments?.[0]

  if (loading) {
    return (
      <DashboardLayout role="tasker">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout role="tasker">
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <AlertCircle className="text-muted-foreground/40 mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">Job not found</h3>
          <p className="text-muted-foreground text-sm">This job posting may have been removed.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="tasker">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/dashboard/tasker/jobs"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">{job.service.name}</p>
              </div>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                {job.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{job.description}</p>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {job.budget && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="text-muted-foreground h-4 w-4" />
                  <span>
                    Budget: <strong>{formatPrice(job.budget)}</strong>
                  </span>
                </div>
              )}
              {job.urgency && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-muted-foreground h-4 w-4" />
                  <span className="capitalize">Urgency: {job.urgency}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>

            {job.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="mb-1 text-sm font-medium">Posted by</p>
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 rounded-full bg-emerald-100 p-1.5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">{job.user?.name || "Unknown User"}</p>
                </div>
              </div>
            </div>

            {assignment && (
              <div className="border-t pt-4">
                <p className="mb-2 text-sm font-medium">Assignment Status</p>
                <Badge
                  variant="outline"
                  className={
                    assignment.status === "IN_PROGRESS"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : assignment.status === "AWAITING_CONFIRMATION"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : assignment.status === "COMPLETED"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                  }
                >
                  {assignment.status.replace("_", " ")}
                </Badge>
                {assignment.status === "IN_PROGRESS" && (
                  <Button
                    onClick={() => handleMarkComplete(assignment.id)}
                    disabled={markingComplete}
                    className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  >
                    {markingComplete ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Mark as Complete
                  </Button>
                )}
              </div>
            )}

            {job.status === "OPEN" && !job.myBid && (
              <div className="border-t pt-4">
                <div className="space-y-4 rounded-xl border-2 border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                      <Zap className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">Place Your Bid</h4>
                      <p className="text-muted-foreground text-xs">
                        Win this job by offering your best price
                      </p>
                    </div>
                  </div>

                  {job.budget && (
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 text-sm">
                      <span className="text-emerald-700">Suggested budget</span>
                      <span className="font-bold text-emerald-700">{formatPrice(job.budget)}</span>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="bidAmount" className="text-sm font-medium">
                      Your Price (NPR) *
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="e.g., 5000"
                      className="mt-1.5 h-12 text-base"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bidMessage" className="text-sm font-medium">
                      Why you? (optional)
                    </Label>
                    <Textarea
                      id="bidMessage"
                      placeholder="Briefly describe your experience or approach..."
                      rows={2}
                      className="mt-1.5"
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleBid}
                    disabled={bidding}
                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white"
                  >
                    {bidding ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Submit Bid
                  </Button>
                  <p className="text-muted-foreground text-center text-xs">
                    <TrendingUp className="mr-1 inline h-3 w-3" />
                    Lower prices and faster responses win more jobs
                  </p>
                </div>
              </div>
            )}

            {job.myBid && !assignment && (
              <div className="border-t pt-4">
                <div
                  className={`rounded-xl border p-4 ${
                    job.myBid.status === "PENDING"
                      ? "border-amber-200 bg-amber-50"
                      : job.myBid.status === "ACCEPTED"
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          job.myBid.status === "PENDING"
                            ? "text-amber-800"
                            : job.myBid.status === "ACCEPTED"
                              ? "text-emerald-800"
                              : "text-red-800"
                        }`}
                      >
                        Your Bid: {formatPrice(job.myBid.amount)}
                      </p>
                      <p
                        className={`text-xs ${
                          job.myBid.status === "PENDING"
                            ? "text-amber-600"
                            : job.myBid.status === "ACCEPTED"
                              ? "text-emerald-600"
                              : "text-red-600"
                        }`}
                      >
                        {job.myBid.status === "PENDING"
                          ? "Waiting for customer to accept"
                          : job.myBid.status === "ACCEPTED"
                            ? "Accepted! Start working"
                            : "Not selected"}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        job.myBid.status === "PENDING"
                          ? "text-amber-600"
                          : job.myBid.status === "ACCEPTED"
                            ? "text-emerald-600"
                            : "text-red-600"
                      }`}
                    >
                      {formatPrice(job.myBid.amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {assignment && currentUserId && (
          <ChatBox requestId={job.id} currentUserId={currentUserId} otherUserName={job.user.name} />
        )}
      </div>
    </DashboardLayout>
  )
}
