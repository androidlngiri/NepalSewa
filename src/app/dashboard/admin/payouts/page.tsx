"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { toast } from "sonner"
import Link from "next/link"

const formatPrice = (amount: number) => `रू ${amount.toLocaleString()}`

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending" },
  PROCESSING: { icon: Loader2, color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
  COMPLETED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Completed",
  },
  REJECTED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejected" },
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadPayouts()
  }, [])

  async function loadPayouts() {
    try {
      const res = await fetch("/api/admin/payouts")
      if (res.ok) {
        const data = await res.json()
        setPayouts(data.payouts)
      }
    } catch {
      toast.error("Failed to load payouts")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(payoutId: string, status: string) {
    setUpdating(payoutId)
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, status }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to update")
        return
      }
      toast.success(`Payout ${status.toLowerCase()}`)
      await loadPayouts()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  const pendingPayouts = payouts.filter((p) => p.status === "PENDING")
  const processedPayouts = payouts.filter((p) => p.status !== "PENDING")

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/dashboard/admin"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Payout Requests</h1>
          <p className="text-muted-foreground">Manage tasker withdrawal requests.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingPayouts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Total Requests</p>
              <p className="text-2xl font-bold">{payouts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Total Amount</p>
              <p className="text-2xl font-bold">
                {formatPrice(payouts.reduce((sum, p) => sum + p.amount, 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        {pendingPayouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests ({pendingPayouts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{payout.tasker.name || "Unnamed"}</p>
                      <p className="text-muted-foreground text-sm">
                        {payout.tasker.email || payout.tasker.phone} • {payout.method}
                      </p>
                      {payout.accountDetails && (
                        <p className="text-muted-foreground text-xs">{payout.accountDetails}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {new Date(payout.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{formatPrice(payout.amount)}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleUpdate(payout.id, "REJECTED")}
                          disabled={updating === payout.id}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-500 text-white hover:bg-emerald-600"
                          onClick={() => handleUpdate(payout.id, "COMPLETED")}
                          disabled={updating === payout.id}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {processedPayouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>History ({processedPayouts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedPayouts.map((payout) => {
                  const config = statusConfig[payout.status] || statusConfig.PENDING
                  const Icon = config.icon
                  return (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <div>
                          <p className="font-medium">{payout.tasker.name || "Unnamed"}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatPrice(payout.amount)} • {payout.method} •{" "}
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {payouts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No withdrawal requests yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
