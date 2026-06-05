"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  ArrowLeft,
  Save,
  Crown,
  Sparkles,
  ShieldCheck,
  Upload,
  Camera,
  X,
} from "lucide-react"
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
  const [skills, setSkills] = useState<string[]>([])
  const [isVerified, setIsVerified] = useState(false)
  const [verificationPending, setVerificationPending] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submittingVerification, setSubmittingVerification] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const ALL_SKILLS = [
    "Plumbing",
    "Electrical",
    "Painting",
    "Cleaning",
    "Moving/Delivery",
    "Tech Support",
    "Tutoring",
    "Salon/Spa",
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const proStatus = params.get("pro")
    if (proStatus === "success") {
      toast.success("Pro subscription activated!")
      setTier("PRO")
      router.replace("/dashboard/tasker/settings")
    } else if (proStatus === "failed") {
      toast.error("Payment failed. Please try again.")
      router.replace("/dashboard/tasker/settings")
    } else if (proStatus === "already") {
      toast.info("Payment already processed.")
      router.replace("/dashboard/tasker/settings")
    } else if (proStatus === "invalid") {
      toast.error("Invalid payment response.")
      router.replace("/dashboard/tasker/settings")
    }
  }, [router])

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
          setSkills(user.skills || [])
          setIsVerified(user.isVerified || false)
          setTier(user.tier || "STANDARD")
          setProExpiresAt(user.proExpiresAt || null)

          const verRes = await fetch("/api/verification")
          if (verRes.ok) {
            const verData = await verRes.json()
            setVerificationPending(verData.some((v: any) => v.status === "PENDING"))
          }
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
        body: JSON.stringify({ ...form, skills }),
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

      if (data.formFields && data.action) {
        const form = document.createElement("form")
        form.method = "POST"
        form.action = data.action
        for (const [key, value] of Object.entries(data.formFields)) {
          const input = document.createElement("input")
          input.type = "hidden"
          input.name = key
          input.value = String(value)
          form.appendChild(input)
        }
        document.body.appendChild(form)
        form.submit()
        return
      }

      setTier("PRO")
      setProExpiresAt(data.expiresAt)
      toast.success("Upgraded to Pro!")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setUpgrading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Only images are allowed")
      return
    }
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error("Upload failed")
      const { url } = await uploadRes.json()
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      })
      toast.success("Profile photo updated!")
      await update()
      router.refresh()
    } catch {
      toast.error("Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ""
    }
  }

  async function handleRequestVerification() {
    setSubmittingVerification(true)
    try {
      toast.info(
        "Please upload your ID document in the portfolio section first, then submit verification.",
      )
    } finally {
      setSubmittingVerification(false)
    }
  }

  function toggleSkill(skill: string) {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
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
              <div className="flex items-center gap-4">
                <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  {uploadingPhoto ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    <>
                      <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-2xl font-bold text-emerald-700">
                        {form.name?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </button>
                    </>
                  )}
                </div>
                <div>
                  <p className="font-medium">{form.name || "Tasker"}</p>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="text-xs text-emerald-600 hover:text-emerald-700"
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? "Uploading..." : "Change photo"}
                  </button>
                </div>
              </div>
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
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">Select the services you offer.</p>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    skills.includes(skill)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "text-muted-foreground border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Skills
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isVerified ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-700">Verified Tasker</p>
                  <p className="text-xs text-emerald-600">
                    Your identity has been verified by NepalSewa.
                  </p>
                </div>
              </div>
            ) : verificationPending ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-700">Verification Pending</p>
                  <p className="text-xs text-amber-600">
                    Your verification request is being reviewed.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">
                  Get verified to build trust with customers. Upload your ID document
                  (citizenship/passport) and we&apos;ll review it.
                </p>
                <Link href="/dashboard/tasker/portfolio">
                  <Button variant="outline" className="gap-1.5">
                    <Upload className="h-4 w-4" />
                    Upload ID Document in Portfolio
                  </Button>
                </Link>
              </>
            )}
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
