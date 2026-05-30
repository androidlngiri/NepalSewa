"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, ArrowLeft, MapPin, IndianRupee, Clock, AlertCircle, User, Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface JobDetail {
  id: string
  title: string
  description: string
  status: string
  budget: number | null
  urgency: string | null
  wardNo: number | null
  location: string | null
  createdAt: string
  service: { id: string; name: string; slug: string }
  user: { id: string; name: string; image: string | null; wardNo: number | null }
  myBid?: { id: string; amount: number; status: string }
}

export default function TaskerJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [reqRes, bidRes] = await Promise.all([
          fetch("/api/requests"),
          fetch("/api/bids"),
        ])
        if (reqRes.ok) {
          const jobs = await reqRes.json()
          const list = Array.isArray(jobs) ? jobs : []
          const found = list.find((j: any) => j.id === params.id)
          if (found && bidRes.ok) {
            const myBids = await bidRes.json()
            found.myBid = (Array.isArray(myBids) ? myBids : []).find((b: any) => b.requestId === params.id)
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
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">Job not found</h3>
          <p className="text-sm text-muted-foreground">This job posting may have been removed.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="tasker">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/tasker/jobs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
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
                <p className="text-sm text-muted-foreground mt-1">
                  {job.service.name}
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{job.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.budget && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span>Budget: <strong>{formatPrice(job.budget)}</strong></span>
                </div>
              )}
              {job.wardNo && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Ward {job.wardNo}</span>
                </div>
              )}
              {job.urgency && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">Urgency: {job.urgency}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>

            {job.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-1">Posted by</p>
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 rounded-full bg-emerald-100 p-1.5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">{job.user?.name || "Unknown User"}</p>
                  {job.user.wardNo && (
                    <p className="text-xs text-muted-foreground">
                      Ward {job.user.wardNo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {job.status === "OPEN" && !job.myBid && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-medium">Place a Bid</h4>
                <div>
                  <Label htmlFor="bidAmount">Your Price (NPR)</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    placeholder="e.g., 5000"
                    className="h-10 mt-1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="bidMessage">Message (optional)</Label>
                  <Textarea
                    id="bidMessage"
                    placeholder="Describe your experience or approach..."
                    rows={2}
                    className="mt-1"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleBid}
                  disabled={bidding}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                >
                  {bidding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Bid
                </Button>
              </div>
            )}

            {job.myBid && (
              <div className="border-t pt-4">
                <Badge variant="outline" className={
                  job.myBid.status === "PENDING"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : job.myBid.status === "ACCEPTED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }>
                  Your bid: {formatPrice(job.myBid.amount)} — {job.myBid.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
