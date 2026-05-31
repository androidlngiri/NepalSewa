"use client"

import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { Search, Wrench, Zap, PaintBucket, Home, Truck, Code, GraduationCap, Scissors, Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"

const ICONS: Record<string, any> = { Wrench, Zap, PaintBucket, Home, Truck, Code, GraduationCap, Scissors }

const GRADIENTS: Record<string, string> = {
  plumbing: "from-blue-500 to-cyan-600",
  electrical: "from-amber-500 to-orange-600",
  painting: "from-rose-500 to-pink-600",
  cleaning: "from-emerald-500 to-green-600",
  "moving-delivery": "from-violet-500 to-purple-600",
  "tech-support": "from-indigo-500 to-blue-600",
  tutoring: "from-teal-500 to-emerald-600",
  "salon-spa": "from-pink-500 to-rose-600",
}

const POPULAR = ["plumbing", "electrical", "cleaning", "salon-spa"]

function getCatIcon(slug: string) {
  const map: Record<string, string> = {
    plumbing: "Wrench",
    electrical: "Zap",
    painting: "PaintBucket",
    cleaning: "Home",
    "moving-delivery": "Truck",
    "tech-support": "Code",
    tutoring: "GraduationCap",
    "salon-spa": "Scissors",
  }
  return ICONS[map[slug] || "Wrench"]
}

export default function ServicesPage() {
  const [query, setQuery] = useState("")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedQuery) params.set("q", debouncedQuery)
    params.set("limit", "50")
    fetch(`/api/services/search?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  const allServices = data.flatMap((cat: any) =>
    cat.services.map((svc: any) => ({ ...svc, categoryName: cat.name, categorySlug: cat.slug }))
  )

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-16 lg:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center mb-10">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {debouncedQuery ? `Results for "${debouncedQuery}"` : "All Services in Butwal"}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                {debouncedQuery
                  ? `Found ${allServices.length} service${allServices.length === 1 ? "" : "s"}`
                  : "Find exactly what you need. Browse by category or search below."}
              </p>
              <div className="mt-8 flex w-full max-w-xl gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search services..."
                    aria-label="Filter services"
                    className="h-12 pl-11 text-base rounded-2xl border-2"
                  />
                </div>
                <Button
                  onClick={() => setQuery("")}
                  variant={query ? "default" : "outline"}
                  className="h-12 rounded-2xl px-6"
                >
                  {query ? "Clear" : "Search"}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : allServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-20">
                No services found. Try a different search term.
              </p>
            ) : debouncedQuery ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allServices.map((service: any) => {
                  const Icon = getCatIcon(service.categorySlug)
                  return (
                    <Link key={service.id} href={`/services/${service.categorySlug}`}>
                      <Card className="group h-full border-2 border-transparent bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${GRADIENTS[service.categorySlug] || "from-emerald-500 to-teal-600"} shadow-md`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            {POPULAR.includes(service.categorySlug) && (
                              <Badge className="bg-emerald-50 text-emerald-700">Popular</Badge>
                            )}
                          </div>
                          <h3 className="mb-2 text-lg font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                          {service.score && (
                            <p className="text-xs text-emerald-600 mt-2">Relevance: {Math.round(service.score * 100)}%</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.map((cat: any) => {
                  const Icon = getCatIcon(cat.slug)
                  return (
                    <Link key={cat.id} href={`/services/${cat.slug}`}>
                      <Card className="group h-full border-2 border-transparent bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${GRADIENTS[cat.slug] || "from-emerald-500 to-teal-600"} shadow-md`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            {POPULAR.includes(cat.slug) && (
                              <Badge className="bg-emerald-50 text-emerald-700">Popular</Badge>
                            )}
                          </div>
                          <h3 className="mb-2 text-lg font-semibold">{cat.name}</h3>
                          <p className="text-sm text-muted-foreground">{cat.services.length} service{cat.services.length === 1 ? "" : "s"} available</p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
