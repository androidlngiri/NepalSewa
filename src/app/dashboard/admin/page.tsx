"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Users,
  UserCheck,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatPrice, formatDate } from "@/lib/utils"

interface AdminData {
  totalUsers: number
  totalTaskers: number
  totalRequests: number
  completedJobs: number
  revenue: number
  growthData: { status: string; _count: number }[]
  recentTransactions: {
    id: string
    amount: number
    type: string
    status: string
    description: string
    createdAt: string
    user: { name: string }
  }[]
  usersByRole: { role: string; _count: number }[]
}

const txStatusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-blue-50 text-blue-700 border-blue-200",
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Request failed")
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button variant="outline" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const statsCards = [
    {
      title: "Total Users",
      value: data?.totalUsers || 0,
      href: "/dashboard/admin/users",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Taskers",
      value: data?.totalTaskers || 0,
      href: "/dashboard/admin/users",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Requests",
      value: data?.totalRequests || 0,
      href: "/dashboard/admin/requests",
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Revenue",
      value: formatPrice(data?.revenue || 0),
      href: "/dashboard/admin/transactions",
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  const requestStatuses = data?.growthData || []
  const statusLabels: Record<string, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and analytics.</p>
          </div>
          <Button variant="outline" size="icon" onClick={load} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="border-2 border-transparent hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
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
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!requestStatuses.length ? (
                  <p className="text-sm text-muted-foreground">No request data available</p>
                ) : requestStatuses.map((item) => (
                  <Link
                    key={item.status}
                    href={`/dashboard/admin/requests?status=${item.status}`}
                    className="flex items-center justify-between hover:bg-muted/50 rounded-lg px-2 py-1 -mx-2 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">
                      {statusLabels[item.status] || item.status}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-muted overflow-hidden sm:w-48">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{
                            width: `${Math.min(
                              (item._count /
                                (requestStatuses.length > 0
                                  ? Math.max(...requestStatuses.map((s) => s._count))
                                  : 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {item._count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!data?.usersByRole?.length ? (
                  <p className="text-sm text-muted-foreground">No user data available</p>
                ) : data.usersByRole.map((item) => (
                  <Link
                    key={item.role}
                    href="/dashboard/admin/users"
                    className="flex items-center justify-between hover:bg-muted/50 rounded-lg px-2 py-1 -mx-2 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground capitalize">
                      {item.role.toLowerCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-muted overflow-hidden sm:w-48">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{
                            width: `${Math.min(
                              (item._count /
                                Math.max(...(data?.usersByRole.map((r) => r._count) || [1]))) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {item._count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/dashboard/admin/transactions">
              <Button variant="ghost" size="sm" className="text-emerald-600">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {data.recentTransactions.map((tx) => (
                  <Link
                    key={tx.id}
                    href="/dashboard/admin/transactions"
                    className="flex items-center justify-between rounded-lg border p-4 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{tx.user?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description || tx.type} • {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-emerald-600">+{formatPrice(tx.amount)}</p>
                      <Badge variant="outline" className={txStatusColors[tx.status] || ""}>
                        {tx.status.toLowerCase()}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
                <p className="text-sm text-muted-foreground">
                  Transactions will appear here once users start booking services.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
