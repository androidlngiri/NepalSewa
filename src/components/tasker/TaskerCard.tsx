import Link from "next/link"
import { Star, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { VerifiedBadge } from "./VerifiedBadge"
import { SkillsList } from "./SkillsList"
import { cn } from "@/lib/utils"

interface TaskerCardProps {
  tasker: {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    skills: string[]
    rating: number | null
    isVerified: boolean
    tier: string
    address: string | null
    _count: {
      taskerAssignments: number
      reviewsReceived: number
    }
  }
}

export function TaskerCard({ tasker }: TaskerCardProps) {
  return (
    <Link href={`/taskers/${tasker.id}`}>
      <Card className="group cursor-pointer border-2 border-transparent transition-all hover:border-emerald-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
              {tasker.image ? (
                <img
                  src={tasker.image}
                  alt={tasker.name || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-lg font-bold text-emerald-700">
                  {tasker.name?.charAt(0)?.toUpperCase() || "T"}
                </div>
              )}
              {tasker.isVerified && (
                <div className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{tasker.name}</h3>
                {tasker.isVerified && <VerifiedBadge size="sm" />}
                {tasker.tier === "PRO" && (
                  <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                    PRO
                  </span>
                )}
              </div>

              <div className="text-muted-foreground mb-2 flex items-center gap-3 text-xs">
                {tasker.rating != null && (
                  <span className="flex items-center gap-0.5 font-medium text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {tasker.rating.toFixed(1)}
                  </span>
                )}
                <span>{tasker._count.taskerAssignments} jobs</span>
                <span>{tasker._count.reviewsReceived} reviews</span>
                {tasker.address && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {tasker.address}
                  </span>
                )}
              </div>

              {tasker.bio && (
                <p className="text-muted-foreground mb-2 line-clamp-1 text-xs">{tasker.bio}</p>
              )}

              {tasker.skills.length > 0 && (
                <SkillsList skills={tasker.skills.slice(0, 3)} size="sm" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
