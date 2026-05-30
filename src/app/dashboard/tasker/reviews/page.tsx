"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewer: { id: string; name: string; image: string | null }
}

export default function TaskerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0

  return (
    <DashboardLayout role="tasker">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/tasker"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">
            Reviews from customers you&apos;ve worked with.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
              <p className="text-sm text-muted-foreground">
                Reviews will appear here after customers complete jobs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                  <div>
                    <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {review.reviewer.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{review.reviewer.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, j) => (
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
                        <p className="text-sm text-muted-foreground">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
