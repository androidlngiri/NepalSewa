"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Wrench,
  Zap,
  PaintBucket,
  Home,
  Truck,
  Code,
  GraduationCap,
  Scissors,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ICON_MAP: Record<string, any> = {
  plumbing: Wrench,
  electrical: Zap,
  painting: PaintBucket,
  cleaning: Home,
  "moving-delivery": Truck,
  "tech-support": Code,
  tutoring: GraduationCap,
  "salon-spa": Scissors,
}

const COLOR_MAP: Record<string, string> = {
  plumbing: "from-blue-500 to-cyan-600",
  electrical: "from-amber-500 to-orange-600",
  painting: "from-rose-500 to-pink-600",
  cleaning: "from-emerald-500 to-green-600",
  "moving-delivery": "from-violet-500 to-purple-600",
  "tech-support": "from-indigo-500 to-blue-600",
  tutoring: "from-teal-500 to-emerald-600",
  "salon-spa": "from-pink-500 to-rose-600",
}

const POPULAR_SLUGS = ["plumbing", "electrical", "cleaning", "salon-spa"]

const fallbackServices: Category[] = [
  { slug: "plumbing", name: "Plumbing", description: "Pipe repair, faucet installation, water tank cleaning", services: [] },
  { slug: "electrical", name: "Electrical", description: "Wiring, switchboard repair, fan installation", services: [] },
  { slug: "painting", name: "Painting", description: "Interior/exterior painting, texture finishes", services: [] },
  { slug: "cleaning", name: "Cleaning", description: "Deep cleaning, office cleaning, carpet wash", services: [] },
  { slug: "moving-delivery", name: "Moving & Delivery", description: "House shifting, parcel delivery, cargo transport", services: [] },
  { slug: "tech-support", name: "Tech Support", description: "Computer repair, web design, IT solutions", services: [] },
  { slug: "tutoring", name: "Tutoring", description: "Home tutoring, exam prep, skill classes", services: [] },
  { slug: "salon-spa", name: "Salon & Spa", description: "Haircut, massage, beauty services at home", services: [] },
]

interface Category {
  slug: string
  name: string
  description: string | null
  services: { id: string }[]
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border-2 border-transparent bg-white p-6 animate-pulse">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-muted" />
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>
      <div className="mb-2 h-5 w-2/3 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
    </div>
  )
}

export function ServicesSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(fallbackServices)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data: Category[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="relative py-20 lg:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-14">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            Our Services
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything You Need
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            From urgent repairs to planned services — find the right professional
            for every job in Butwal.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : categories.map((cat) => {
                const Icon = ICON_MAP[cat.slug] || Wrench
                const color = COLOR_MAP[cat.slug] || "from-emerald-500 to-teal-600"
                const popular = POPULAR_SLUGS.includes(cat.slug)
                const count = cat.services.length
                return (
                  <Link key={cat.slug} href={`/services/${cat.slug}`}>
                    <Card className="group relative h-full overflow-hidden border-2 border-transparent bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-md`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          {popular && (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-700 text-xs"
                            >
                              Popular
                            </Badge>
                          )}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">{cat.name}</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {cat.description || `${count} service${count === 1 ? "" : "s"} available`}
                        </p>
                        <div className="flex items-center justify-end text-sm">
                          <span className="text-muted-foreground group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                            Get quotes →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-2 px-8 py-6 text-base font-medium"
            onClick={() => router.push("/services")}
          >
            View All Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
