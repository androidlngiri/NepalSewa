"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Search, SlidersHorizontal, Star, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { TaskerCard } from "@/components/tasker/TaskerCard"
import { cn } from "@/lib/utils"

const SKILLS = [
  "Plumbing",
  "Electrical",
  "Painting",
  "Cleaning",
  "Moving/Delivery",
  "Tech Support",
  "Tutoring",
  "Salon/Spa",
]

interface Tasker {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  skills: string[]
  rating: number | null
  isVerified: boolean
  tier: string
  address: string | null
  _count: { taskerAssignments: number; reviewsReceived: number }
}

export default function TaskersPage() {
  const [taskers, setTaskers] = useState<Tasker[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState("rating")

  const fetchTaskers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (selectedSkill) params.set("skill", selectedSkill)
      if (verifiedOnly) params.set("verified", "true")
      params.set("sort", sort)

      const res = await fetch(`/api/taskers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTaskers(data.taskers || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [search, selectedSkill, verifiedOnly, sort])

  useEffect(() => {
    fetchTaskers()
  }, [fetchTaskers])

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">Find Taskers</h1>
            <p className="text-muted-foreground">Browse verified local professionals in Butwal.</p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by name or skill..."
                  className="h-11 pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant={verifiedOnly ? "default" : "outline"}
                className={cn("h-11 gap-1.5", verifiedOnly && "bg-emerald-600 text-white")}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
              >
                <ShieldCheck className="h-4 w-4" />
                Verified
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedSkill === skill
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "text-muted-foreground border-gray-200 bg-white hover:bg-gray-50",
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Sort:</span>
              {[
                { value: "rating", label: "Top Rated" },
                { value: "jobs", label: "Most Jobs" },
                { value: "newest", label: "Newest" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    sort === option.value
                      ? "text-foreground bg-gray-100"
                      : "text-muted-foreground hover:bg-gray-50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : taskers.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-2">No taskers found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {taskers.map((tasker) => (
                <TaskerCard key={tasker.id} tasker={tasker} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
