"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, Users, UserCheck, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
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
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Platform user management.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total Taskers", value: stats?.totalTaskers || 0, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Total Admins", value: stats?.usersByRole?.find((r: any) => r.role === "ADMIN")?._count || 0, icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((item) => (
              <Card key={item.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="text-3xl font-bold">{item.value}</span>
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
