"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  id: string
  name: string
  slug: string
  description: string | null
  price: number | null
  priceUnit: string | null
  categoryName: string
  categorySlug: string
  score?: number
}

interface Category {
  id: string
  name: string
  slug: string
  services: SearchResult[]
}

export function FloatingSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
    }
  }, [open])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      setLoading(true)
      fetch(`/api/services/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => setResults(Array.isArray(data) ? data : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const allResults = results.flatMap((cat) =>
    cat.services.map((svc) => ({ ...svc, categoryName: cat.name })),
  )

  const goToService = useCallback(
    (slug: string) => {
      setOpen(false)
      router.push(`/services/${slug}`)
    },
    [router],
  )

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-36 z-50 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 lg:bottom-24"
          aria-label="Search services"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white" />
          </span>
          <Search className="h-6 w-6" />
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="bg-background relative w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="text-muted-foreground h-5 w-5 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services... (Ctrl+K)"
                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-muted rounded-md border px-2 py-1 text-xs"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {!query.trim() ? (
                <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                  Type to search across all services
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                </div>
              ) : allResults.length === 0 ? (
                <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                  No services found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="py-2">
                  {results.map((cat) => (
                    <div key={cat.slug}>
                      <div className="text-muted-foreground px-4 py-1.5 text-xs font-medium tracking-wider uppercase">
                        {cat.name}
                      </div>
                      {cat.services.map((svc) => (
                        <button
                          key={svc.id}
                          onClick={() => goToService(svc.slug)}
                          className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{svc.name}</p>
                            {svc.description && (
                              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                {svc.description}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {svc.price != null && (
                              <Badge variant="secondary" className="text-[10px]">
                                रू {svc.price.toLocaleString()}
                                {svc.priceUnit ? `/${svc.priceUnit}` : ""}
                              </Badge>
                            )}
                            <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {allResults.length > 0 && (
              <div className="text-muted-foreground border-t px-4 py-2 text-center text-xs">
                {allResults.length} service{allResults.length !== 1 ? "s" : ""} found
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
