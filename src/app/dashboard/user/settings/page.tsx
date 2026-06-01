"use client"

import { useState, useEffect, FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TaskerStatusCard } from "@/components/dashboard/TaskerStatusCard"
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
    email: "",
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
          setIsTasker(user.isTasker || false)
          setForm({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
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
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            href="/dashboard/user"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences.</p>
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
                  type="email"
                  placeholder="your@email.com"
                  className="h-11"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  placeholder="Tell us about yourself..."
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

        <TaskerStatusCard isTasker={isTasker} onCheckedChange={setIsTasker} />

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
            className="h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
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
