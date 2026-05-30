"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, MessageSquare, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface MyBid {
  id: string
  amount: number
  status: string
  message: string | null
  createdAt: string
  request: {
    id: string
    title: string
    status: string
    budget: number | null
    service: { name: string }
    user: { name: string; wardNo: number | null }
    taskerAssignments: { id: string; status: string }[]
  }
}

export default function MyBidsPage() {
  const router = useRouter()
  const [bids, setBids] = useState<MyBid[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/bids")
      .then((r) => r.json())
      .then(setBids)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const badgeForStatus = (status: string) => {
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

  async function handleMarkComplete(assignmentId: string) {
    setMarkingId(assignmentId)
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "AWAITING_CONFIRMATION" }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to mark as complete")
        return
      }
      toast.success("Marked as complete! Waiting for customer confirmation.")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <DashboardLayout role="tasker">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/tasker"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">My Bids</h1>
          <p className="text-muted-foreground">
            Track all your submitted bids.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : bids.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No bids yet</h3>
              <p className="text-sm text-muted-foreground">
                Browse available jobs and place your first bid.
              </p>
              <Link href="/dashboard/tasker/jobs" className="mt-4">
                <span className="text-emerald-600 font-medium hover:underline text-sm">
                  Browse Jobs →
                </span>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => {
              const assignment = bid.request.taskerAssignments?.[0]
              return (
                <Card key={bid.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{bid.request.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {bid.request.service.name} • {bid.request.user.name}
                          {bid.request.user.wardNo ? ` • Ward ${bid.request.user.wardNo}` : ""}
                        </p>
                        {bid.message && (
                          <p className="text-sm bg-muted rounded-lg p-3 mt-2">
                            {bid.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(bid.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                          {formatPrice(bid.amount)}
                        </span>
                        {badgeForStatus(bid.status)}
                        {bid.status === "ACCEPTED" && assignment?.status === "IN_PROGRESS" && (
                          <Button
                            variant="outline"
                            className="mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleMarkComplete(assignment.id)}
                            disabled={markingId === assignment.id}
                          >
                            {markingId === assignment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Mark Complete
                          </Button>
                        )}
                        {bid.status === "ACCEPTED" && assignment?.status === "AWAITING_CONFIRMATION" && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Waiting for confirmation
                          </Badge>
                        )}
                        {bid.status === "ACCEPTED" && assignment?.status === "COMPLETED" && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-2">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
