"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Loader2,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Percent,
  BadgeCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"

interface MonthlyItem {
  month: string
  gross: number
  commission: number
  net: number
  jobs: number
}

interface TransactionItem {
  id: string
  amount: number
  commission: number | null
  commissionRate: number | null
  description: string | null
  createdAt: string
  customer: { id: string; name: string | null } | null
  jobTitle: string | null
  serviceName: string | null
}

interface EarningsData {
  summary: {
    grossEarned: number
    totalCommission: number
    netEarned: number
    completedJobs: number
    avgCommissionRate: number
    thisMonthGross: number
    thisMonthCommission: number
    thisMonthNet: number
    thisMonthJobs: number
  }
  tier: string
  proExpiresAt: string | null
  monthlyBreakdown: MonthlyItem[]
  transactions: TransactionItem[]
  total: number
  page: number
  limit: number
}

export default function TaskerEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)

  const LIMIT = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/tasker/earnings?page=${page}&limit=${LIMIT}`)
      if (!res.ok) throw new Error("Failed to load")
      setData(await res.json())
    } catch {
      setError("Failed to load earnings data")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1
  const isPro = data?.tier === "PRO"
  const rateDisplay = data ? (data.summary.avgCommissionRate * 100).toFixed(1) : "—"

  return (
    <DashboardLayout role="tasker">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/tasker"
              className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
            <p className="text-muted-foreground">
              Track your income, commissions, and completed jobs.
            </p>
          </div>
          <Button variant="outline" className="h-11 w-11" onClick={fetchData} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
              <h3 className="mb-1 text-lg font-medium">Failed to load earnings</h3>
              <p className="text-muted-foreground mb-4 text-sm">{error}</p>
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
                  <CardTitle className="text-muted-foreground text-sm">Gross Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(data.summary.grossEarned)}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    From {data.summary.completedJobs} jobs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm">
                    Platform Commission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatPrice(data.summary.totalCommission)}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">Avg {rateDisplay}% rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm">Net Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(data.summary.netEarned)}</div>
                  <p className="text-muted-foreground mt-1 text-xs">After commission</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(data.summary.thisMonthNet)}
                    </span>
                    <span className="text-muted-foreground text-xs">net</span>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                    <span>{formatPrice(data.summary.thisMonthGross)} gross</span>
                    <span>•</span>
                    <span>{data.summary.thisMonthJobs} jobs</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Link href="/dashboard/tasker/payouts">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  Withdraw Funds
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Monthly Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.monthlyBreakdown.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <TrendingUp className="text-muted-foreground/40 mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">No earnings data yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.monthlyBreakdown.map((m) => (
                        <div
                          key={m.month}
                          className="hover:bg-muted/30 flex items-center justify-between rounded-lg border p-3 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{m.month}</p>
                            <p className="text-muted-foreground text-xs">{m.jobs} jobs</p>
                          </div>
                          <div className="ml-4 flex flex-wrap items-center gap-3 text-right">
                            <div>
                              <p className="text-muted-foreground text-xs">Gross</p>
                              <p className="text-sm font-medium">{formatPrice(m.gross)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Fee</p>
                              <p className="text-sm font-medium text-amber-600">
                                -{formatPrice(m.commission)}
                              </p>
                            </div>
                            <div className="border-l pl-2">
                              <p className="text-muted-foreground text-xs">Net</p>
                              <p className="text-sm font-bold text-emerald-600">
                                {formatPrice(m.net)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Percent className="h-4 w-4" />
                    Commission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Your Tier</span>
                    <Badge
                      variant="outline"
                      className={
                        isPro ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                      }
                    >
                      {isPro ? (
                        <span className="flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" />
                          PRO
                        </span>
                      ) : (
                        "Standard"
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Commission Rate</span>
                    <span className="font-medium">{isPro ? "3%" : "5%"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Paid in Fees</span>
                    <span className="font-medium text-amber-600">
                      {formatPrice(data.summary.totalCommission)}
                    </span>
                  </div>
                  {isPro && data.proExpiresAt && (
                    <div className="text-muted-foreground border-t pt-2 text-xs">
                      Pro expires {formatDate(data.proExpiresAt)}
                    </div>
                  )}
                  {!isPro && (
                    <div className="border-t pt-2">
                      <Link
                        href="/dashboard/tasker/settings"
                        className="text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Upgrade to Pro for 3% rate →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="text-muted-foreground/40 mb-4 h-12 w-12" />
                    <h3 className="mb-1 text-lg font-medium">No transactions yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Complete your first job to see earnings here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {data.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="hover:bg-muted/30 flex items-center justify-between p-4 transition-colors sm:px-6"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {tx.jobTitle || tx.description || "Job"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {tx.customer?.name ? `for ${tx.customer.name}` : ""}
                            {tx.serviceName ? ` • ${tx.serviceName}` : ""}
                            {` • ${formatDate(tx.createdAt)}`}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-wrap items-center gap-3 text-right">
                          <div>
                            <p className="text-muted-foreground text-xs">Earned</p>
                            <p className="font-medium text-emerald-600">{formatPrice(tx.amount)}</p>
                          </div>
                          {tx.commission != null && tx.commission > 0 && (
                            <div>
                              <p className="text-muted-foreground text-xs">Fee</p>
                              <p className="text-sm font-medium text-amber-600">
                                -{formatPrice(tx.commission)}
                              </p>
                            </div>
                          )}
                          <div className="border-l pl-2">
                            <p className="text-muted-foreground text-xs">Net</p>
                            <p className="text-sm font-bold">
                              {formatPrice((tx.amount || 0) - (tx.commission || 0))}
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
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <p className="text-muted-foreground text-sm">
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
        ) : null}
      </div>
    </DashboardLayout>
  )
}
