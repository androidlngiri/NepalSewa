"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"

interface Request {
  id: string
  title: string
  status: string
  budget: number | null
  createdAt: string
  service: { name: string }
  bids: { id: string }[]
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

export default function UserRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/requests?role=user")
      .then((r) => r.json())
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/user"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">My Requests</h1>
          </div>
          <Link href="/dashboard/user/requests/new">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-medium">No requests yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Post your first request to get started.</p>
                <Link href="/dashboard/user/requests/new">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Post a Request
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {requests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/dashboard/user/requests/${req.id}`}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{req.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {req.service.name} • {formatDate(req.createdAt)} • {req.bids.length} bids
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {req.budget && (
                        <span className="text-sm font-medium text-emerald-600">{formatPrice(req.budget)}</span>
                      )}
                      <Badge variant="outline" className={statusColors[req.status] || ""}>
                        {req.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
