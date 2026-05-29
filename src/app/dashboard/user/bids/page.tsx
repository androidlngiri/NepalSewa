"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, IndianRupee, CheckCircle2, XCircle, Clock } from "lucide-react"
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
  const router = useRouter()
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bids")
      .then((r) => r.json())
      .then(setBids)
      .catch(console.error)
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
      router.refresh()
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
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Bids Received</h1>
          <p className="text-muted-foreground">
            Review and accept bids from taskers.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : bids.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No bids yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{bid.tasker.name}</p>
                        {bid.tasker.rating && (
                          <span className="text-sm text-amber-500">
                            ★ {bid.tasker.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        For: <Link href={`/dashboard/user/requests/${bid.request.id}`} className="text-emerald-600 hover:underline">{bid.request.title}</Link>
                      </p>
                      {bid.message && (
                        <p className="text-sm bg-muted rounded-lg p-3 mb-3">
                          {bid.message}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
