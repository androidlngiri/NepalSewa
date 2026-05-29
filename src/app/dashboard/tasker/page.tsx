"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Star,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"

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
  budget: number | null
  createdAt: string
  status: string
  wardNo: number | null
  service: { name: string }
  user: { name: string; wardNo: number | null }
  bids: { id: string }[]
}

export default function TaskerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [openJobs, setOpenJobs] = useState<OpenRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, jobsRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/requests"),
        ])
        if (dashRes.ok) setData(await dashRes.json())
        if (jobsRes.ok) setOpenJobs(await jobsRes.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Completed Jobs",
      value: data?.completedJobs || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Earned",
      value: formatPrice(data?.earnedTotal || 0),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Rating",
      value: data?.rating ? data.rating.toFixed(1) : "New",
      icon: Star,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  return (
    <DashboardLayout role="tasker">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasker Dashboard</h1>
          <p className="text-muted-foreground">
            Find jobs, bid, and grow your earnings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="border-2 border-transparent hover:border-emerald-100 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
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
            {openJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No jobs available</h3>
                <p className="text-sm text-muted-foreground">
                  Check back soon for new opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {openJobs.filter(j => j.status === "OPEN").slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/tasker/jobs/${job.id}`}
                    className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.service.name} • {job.user.name}
                        {job.wardNo ? ` • Ward ${job.wardNo}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {job.budget && (
                        <span className="text-sm font-medium text-emerald-600">
                          {formatPrice(job.budget)}
                        </span>
                      )}
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                        {job.bids.length} bids
                      </Badge>
                    </div>
                  </Link>
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
                {data.recentEarnings.slice(0, 5).map((earning, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {formatDate(earning.date)}
                    </span>
                    <span className="font-medium text-emerald-600">
                      +{formatPrice(earning.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
