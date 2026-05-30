"use client"

import { useEffect, useState } from "react"
import {
  Users,
  UserCheck,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) setData(await res.json())
      } catch (e) {
        // console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  const statsCards = [
    {
      title: "Total Users",
      value: data?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Taskers",
      value: data?.totalTaskers || 0,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Requests",
      value: data?.totalRequests || 0,
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Revenue",
      value: formatPrice(data?.revenue || 0),
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and analytics.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requestStatuses.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
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
                                Math.max(...requestStatuses.map((s) => s._count))) *
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
                  </div>
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
                {data?.usersByRole.map((item) => (
                  <div key={item.role} className="flex items-center justify-between">
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {data.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium text-sm">{tx.user?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description || tx.type} • {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-emerald-600">
                        +{formatPrice(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {tx.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
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
