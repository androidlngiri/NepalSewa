"use client"

import { useEffect, useState } from "react"
import { Star, Quote, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TestimonialItem {
  id: string
  name: string
  location: string | null
  role: string | null
  content: string
  rating: number
  avatarUrl: string | null
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTestimonials(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-emerald-50/50 to-white overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-emerald-100/30 to-transparent rounded-full blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative">
        <div className="flex flex-col items-center text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Real stories from real people in Butwal.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No testimonials yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative rounded-2xl border bg-white/80 p-8 backdrop-blur-sm transition-all hover:border-emerald-200 hover:shadow-xl"
              >
                <Quote className="absolute top-6 right-6 h-10 w-10 text-emerald-100 group-hover:text-emerald-200 transition-colors" />
                <div className="mb-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-medium">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.location || testimonial.role || ""}
                    </div>
                  </div>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={`star-${j}`}
                      className={`h-4 w-4 ${
                        j < testimonial.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
