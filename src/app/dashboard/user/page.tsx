"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface DashboardData {
  activeRequests: number
  completedJobs: number
  pendingBids: number
  totalSpent: number
}

interface Request {
  id: string
  title: string
  status: string
  budget: number | null
  createdAt: string
  service: { name: string }
  bids: { id: string; amount: number; status: string }[]
}

export default function UserDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, reqRes] = await Promise.all([
          fetch("/api/dashboard?role=user"),
          fetch("/api/requests?role=user"),
        ])
        if (dashRes.ok) setData(await dashRes.json())
        if (reqRes.ok) setRequests(await reqRes.json())
      } catch (e) {
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  const cards = [
    {
      title: "Active Requests",
      value: data?.activeRequests || 0,
      href: "/dashboard/user/requests",
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Completed Jobs",
      value: data?.completedJobs || 0,
      href: "/dashboard/user/requests",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Bids",
      value: data?.pendingBids || 0,
      href: "/dashboard/user/bids",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Spent",
      value: formatPrice(data?.totalSpent || 0),
      href: "/dashboard/user/requests",
      icon: IndianRupee,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your service requests and taskers.</p>
          </div>
          <Link href="/dashboard/user/requests/new">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:from-emerald-600 hover:to-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
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
            <CardTitle>Recent Requests</CardTitle>
            <Link href="/dashboard/user/requests">
              <Button variant="ghost" size="sm" className="text-emerald-600">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="text-muted-foreground/40 mb-4 h-12 w-12" />
                <h3 className="mb-1 text-lg font-medium">No requests yet</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Post your first service request to get started.
                </p>
                <Link href="/dashboard/user/requests/new">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Post a Request
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((req) => (
                  <Link
                    key={req.id}
                    href={`/dashboard/user/requests/${req.id}`}
                    className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{req.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {req.service.name} • {formatDate(req.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      {req.budget && (
                        <span className="text-sm font-medium text-emerald-600">
                          {formatPrice(req.budget)}
                        </span>
                      )}
                      <Badge variant="outline" className={statusColors[req.status] || ""}>
                        {req.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/dashboard/user/requests/new">
                <Button
                  variant="outline"
                  className="h-20 w-full flex-col gap-1 border-2 hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <Plus className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-normal">Post a Request</span>
                </Button>
              </Link>
              <Link href="/dashboard/user/bids">
                <Button
                  variant="outline"
                  className="h-20 w-full flex-col gap-1 border-2 hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-normal">Review Bids</span>
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  variant="outline"
                  className="h-20 w-full flex-col gap-1 border-2 hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <ClipboardList className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-normal">Browse Services</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
