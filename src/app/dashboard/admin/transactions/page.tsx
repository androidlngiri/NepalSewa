"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatPrice, formatDate } from "@/lib/utils"

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/payments?all=true")
      .then((r) => r.json())
      .then((data) => {
        setTransactions(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
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
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 sm:px-6">
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
                        {tx.status?.toLowerCase()}
                      </p>
                    </div>
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
