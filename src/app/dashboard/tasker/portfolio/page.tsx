"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2, ArrowLeft, Upload, Trash2, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { PortfolioGallery } from "@/components/tasker/PortfolioGallery"
import { toast } from "sonner"
import Link from "next/link"

export default function TaskerPortfolioPage() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tasker/portfolio")
        if (res.ok) {
          const data = await res.json()
          setImages(data.images || [])
        }
      } catch {
        toast.error("Failed to load portfolio")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Only images are allowed")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error("Upload failed")
      const { url } = await uploadRes.json()

      const res = await fetch("/api/tasker/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add")
      }
      const data = await res.json()
      setImages(data.images)
      toast.success("Image added to portfolio")
    } catch {
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDelete(imageUrl: string) {
    try {
      const res = await fetch(`/api/tasker/portfolio?imageUrl=${encodeURIComponent(imageUrl)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to remove")
      const data = await res.json()
      setImages(data.images)
      toast.success("Image removed")
    } catch {
      toast.error("Failed to remove image")
    }
  }

  return (
    <DashboardLayout role="tasker">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/dashboard/tasker"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Showcase your best work with before/after photos.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Portfolio ({images.length}/20)</CardTitle>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= 20}
                className="gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                Add Photo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="text-muted-foreground/40 mb-4 h-12 w-12" />
                <h3 className="mb-1 text-lg font-medium">No portfolio images yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm text-sm">
                  Upload photos of your completed work to build trust with potential customers.
                </p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Upload First Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {images.map((url) => (
                    <div
                      key={url}
                      className="group bg-muted relative aspect-square overflow-hidden rounded-xl border"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDelete(url)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
