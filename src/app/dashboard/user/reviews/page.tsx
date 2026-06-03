"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewer: { id: string; name: string; image: string | null }
  reviewee?: { id: string; name: string; image: string | null }
}

export default function UserReviewsPage() {
  const [tab, setTab] = useState<"received" | "written">("received")
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = tab === "received" ? "/api/reviews" : "/api/reviews?filter=written"
    fetch(url)
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/user"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant={tab === "received" ? "default" : "outline"}
            onClick={() => setTab("received")}
          >
            Received
          </Button>
          <Button
            variant={tab === "written" ? "default" : "outline"}
            onClick={() => setTab("written")}
          >
            Written
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="text-muted-foreground/40 mb-4 h-12 w-12" />
              <h3 className="mb-1 text-lg font-medium">No reviews yet</h3>
              <p className="text-muted-foreground text-sm">
                {tab === "received"
                  ? "Reviews from taskers will appear here after tasks are completed."
                  : "Reviews you leave for taskers will appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const person = tab === "received" ? review.reviewer : review.reviewee
              return (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                          {person?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-sm font-medium">{person?.name || "Unknown"}</p>
                          <span className="text-muted-foreground text-xs">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_: unknown, j: number) => (
                            <Star
                              key={j}
                              className={`h-3.5 w-3.5 ${
                                j < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground text-sm">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
