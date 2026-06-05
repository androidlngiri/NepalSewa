"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PortfolioGalleryProps {
  images: string[]
  className?: string
}

export function PortfolioGallery({ images, className }: PortfolioGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) return null

  function openLightbox(index: number) {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
        {images.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => openLightbox(i)}
            className="group bg-muted relative aspect-square overflow-hidden rounded-xl border"
          >
            <img
              src={url}
              alt={`Portfolio ${i + 1}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          <img
            src={images[activeIndex]}
            alt={`Portfolio ${activeIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
