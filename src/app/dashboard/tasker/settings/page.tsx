"use client"

import { useState, useEffect, FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Save, Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

export default function TaskerSettingsPage() {
  const { update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [tier, setTier] = useState<string>("STANDARD")
  const [proExpiresAt, setProExpiresAt] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const user = await res.json()
          setForm({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || "",
            bio: user.bio || "",
          })
          setTier(user.tier || "STANDARD")
          setProExpiresAt(user.proExpiresAt || null)
        }
      } catch {
        toast.error("Failed to load profile")
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to update")
        return
      }
      toast.success("Profile updated!")
      await update()
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgradePro() {
    setUpgrading(true)
    try {
      const res = await fetch("/api/users/upgrade-pro", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to upgrade")
        return
      }
      const data = await res.json()
      setTier("PRO")
      setProExpiresAt(data.expiresAt)
      toast.success("Upgraded to Pro! 🎉")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setUpgrading(false)
    }
  }

  if (fetching) {
    return (
      <DashboardLayout role="tasker">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="tasker">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            href="/dashboard/tasker"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your tasker profile.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  className="h-11"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="98XXXXXXXX"
                  className="h-11"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., Milijuli, near the old bus park"
                  className="h-11"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your skills and experience..."
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-muted-foreground text-sm">
                  {tier === "PRO"
                    ? "Pro — 3% commission per job"
                    : "Standard — 5% commission per job"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  tier === "PRO"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }
              >
                {tier === "PRO" ? (
                  <>
                    <Crown className="mr-1 h-3 w-3" /> PRO
                  </>
                ) : (
                  "STANDARD"
                )}
              </Badge>
            </div>

            {tier === "PRO" && proExpiresAt && (
              <div className="text-muted-foreground text-sm">
                Valid until {formatDate(proExpiresAt)}
                {new Date(proExpiresAt) < new Date() && (
                  <span className="ml-2 text-red-500">(Expired)</span>
                )}
              </div>
            )}

            {tier === "STANDARD" && (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Go Pro — ₹199/month</p>
                    <ul className="text-muted-foreground mt-1 space-y-1 text-sm">
                      <li>• Reduced commission: 3% (vs 5%)</li>
                      <li>• Featured profile badge</li>
                      <li>• Priority in search results</li>
                      <li>• Early access to new jobs</li>
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={handleUpgradePro}
                  disabled={upgrading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                >
                  {upgrading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="mr-2 h-4 w-4" />
                  )}
                  Upgrade to Pro — ₹199/month
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
