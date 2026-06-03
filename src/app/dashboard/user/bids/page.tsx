"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface Bid {
  id: string
  amount: number
  status: string
  message: string | null
  createdAt: string
  tasker: { id: string; name: string; image: string | null; rating: number | null }
  request: { id: string; title: string; service: { name: string } }
}

export default function UserBidsPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bids?role=customer")
      .then((r) => r.json())
      .then(setBids)
      .catch(() => toast.error("Failed to load bids"))
      .finally(() => setLoading(false))
  }, [])

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-blue-50 text-blue-700 border-blue-200",
      ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
    }
    return (
      <Badge variant="outline" className={styles[status] || ""}>
        {status}
      </Badge>
    )
  }

  async function handleAccept(bidId: string) {
    try {
      const res = await fetch(`/api/bids/${bidId}/accept`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to accept bid")
        return
      }
      toast.success("Bid accepted! Tasker has been assigned.")
      const refreshed = await fetch("/api/bids?role=customer")
      if (refreshed.ok) setBids(await refreshed.json())
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/user"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Bids on Your Requests</h1>
          <p className="text-muted-foreground">Review and accept bids from taskers.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : bids.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="text-muted-foreground/40 mb-4 h-12 w-12" />
              <h3 className="mb-1 text-lg font-medium">No bids yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Taskers will send you bids when you post a request.
              </p>
              <Link href="/dashboard/user/requests/new">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  Post a Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => (
              <Card key={bid.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="font-medium">{bid.tasker.name}</p>
                        {bid.tasker.rating && (
                          <span className="text-sm text-amber-500">
                            ★ {bid.tasker.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2 text-sm">
                        For:{" "}
                        <Link
                          href={`/dashboard/user/requests/${bid.request.id}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {bid.request.title}
                        </Link>
                      </p>
                      {bid.message && (
                        <p className="bg-muted mb-3 rounded-lg p-3 text-sm">{bid.message}</p>
                      )}
                      <div className="text-muted-foreground flex items-center gap-3 text-xs">
                        <span>{bid.request.service.name}</span>
                        <span>•</span>
                        <span>{formatDate(bid.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-emerald-600">
                        {formatPrice(bid.amount)}
                      </span>
                      {statusBadge(bid.status)}
                      {bid.status === "PENDING" && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                          onClick={() => handleAccept(bid.id)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
