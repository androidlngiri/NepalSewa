"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Loader2,
  Send,
  ArrowLeft,
  ImagePlus,
  X,
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import Image from "next/image"
import { toast } from "sonner"
import Link from "next/link"

interface FlatService {
  id: string
  name: string
  categoryName: string
  categoryId: string
}

const URGENCY_OPTIONS = [
  { value: "low", label: "Low — Within a week" },
  { value: "normal", label: "Normal — Within 2-3 days" },
  { value: "urgent", label: "Urgent — Within 24 hours" },
  { value: "emergency", label: "Emergency — Within 2 hours" },
]

function NewRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedServiceId = searchParams.get("service")
  const [allServices, setAllServices] = useState<FlatService[]>([])
  const [loadingSvcs, setLoadingSvcs] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    serviceId: "",
    title: "",
    description: "",
    address: "",
    budget: "",
    urgency: "normal",
    scheduledDate: "",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [selectedService, setSelectedService] = useState<FlatService | null>(null)

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data: any[]) => {
        const flat: FlatService[] = []
        for (const cat of data) {
          for (const svc of cat.services) {
            flat.push({ id: svc.id, name: svc.name, categoryName: cat.name, categoryId: cat.id })
          }
        }
        setAllServices(flat)
        if (preselectedServiceId) {
          const found = flat.find((s) => s.id === preselectedServiceId)
          if (found) {
            setSelectedService(found)
            setSearchQuery(found.name)
            setForm((prev) => ({
              ...prev,
              serviceId: found.id,
              title: `Need ${found.name.toLowerCase()} service`,
            }))
          }
        }
        setLoadingSvcs(false)
      })
      .catch(() => {
        toast.error("Failed to load services")
        setLoadingSvcs(false)
      })
  }, [preselectedServiceId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filteredResults = searchQuery.trim()
    ? allServices.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.categoryName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  function handleSelectService(svc: FlatService) {
    setSelectedService(svc)
    setSearchQuery(svc.name)
    setForm((prev) => ({
      ...prev,
      serviceId: svc.id,
      title: `Need ${svc.name.toLowerCase()} service`,
    }))
    setShowResults(false)
  }

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
    if (!form.serviceId) {
      toast.error("Please select a service from the list")
      return
    }
    if (!form.address?.trim()) {
      toast.error("Please enter your address or area")
      return
    }
    if (form.budget && parseFloat(form.budget) < 0) {
      toast.error("Budget cannot be negative")
      return
    }
    if (images.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: form.serviceId,
          title: form.title,
          description:
            form.description ||
            `I need ${selectedService?.name.toLowerCase() || "a service"} in ${form.address}.`,
          location: form.address,
          wardNo: null,
          budget: form.budget || null,
          urgency: form.urgency,
          scheduledDate: form.scheduledDate || null,
          images,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to create request")
        return
      }
      toast.success("Posted! Taskers will start bidding shortly.")
      router.push("/dashboard/user")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="user">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            href="/dashboard/user"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Post a New Request</h1>
          <p className="text-muted-foreground">
            Tell us what you need and taskers will bid for the job.
          </p>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Step 1: Service search */}
              <div ref={searchRef} className="space-y-1.5">
                <Label className="text-sm font-medium">What do you need done? *</Label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2" />
                  <Input
                    placeholder='e.g., "plumber", "electrician", "house cleaning"...'
                    className="h-12 rounded-xl pr-4 pl-10 text-base"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowResults(true)
                      if (selectedService) {
                        setSelectedService(null)
                        setForm((prev) => ({ ...prev, serviceId: "", title: "" }))
                      }
                    }}
                    onFocus={() => setShowResults(true)}
                    disabled={loadingSvcs}
                  />
                  {loadingSvcs && (
                    <Loader2 className="text-muted-foreground absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin" />
                  )}
                </div>

                {/* Autocomplete dropdown */}
                {showResults && filteredResults.length > 0 && (
                  <div className="bg-card absolute z-50 mt-1 w-full max-w-[calc(100%-3rem)] overflow-hidden rounded-xl border shadow-xl">
                    {filteredResults.slice(0, 8).map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => handleSelectService(svc)}
                        className="flex w-full items-center gap-3 border-b px-4 py-3 text-left text-sm transition-colors last:border-0 hover:bg-emerald-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{svc.name}</p>
                          <p className="text-muted-foreground text-xs">{svc.categoryName}</p>
                        </div>
                      </button>
                    ))}
                    {filteredResults.length > 8 && (
                      <p className="text-muted-foreground border-t px-4 py-2 text-center text-xs">
                        {filteredResults.length - 8} more — type to narrow down
                      </p>
                    )}
                  </div>
                )}
                {showResults &&
                  searchQuery.trim() &&
                  filteredResults.length === 0 &&
                  !loadingSvcs && (
                    <div className="bg-card absolute z-50 mt-1 w-full max-w-[calc(100%-3rem)] rounded-xl border p-4 text-center shadow-xl">
                      <p className="text-muted-foreground text-sm">
                        No matching services found. Try a different word.
                      </p>
                    </div>
                  )}

                {selectedService && (
                  <p className="flex items-center gap-1 pt-1 text-xs text-emerald-600">
                    <Zap className="h-3 w-3" />
                    Selected: {selectedService.name} ({selectedService.categoryName})
                  </p>
                )}
              </div>

              {/* Step 2: Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm font-medium">
                  Your location *
                </Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2" />
                  <Input
                    id="address"
                    placeholder="e.g., Ward 5, Milijuli, near the bus park"
                    className="h-12 rounded-xl pr-4 pl-10 text-base"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Post button */}
              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white hover:from-emerald-600 hover:to-teal-700"
                disabled={isLoading || !form.serviceId}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                Post &amp; Get Bids
              </Button>

              {/* Expandable details toggle */}
              <div className="border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-1 py-1 text-sm transition-colors"
                >
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {showDetails ? "Hide optional details" : "Add details (optional)"}
                </button>

                {showDetails && (
                  <div className="animate-in space-y-4 pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your task — what needs to be done, what materials are needed..."
                        rows={3}
                        className="rounded-xl"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="budget">Suggested budget (NPR)</Label>
                        <Input
                          id="budget"
                          type="number"
                          min="0"
                          placeholder="e.g., 5000"
                          className="h-11 rounded-xl"
                          value={form.budget}
                          onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        />
                        <p className="text-muted-foreground text-xs">
                          Just a hint — taskers bid their own price
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="urgency">Urgency</Label>
                        <Select
                          value={form.urgency}
                          onValueChange={(v) => {
                            if (v) setForm({ ...form, urgency: v })
                          }}
                          itemToStringLabel={(value) => {
                            const opt = URGENCY_OPTIONS.find((u) => u.value === value)
                            return opt?.label || ""
                          }}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
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
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="scheduledDate">Preferred date</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          className="h-11 rounded-xl"
                          value={form.scheduledDate}
                          onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Photos (optional) — {images.length}/5</Label>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-20 w-20 rounded-xl border-2 border-dashed"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading || images.length >= 5}
                        >
                          {uploading ? (
                            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                          ) : (
                            <ImagePlus className="text-muted-foreground h-5 w-5" />
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
                          <div
                            key={url}
                            className="relative h-20 w-20 overflow-hidden rounded-xl border"
                          >
                            <Image
                              src={url}
                              alt="Uploaded photo"
                              fill
                              unoptimized
                              className="object-cover"
                            />
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
                      <p className="text-muted-foreground text-xs">Max 5MB per image</p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <NewRequestForm />
    </Suspense>
  )
}
