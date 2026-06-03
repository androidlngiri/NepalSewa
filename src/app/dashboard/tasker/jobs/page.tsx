"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Loader2,
  ArrowLeft,
  Briefcase,
  Send,
  Users,
  Timer,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface OpenRequest {
  id: string
  title: string
  description: string
  budget: number | null
  urgency: string | null
  location: string | null
  createdAt: string
  status: string
  service: { id: string; name: string; slug: string }
  user: { id: string; name: string; image: string | null }
  bids: { id: string }[]
}

export default function TaskerJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<OpenRequest[]>([])
  const [filtered, setFiltered] = useState<OpenRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [biddingId, setBiddingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bidsPlaced, setBidsPlaced] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/requests?role=tasker")
      .then((r) => r.json())
      .then((data) => {
        setJobs(data)
        setFiltered(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = jobs
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.service.name.toLowerCase().includes(q),
      )
    }
    setFiltered(result)
  }, [search, jobs])

  async function handleBid(requestId: string) {
    if (!bidAmount) {
      toast.error("Please enter a bid amount")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          amount: bidAmount,
          message: bidMessage || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to place bid")
        return
      }
      toast.success("Bid placed successfully!")
      setBiddingId(null)
      setBidAmount("")
      setBidMessage("")
      setBidsPlaced((prev) => new Set(prev).add(requestId))
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="tasker">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/tasker"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Available Jobs</h1>
          <p className="text-muted-foreground">Browse open requests and submit your bids.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Briefcase className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search jobs by title, description, or service..."
              aria-label="Search jobs"
              className="h-11 pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="text-muted-foreground/40 mb-4 h-12 w-12" />
              <h3 className="mb-1 text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground text-sm">
                {search ? "Try adjusting your search." : "Check back soon for new opportunities."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <Card
                key={job.id}
                className="group border-2 border-transparent transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-2">
                        <p className="text-base font-semibold">{job.title}</p>
                        {job.urgency === "emergency" && (
                          <Badge className="border-red-200 bg-red-50 text-red-700">Emergency</Badge>
                        )}
                        {job.urgency === "urgent" && (
                          <Badge className="border-orange-200 bg-orange-50 text-orange-700">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                        {job.description}
                      </p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                          {job.service.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatDate(job.createdAt)}
                        </span>
                      </div>

                      {/* Social proof section */}
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${
                            job.bids.length === 0
                              ? "bg-amber-50 text-amber-700"
                              : job.bids.length >= 3
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          <Users className="h-3 w-3" />
                          {job.bids.length === 0
                            ? "Be the first to bid"
                            : job.bids.length === 1
                              ? "1 bid already"
                              : `${job.bids.length} bids already`}
                        </span>
                        {job.bids.length >= 3 && (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="h-3 w-3" />
                            Popular job
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {job.budget && (
                        <div className="text-right">
                          <span className="block text-lg font-bold text-emerald-600">
                            {formatPrice(job.budget)}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Suggested budget
                          </span>
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <Link href={`/dashboard/tasker/jobs/${job.id}`}>
                          <Button size="sm" variant="outline" className="h-9 px-3 text-xs">
                            Details
                          </Button>
                        </Link>
                        {bidsPlaced.has(job.id) ? (
                          <Badge className="h-9 gap-1 bg-emerald-100 px-3 text-emerald-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Bid Placed
                          </Badge>
                        ) : (
                          <Dialog
                            open={biddingId === job.id}
                            onOpenChange={(open) => {
                              setBiddingId(open ? job.id : null)
                              if (!open) {
                                setBidAmount("")
                                setBidMessage("")
                              }
                            }}
                          >
                            <DialogTrigger
                              render={
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                                >
                                  <Send className="mr-1 h-4 w-4" />
                                  Bid
                                </Button>
                              }
                            />
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg">Place a Bid</DialogTitle>
                                <p className="text-muted-foreground text-sm font-normal">
                                  {job.title}
                                </p>
                              </DialogHeader>
                              <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 text-sm">
                                  <span className="text-emerald-700">Suggested budget</span>
                                  <span className="font-bold text-emerald-700">
                                    {job.budget ? formatPrice(job.budget) : "Not specified"}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Your Price (NPR) *</label>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 5000"
                                    className="h-12 text-base"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Why you? (optional)</label>
                                  <Textarea
                                    placeholder="Tell the customer why you're the best fit..."
                                    rows={2}
                                    value={bidMessage}
                                    onChange={(e) => setBidMessage(e.target.value)}
                                  />
                                </div>
                                <Button
                                  className="h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white"
                                  onClick={() => handleBid(job.id)}
                                  disabled={submitting}
                                >
                                  {submitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                  )}
                                  Submit Bid
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
