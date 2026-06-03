"use client"

import { useState, useEffect, FormEvent } from "react"
import {
  Loader2,
  ArrowLeft,
  Wallet,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { toast } from "sonner"
import Link from "next/link"

const formatPrice = (amount: number) => `रू ${amount.toLocaleString()}`

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  PENDING: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  PROCESSING: { icon: Loader2, color: "text-blue-500", label: "Processing" },
  COMPLETED: { icon: CheckCircle, color: "text-emerald-500", label: "Completed" },
  REJECTED: { icon: XCircle, color: "text-red-500", label: "Rejected" },
}

export default function TaskerPayoutsPage() {
  const [balance, setBalance] = useState(0)
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("ESEWA")
  const [accountDetails, setAccountDetails] = useState("")

  useEffect(() => {
    loadPayouts()
  }, [])

  async function loadPayouts() {
    try {
      const res = await fetch("/api/tasker/payout")
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance)
        setPayouts(data.payouts)
      }
    } catch {
      toast.error("Failed to load payout data")
    } finally {
      setLoading(false)
    }
  }

  async function handleWithdraw(e: FormEvent) {
    e.preventDefault()
    const withdrawAmount = parseFloat(amount)
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    if (withdrawAmount > balance) {
      toast.error("Insufficient balance")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/tasker/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmount,
          method,
          accountDetails: accountDetails || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to submit request")
        return
      }
      toast.success("Withdrawal request submitted!")
      setAmount("")
      setAccountDetails("")
      await loadPayouts()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="tasker">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  const hasPending = payouts.some((p) => p.status === "PENDING" || p.status === "PROCESSING")

  return (
    <DashboardLayout role="tasker">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            href="/dashboard/tasker/earnings"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Earnings
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-muted-foreground">Transfer your earnings to eSewa or bank account.</p>
        </div>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <Wallet className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-emerald-600">{formatPrice(balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {balance >= 100 && !hasPending && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Request Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (minimum रू 100)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    max={balance}
                    step="0.01"
                    placeholder="Enter amount"
                    className="h-11"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={method === "ESEWA" ? "default" : "outline"}
                      onClick={() => setMethod("ESEWA")}
                      className="flex-1"
                    >
                      eSewa
                    </Button>
                    <Button
                      type="button"
                      variant={method === "BANK" ? "default" : "outline"}
                      onClick={() => setMethod("BANK")}
                      className="flex-1"
                    >
                      Bank Transfer
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account">
                    {method === "ESEWA" ? "eSewa ID or Phone" : "Bank Account Details"}
                  </Label>
                  <Input
                    id="account"
                    placeholder={method === "ESEWA" ? "98XXXXXXXX" : "Bank name, account number"}
                    className="h-11"
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Withdrawal Request
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {hasPending && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <p>You already have a pending withdrawal. Wait for it to be processed.</p>
          </div>
        )}

        {balance < 100 && (
          <div className="border-muted flex items-center gap-2 rounded-lg border p-4 text-sm">
            <AlertCircle className="text-muted-foreground h-4 w-4" />
            <p>Minimum withdrawal is रू 100. Complete more jobs to reach the threshold.</p>
          </div>
        )}

        {payouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payouts.map((payout) => {
                  const config = statusConfig[payout.status] || statusConfig.PENDING
                  const Icon = config.icon
                  return (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <div>
                          <p className="font-medium">{formatPrice(payout.amount)}</p>
                          <p className="text-muted-foreground text-xs">
                            {payout.method} • {new Date(payout.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
