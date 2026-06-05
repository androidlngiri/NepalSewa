import { Wrench, Zap, PaintBucket, Home, Truck, Code, GraduationCap, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const skillIcons: Record<string, any> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Painting: PaintBucket,
  Cleaning: Sparkles,
  "Moving/Delivery": Truck,
  "Tech Support": Code,
  Tutoring: GraduationCap,
  "Salon/Spa": Home,
}

interface SkillsListProps {
  skills: string[]
  className?: string
  size?: "sm" | "md"
}

export function SkillsList({ skills, className, size = "md" }: SkillsListProps) {
  if (!skills || skills.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {skills.map((skill) => {
        const Icon = skillIcons[skill] || Wrench
        return (
          <span
            key={skill}
            className={cn(
              "text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1",
              size === "sm" ? "text-[10px]" : "text-xs",
            )}
          >
            <Icon className="h-3 w-3 text-emerald-600" />
            {skill}
          </span>
        )
      })}
    </div>
  )
}
