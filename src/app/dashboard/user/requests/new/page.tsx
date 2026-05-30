"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Send, ArrowLeft, ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { toast } from "sonner"
import Link from "next/link"

interface Category {
  id: string
  name: string
  services: { id: string; name: string }[]
}

const URGENCY_OPTIONS = [
  { value: "low", label: "Low — Within a week" },
  { value: "normal", label: "Normal — Within 2-3 days" },
  { value: "urgent", label: "Urgent — Within 24 hours" },
  { value: "emergency", label: "Emergency — Within 2 hours" },
]

const WARD_OPTIONS = Array.from({ length: 19 }, (_, i) => ({
  value: String(i + 1),
  label: `Ward ${i + 1}`,
}))

function NewRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedServiceId = searchParams.get("service")
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCat, setLoadingCat] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    categoryId: "",
    serviceId: "",
    title: "",
    description: "",
    location: "",
    wardNo: "",
    budget: "",
    urgency: "normal",
    scheduledDate: "",
  })

  const selectedCategory = categories.find((c) => c.id === form.categoryId)

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data)
        if (preselectedServiceId) {
          for (const cat of data) {
            const found = cat.services.find((s) => s.id === preselectedServiceId)
            if (found) {
              setForm((prev) => ({ ...prev, categoryId: cat.id, serviceId: found.id }))
              break
            }
          }
        }
        setLoadingCat(false)
      })
      .catch(() => {
        toast.error("Failed to load services")
        setLoadingCat(false)
      })
  }, [preselectedServiceId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Upload failed")
        return
      }

      const data = await res.json()
      setImages((prev) => [...prev, data.url])
      toast.success("Image uploaded")
    } catch {
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.serviceId || !form.title || !form.description) {
      toast.error("Please fill in all required fields")
      return
    }
    if (form.budget && (isNaN(Number(form.budget)) || Number(form.budget) <= 0)) {
      toast.error("Budget must be a positive number")
      return
    }
    setIsLoading(true)

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to create request")
        return
      }

      toast.success("Request posted successfully!")
      router.push("/dashboard/user")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="user">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/user"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Post a New Request</h1>
          <p className="text-muted-foreground">
            Describe what you need and taskers will send you bids.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v, _details) => {
                    if (v) setForm({ ...form, categoryId: v, serviceId: "" })
                  }}
                  disabled={loadingCat}
                  itemToStringLabel={(value) => {
                    const cat = categories.find((c) => c.id === value)
                    return cat?.name || ""
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingCat ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Service *</Label>
                <Select
                  value={form.serviceId}
                  onValueChange={(v, _details) => {
                    if (v) setForm({ ...form, serviceId: v })
                  }}
                  disabled={!form.categoryId}
                  itemToStringLabel={(value) => {
                    const svc = selectedCategory?.services.find((s) => s.id === value)
                    return svc?.name || ""
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Need a plumber to fix bathroom faucet"
                  className="h-11"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your task in detail — what needs to be done, what materials are needed, etc."
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wardNo">Your Ward (Butwal)</Label>
                  <Select
                    value={form.wardNo}
                    onValueChange={(v, _details) => {
                      if (v) setForm({ ...form, wardNo: v })
                    }}
                    itemToStringLabel={(value) => {
                      const ward = WARD_OPTIONS.find((w) => w.value === value)
                      return ward?.label || ""
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {WARD_OPTIONS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>
                          {w.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (NPR)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 5000"
                    className="h-11"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={form.urgency}
                    onValueChange={(v, _details) => {
                      if (v) setForm({ ...form, urgency: v })
                    }}
                    itemToStringLabel={(value) => {
                      const opt = URGENCY_OPTIONS.find((u) => u.value === value)
                      return opt?.label || ""
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_OPTIONS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Preferred Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    className="h-11"
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Details</Label>
                <Input
                  id="location"
                  placeholder="e.g., Milijuli, near the old bus park"
                  className="h-11"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Photos (optional)</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 w-20 rounded-xl border-2 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  {images.map((url) => (
                    <div key={url} className="relative h-20 w-20 rounded-xl overflow-hidden border">
                      <img src={url} alt="Uploaded task photo" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload photos of the task. Max 5MB per image.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <NewRequestForm />
    </Suspense>
  )
}
