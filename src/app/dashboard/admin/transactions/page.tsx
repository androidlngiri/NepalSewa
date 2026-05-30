"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, DollarSign, TrendingUp, AlertCircle, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatPrice, formatDate } from "@/lib/utils"

const LIMIT = 20

interface Transaction {
  id: string
  amount: number
  type: string
  status: string
  description: string
  createdAt: string
  user: { id: string; name: string | null; email: string | null }
}

const statusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-blue-50 text-blue-700 border-blue-200",
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/payments?all=true&page=${page}&limit=${LIMIT}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setTransactions(data.transactions || [])
      setTotal(data.total || 0)
    } catch {
      setError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">All platform transactions.</p>
          </div>
          <Button variant="outline" className="h-11 w-11" onClick={fetchTransactions} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">Failed to load transactions</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={fetchTransactions} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : loading && transactions.length === 0 ? (
          <Card>
            <CardContent className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
              <p className="text-sm text-muted-foreground">
                Transactions will appear once users start completing jobs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.map((tx) => (
                    <Link
                      key={tx.id}
                      href={`/dashboard/admin/requests/${tx.id}`}
                      className="flex items-center justify-between p-4 sm:px-6 transition-colors hover:bg-muted/50 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {tx.user?.name || "Unknown"}
                          </p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.description || tx.type} • {formatDate(tx.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-medium text-emerald-600">
                            +{formatPrice(tx.amount)}
                          </p>
                        </div>
                        <Badge variant="outline" className={statusColors[tx.status] || ""}>
                          {tx.status?.toLowerCase()}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({total} total)
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
      </div>
    </DashboardLayout>
  )
}
