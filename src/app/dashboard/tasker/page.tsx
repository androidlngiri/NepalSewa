"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  CheckCircle2,
  CheckCircle,
  DollarSign,
  Star,
  Loader2,
  Clock,
  ArrowRight,
  Send,
  Users,
  Timer,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

interface DashboardData {
  activeBids: number
  completedJobs: number
  earnedTotal: number
  rating: number
  recentEarnings: { date: string; amount: number }[]
}

interface OpenRequest {
  id: string
  title: string
  description: string
  budget: number | null
  urgency: string | null
  createdAt: string
  status: string
  service: { name: string }
  user: { id: string; name: string }
  bids: { id: string }[]
}

export default function TaskerDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [openJobs, setOpenJobs] = useState<OpenRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [biddingId, setBiddingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bidsPlaced, setBidsPlaced] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, jobsRes] = await Promise.all([
          fetch("/api/dashboard?role=tasker"),
          fetch("/api/requests?role=tasker"),
        ])
        if (dashRes.ok) setData(await dashRes.json())
        if (jobsRes.ok) setOpenJobs(await jobsRes.json())
      } catch {
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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

  if (loading) {
    return (
      <DashboardLayout role="tasker">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  const cards = [
    {
      title: "Active Bids",
      value: data?.activeBids || 0,
      href: "/dashboard/tasker/my-bids",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Completed Jobs",
      value: data?.completedJobs || 0,
      href: "/dashboard/tasker/jobs",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Earned",
      value: formatPrice(data?.earnedTotal || 0),
      href: "/dashboard/tasker/earnings",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Rating",
      value: data?.rating ? data.rating.toFixed(1) : "New",
      href: "/dashboard/tasker/reviews",
      icon: Star,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  const visibleJobs = openJobs.filter((j) => j.status === "OPEN").slice(0, 5)

  return (
    <DashboardLayout role="tasker">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasker Dashboard</h1>
          <p className="text-muted-foreground">Find jobs, bid, and grow your earnings.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-emerald-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Available Jobs Near You</CardTitle>
            <Link href="/dashboard/tasker/jobs">
              <Button variant="ghost" size="sm" className="text-emerald-600">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {visibleJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="text-muted-foreground/40 mb-4 h-12 w-12" />
                <h3 className="mb-1 text-lg font-medium">No jobs available</h3>
                <p className="text-muted-foreground text-sm">
                  Check back soon for new opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="group border-2 border-transparent transition-all hover:border-emerald-200 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="truncate font-medium">{job.title}</p>
                            {job.urgency === "emergency" && (
                              <Badge className="border-red-200 bg-red-50 text-red-700">
                                Emergency
                              </Badge>
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
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {job.bids.length === 0
                                ? "Be the first to bid"
                                : job.bids.length === 1
                                  ? "1 bid"
                                  : `${job.bids.length} bids`}
                            </span>
                            {job.bids.length >= 3 && (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <TrendingUp className="h-3 w-3" />
                                Popular
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
                                      <label className="text-sm font-medium">
                                        Your Price (NPR) *
                                      </label>
                                      <Input
                                        type="number"
                                        placeholder="e.g., 5000"
                                        className="h-12 text-base"
                                        value={biddingId === job.id ? bidAmount : ""}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">
                                        Why you? (optional)
                                      </label>
                                      <Textarea
                                        placeholder="Tell the customer why you're the best fit..."
                                        rows={2}
                                        value={biddingId === job.id ? bidMessage : ""}
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
          </CardContent>
        </Card>

        {data?.recentEarnings && data.recentEarnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recentEarnings.slice(0, 5).map((earning) => (
                  <Link
                    key={`${earning.date}-${earning.amount}`}
                    href="/dashboard/tasker/earnings"
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <span className="text-muted-foreground text-sm">
                      {formatDate(earning.date)}
                    </span>
                    <span className="font-medium text-emerald-600">
                      +{formatPrice(earning.amount)}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
