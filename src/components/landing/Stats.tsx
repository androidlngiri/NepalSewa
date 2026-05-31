"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Loader2,
} from "lucide-react"

interface StatsData {
  users: number
  taskers: number
  completedJobs: number
  totalRequests: number
  satisfactionRate: number | null
  growthRate: number | null
}

export function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.users === "number") setStats(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const items = [
    {
      icon: Users,
      value: stats ? `${stats.users.toLocaleString("ne-NP")}+` : null,
      label: "Registered Users",
    },
    {
      icon: Briefcase,
      value: stats ? `${stats.completedJobs}+` : null,
      label: "Services Completed",
    },
    {
      icon: CheckCircle,
      value: stats?.satisfactionRate ? `${stats.satisfactionRate}%` : null,
      label: "Satisfaction Rate",
    },
    {
      icon: TrendingUp,
      value: stats?.growthRate != null ? `${stats.growthRate >= 0 ? "+" : ""}${stats.growthRate}%` : null,
      label: "Growth (30d)",
    },
  ]

  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative">
        {loading && !stats ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {items.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white">
                  {stat.value ?? "—"}
                </div>
                <div className="mt-2 text-sm text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
