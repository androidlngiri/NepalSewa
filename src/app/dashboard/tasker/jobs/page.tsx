"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Briefcase, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
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
  wardNo: number | null
  location: string | null
  createdAt: string
  status: string
  service: { id: string; name: string; slug: string }
  user: { id: string; name: string; image: string | null; wardNo: number | null }
  bids: { id: string }[]
}

export default function TaskerJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<OpenRequest[]>([])
  const [filtered, setFiltered] = useState<OpenRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [wardFilter, setWardFilter] = useState("")
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [biddingId, setBiddingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/requests")
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
          j.service.name.toLowerCase().includes(q)
      )
    }
    if (wardFilter) {
      result = result.filter((j) => String(j.wardNo) === wardFilter)
    }
    setFiltered(result)
  }, [search, wardFilter, jobs])

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
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Available Jobs</h1>
          <p className="text-muted-foreground">
            Browse open requests and submit your bids.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, description, or service..."
              aria-label="Search jobs"
              className="h-11 pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
          >
            <option value="">All Wards</option>
            {Array.from({ length: 19 }, (_, i) => (
              <option key={`ward-${i + 1}`} value={String(i + 1)}>
                Ward {i + 1}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No jobs found</h3>
              <p className="text-sm text-muted-foreground">
                {search || wardFilter
                  ? "Try adjusting your search or filters."
                  : "Check back soon for new opportunities."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{job.title}</p>
                        {job.urgency === "emergency" && (
                          <Badge className="bg-red-50 text-red-700 border-red-200">Emergency</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          {job.service.name}
                        </span>
                        {job.wardNo && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Ward {job.wardNo}
                          </span>
                        )}
                        <span>{job.bids.length} bid(s)</span>
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {job.budget && (
                        <span className="text-lg font-bold text-emerald-600">
                          {formatPrice(job.budget)}
                        </span>
                      )}
                      <Dialog
                        open={biddingId === job.id}
                        onOpenChange={(open) => {
                          setBiddingId(open ? job.id : null)
                          if (!open) { setBidAmount(""); setBidMessage("") }
                        }}
                      >
                        <DialogTrigger
                          render={
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                            >
                              <Send className="mr-1 h-4 w-4" />
                              Place Bid
                            </Button>
                          }
                        />
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Place a Bid</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Your Bid Amount (NPR)</label>
                              <Input
                                type="number"
                                placeholder="e.g., 5000"
                                className="h-11"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Message (optional)</label>
                              <Textarea
                                placeholder="Explain why you're the best fit for this job..."
                                rows={3}
                                value={bidMessage}
                                onChange={(e) => setBidMessage(e.target.value)}
                              />
                            </div>
                            <Button
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white h-11"
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
