"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Loader2, ArrowLeft, DollarSign, TrendingUp, Users, Briefcase,
  AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Percent,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatPrice, formatDate } from "@/lib/utils"

interface CommissionData {
  summary: {
    totalCommission: number
    totalCommissionRate: number
    totalCommissionJobs: number
    thisMonthCommission: number
    thisMonthJobs: number
  }
  tierCounts: Record<string, number>
  transactions: {
    id: string
    amount: number
    commission: number
    commissionRate: number
    description: string | null
    createdAt: string
    user: { id: string; name: string | null }
    tasker: { id: string; name: string | null }
    request: { id: string; title: string } | null
  }[]
  breakdown: {
    taskerId: string
    taskerName: string
    totalCommission: number
    totalRevenue: number
    jobCount: number
    avgRate: number
  }[]
  total: number
  page: number
  limit: number
}

export default function AdminCommissionsPage() {
  const [data, setData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<"overview" | "taskers" | "transactions">("overview")

  const LIMIT = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/commissions?page=${page}&limit=${LIMIT}`)
      if (!res.ok) throw new Error("Failed to load")
      setData(await res.json())
    } catch {
      setError("Failed to load commission data")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: TrendingUp },
    { key: "taskers" as const, label: "By Tasker", icon: Users },
    { key: "transactions" as const, label: "Transactions", icon: DollarSign },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
            <p className="text-muted-foreground">Platform commission revenue and tasker earnings.</p>
          </div>
          <Button variant="outline" className="h-11 w-11" onClick={fetchData} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">Failed to load commissions</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={fetchData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : loading && !data ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Commission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(data.summary.totalCommission)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {data.summary.totalCommissionJobs} jobs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(data.summary.thisMonthCommission)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {data.summary.thisMonthJobs} jobs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Avg Commission Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(data.summary.totalCommissionRate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all completed jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Tasker Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="text-sm font-medium">Pro: {data.tierCounts.pro || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="text-sm font-medium">Std: {data.tierCounts.standard || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-2 border-b">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.key
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <Card>
                <CardHeader>
                  <CardTitle>Commission Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Percent className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">Total Platform Commission</p>
                          <p className="text-sm text-muted-foreground">
                            From {data.summary.totalCommissionJobs} completed jobs
                          </p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-emerald-600">
                        {formatPrice(data.summary.totalCommission)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">This Month</p>
                          <p className="text-sm text-muted-foreground">
                            {data.summary.thisMonthJobs} jobs so far
                          </p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-emerald-600">
                        {formatPrice(data.summary.thisMonthCommission)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">Tasker Distribution</p>
                          <p className="text-sm text-muted-foreground">
                            {data.breakdown.length} taskers earning commission
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          Pro: {data.tierCounts.pro || 0}
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                          Std: {data.tierCounts.standard || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {tab === "taskers" && (
              <Card>
                <CardHeader>
                  <CardTitle>Commission by Tasker</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.breakdown.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
                      <p className="text-sm text-muted-foreground">No commission data yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {data.breakdown.map((tasker) => (
                        <div
                          key={tasker.taskerId}
                          className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/30 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{tasker.taskerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {tasker.jobCount} jobs • avg {(tasker.avgRate * 100).toFixed(1)}% rate
                            </p>
                          </div>
                          <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                            <div className="text-right">
                              <p className="font-medium text-emerald-600">
                                {formatPrice(tasker.totalCommission)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                on {formatPrice(tasker.totalRevenue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "transactions" && (
              <>
                <Card>
                  <CardContent className="p-0">
                    {data.transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <DollarSign className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <p className="text-sm text-muted-foreground">No commission transactions yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {data.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/30 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">
                                  {tx.request?.title || "Job"}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Customer: {tx.user?.name || "—"} • Tasker: {tx.tasker?.name || "—"} •{" "}
                                {formatDate(tx.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="font-medium text-emerald-600">
                                  +{formatPrice(tx.commission || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  at {(tx.commissionRate * 100).toFixed(1)}% of{" "}
                                  {formatPrice(tx.amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      Page {data.page} of {totalPages} ({data.total} total)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || loading}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
