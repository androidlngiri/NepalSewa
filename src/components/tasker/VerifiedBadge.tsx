import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function VerifiedBadge({ className, size = "md" }: VerifiedBadgeProps) {
  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const textSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700",
        textSizes[size],
        className,
      )}
    >
      <ShieldCheck className={cn("text-emerald-600", sizes[size])} />
      Verified
    </span>
  )
}
