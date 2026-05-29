"use client"

import Link from "next/link"
import { ArrowLeft, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function AdminSettingsPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Platform configuration.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Platform-wide settings will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
