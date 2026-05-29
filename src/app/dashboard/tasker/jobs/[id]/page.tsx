"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Loader2, ArrowLeft, MapPin, IndianRupee, Clock, AlertCircle, User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate, formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface JobDetail {
  id: string
  title: string
  description: string
  status: string
  budget: number | null
  urgency: string | null
  wardNo: number | null
  location: string | null
  createdAt: string
  service: { id: string; name: string; slug: string }
  user: { id: string; name: string; image: string | null; wardNo: number | null }
}

export default function TaskerJobDetailPage() {
  const params = useParams()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/requests")
        if (res.ok) {
          const jobs = await res.json()
          const found = jobs.find((j: any) => j.id === params.id)
          setJob(found || null)
        }
      } catch {
        toast.error("Failed to load job")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout role="tasker">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout role="tasker">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">Job not found</h3>
          <p className="text-sm text-muted-foreground">This job posting may have been removed.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="tasker">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/tasker/jobs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {job.service.name}
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{job.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.budget && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span>Budget: <strong>{formatPrice(job.budget)}</strong></span>
                </div>
              )}
              {job.wardNo && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Ward {job.wardNo}</span>
                </div>
              )}
              {job.urgency && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">Urgency: {job.urgency}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>

            {job.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-1">Posted by</p>
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 rounded-full bg-emerald-100 p-1.5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">{job.user.name}</p>
                  {job.user.wardNo && (
                    <p className="text-xs text-muted-foreground">
                      Ward {job.user.wardNo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
