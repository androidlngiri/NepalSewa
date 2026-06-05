"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReviewPhotosProps {
  photos: string[]
}

export function ReviewPhotos({ photos }: ReviewPhotosProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!photos || photos.length === 0) return null

  return (
    <>
      <div className="mt-2 flex gap-1.5">
        {photos.slice(0, 3).map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => {
              setActiveIndex(i)
              setLightboxOpen(true)
            }}
            className="bg-muted relative h-16 w-16 overflow-hidden rounded-lg border"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            {i === 2 && photos.length > 3 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                +{photos.length - 3}
              </span>
            )}
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

          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
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
                  setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1))
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          <img
            src={photos[activeIndex]}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {activeIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
