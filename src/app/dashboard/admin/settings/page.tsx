"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Settings, Database, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [seeding, setSeeding] = useState(false)
  const [erasing, setErasing] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  async function handleSeed() {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to seed")
        return
      }
      toast.success("Sample data seeded!")
      setSeedResult(data.message || "Done")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSeeding(false)
    }
  }

  async function handleErase() {
    if (!window.confirm("Are you sure? This will delete all sample users, requests, bids, reviews, transactions, and messages. Admin, categories, and services will be preserved.")) {
      return
    }
    setErasing(true)
    try {
      const res = await fetch("/api/admin/seed/erase", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to erase")
        return
      }
      toast.success("Seed data erased!")
      setSeedResult(null)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setErasing(false)
    }
  }

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
          <p className="text-muted-foreground">Platform configuration and data management.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sample Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Seed the database with sample users, requests, bids, reviews, and testimonials to make
              the platform look populated. This is useful for demonstrating the platform or testing.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSeed}
                disabled={seeding || erasing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {seeding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                {seeding ? "Seeding..." : "Seed Sample Data"}
              </Button>

              <Button
                variant="outline"
                onClick={handleErase}
                disabled={seeding || erasing}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {erasing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {erasing ? "Erasing..." : "Erase Seed Data"}
              </Button>
            </div>

            {seedResult && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Seed Data Active</p>
                  <p className="text-xs mt-1">{seedResult}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
