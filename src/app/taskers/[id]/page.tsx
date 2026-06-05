"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Loader2,
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { VerifiedBadge } from "@/components/tasker/VerifiedBadge"
import { SkillsList } from "@/components/tasker/SkillsList"
import { PortfolioGallery } from "@/components/tasker/PortfolioGallery"
import { ReviewPhotos } from "@/components/tasker/ReviewPhotos"
import { formatDate } from "@/lib/utils"

interface TaskerProfile {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  skills: string[]
  rating: number | null
  isVerified: boolean
  verifiedAt: string | null
  tier: string
  address: string | null
  wardNo: number | null
  createdAt: string
  portfolioImages: string[]
  _count: { taskerAssignments: number; reviewsReceived: number; bids: number }
  reviews: any[]
  recentAssignments: any[]
}

export default function TaskerProfilePage() {
  const params = useParams()
  const [tasker, setTasker] = useState<TaskerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/taskers/${params.id}`)
        if (!res.ok) throw new Error("Not found")
        setTasker(await res.json())
      } catch {
        setError("Tasker not found")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
        <Footer />
      </>
    )
  }

  if (error || !tasker) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">Tasker Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This tasker profile doesn&apos;t exist or has been removed.
          </p>
          <Link href="/taskers">
            <Button>Browse Taskers</Button>
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const initials =
    tasker.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "T"

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href="/taskers"
            className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Taskers
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-muted relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
                    {tasker.image ? (
                      <img
                        src={tasker.image}
                        alt={tasker.name || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-3xl font-bold text-emerald-700">
                        {initials}
                      </div>
                    )}
                    {tasker.isVerified && (
                      <div className="absolute -right-0.5 -bottom-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <h1 className="text-xl font-bold">{tasker.name}</h1>
                  <div className="mt-1 mb-3 flex items-center justify-center gap-2">
                    {tasker.isVerified && <VerifiedBadge size="sm" />}
                    {tasker.tier === "PRO" && (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-[10px] text-amber-700"
                      >
                        PRO
                      </Badge>
                    )}
                  </div>

                  {tasker.rating != null && (
                    <div className="mb-3 flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{tasker.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">
                        ({tasker._count.reviewsReceived} reviews)
                      </span>
                    </div>
                  )}

                  <div className="text-muted-foreground space-y-2 text-sm">
                    {tasker.address && (
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {tasker.address}
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {tasker._count.taskerAssignments} jobs completed
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Member since {formatDate(tasker.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tasker.skills.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SkillsList skills={tasker.skills} size="sm" />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6 lg:col-span-2">
              {tasker.bio && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {tasker.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {tasker.portfolioImages.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PortfolioGallery images={tasker.portfolioImages} />
                  </CardContent>
                </Card>
              )}

              {tasker.recentAssignments.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Recent Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tasker.recentAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{a.request?.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {a.request?.service?.name}
                          </p>
                        </div>
                        {a.request?.images?.[0] && (
                          <img
                            src={a.request.images[0]}
                            alt=""
                            className="ml-3 h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasker.reviews.length === 0 ? (
                    <p className="text-muted-foreground py-4 text-center text-sm">No reviews yet</p>
                  ) : (
                    <div className="space-y-4">
                      {tasker.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="mb-1 flex items-center gap-2">
                            <div className="bg-muted h-7 w-7 overflow-hidden rounded-full">
                              {review.reviewer?.image ? (
                                <img
                                  src={review.reviewer.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                  {review.reviewer?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium">{review.reviewer?.name}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                />
                              ))}
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground ml-9 text-sm">{review.comment}</p>
                          )}
                          {review.photos?.length > 0 && (
                            <div className="mt-1 ml-9">
                              <ReviewPhotos photos={review.photos} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
