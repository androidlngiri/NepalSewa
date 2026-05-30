"use client"

import { useState, useEffect, FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Save, Briefcase, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Link from "next/link"

export default function UserSettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isTasker, setIsTasker] = useState(false)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    wardNo: "",
    address: "",
    bio: "",
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const user = await res.json()
          setIsTasker(user.isTasker || false)
          setForm({
            name: user.name || "",
            phone: user.phone || "",
            wardNo: user.wardNo ? String(user.wardNo) : "",
            address: user.address || "",
            bio: user.bio || "",
          })
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
        body: JSON.stringify({ ...form, isTasker }),
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

  if (fetching) {
    return (
      <DashboardLayout role="user">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="user">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/user"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences.
          </p>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="h-11 bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
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
                <Label>Your Ward (Butwal)</Label>
                <Select
                  value={form.wardNo}
                  onValueChange={(v) => { if (v != null) setForm({ ...form, wardNo: v }) }}
                  itemToStringLabel={(value) => {
                    const n = Number(value)
                    return isNaN(n) ? "" : `Ward ${n}`
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 19 }, (_, i) => (
                      <SelectItem key={`ward-${i + 1}`} value={String(i + 1)}>
                        Ward {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder="Tell us about yourself..."
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white h-11"
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
            <CardTitle>Tasker Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  <p className="font-medium">Offer services as a tasker</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isTasker
                    ? "You can now post requests AND bid on jobs. Your sidebar shows both sections."
                    : "Enable this to start bidding on jobs and earning money in your community."}
                </p>
              </div>
              <Switch checked={isTasker} onCheckedChange={setIsTasker} />
            </div>
            {isTasker && (
              <div className="mt-4 flex gap-3">
                <Link href="/dashboard/tasker">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Briefcase className="h-4 w-4" />
                    Tasker Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/dashboard/user">
                  <Button variant="outline" size="sm" className="gap-2">
                    User Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={async () => {
              setLoading(true)
              try {
                const res = await fetch("/api/users", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...form, isTasker }),
                })
                if (!res.ok) {
                  const data = await res.json()
                  toast.error(data.error || "Failed to update")
                  return
                }
                toast.success("Settings saved!")
                await update()
                router.refresh()
              } catch {
                toast.error("Something went wrong")
              } finally {
                setLoading(false)
              }
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white h-11"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
