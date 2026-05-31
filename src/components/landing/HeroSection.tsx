"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
  Wrench,
  PaintBucket,
  Home,
  Truck,
  Code,
  Gavel,
} from "lucide-react"

export function HeroSection() {
  const [stats, setStats] = useState<{
    users: number
    taskers: number
    completedJobs: number
    satisfactionRate: number | null
  } | null>(null)

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/4 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center pt-16 pb-20 text-center lg:pt-24 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            Butwal's Trusted Service Marketplace
          </motion.div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl select-text">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent selection:text-emerald-600">
              Expert Services
            </span>
            <br />
            <span className="select-text">At Your Doorstep in Butwal</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Post what you need, get multiple quotes from local taskers, and pick the best one.
          </motion.p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
            <button
              type="button"
              onClick={() => { window.location.href = "/auth/signup?role=user"; }}
              className="flex-1 cursor-pointer select-auto inline-flex items-center justify-center h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all text-base font-medium gap-2"
            >
              <Gavel className="h-5 w-5" />
              Post a Request & Get Quotes
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = "/services"; }}
              className="sm:flex-1 cursor-pointer select-auto inline-flex items-center justify-center h-14 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 text-base font-medium gap-2"
            >
              Browse Services
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Verified taskers</span>
            <span className="text-muted-foreground/40">|</span>
            <Star className="h-4 w-4 text-amber-500" />
            <span>Rated & reviewed</span>
            <span className="text-muted-foreground/40">|</span>
            <Zap className="h-4 w-4 text-emerald-500" />
            <span>You pick the best price</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6"
          >
            {[
              { icon: Wrench, label: "Plumbing" },
              { icon: Zap, label: "Electrical" },
              { icon: PaintBucket, label: "Painting" },
              { icon: Home, label: "Cleaning" },
              { icon: Truck, label: "Moving" },
              { icon: Code, label: "Tech Support" },
            ].map((item) => (
              <Link
                key={item.label}
                href={`/services?q=${item.label.toLowerCase()}`}
                className="flex flex-col items-center gap-2 rounded-2xl border bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {stats ? `${stats.users}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Registered Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {stats ? `${stats.taskers}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Active Taskers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {stats?.completedJobs ? `${stats.completedJobs}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Jobs Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {stats?.satisfactionRate ? `${stats.satisfactionRate}%` : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
