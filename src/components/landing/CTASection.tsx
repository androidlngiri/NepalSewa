"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Gavel, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Free to join — no hidden fees
          </div>

          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Get Things Done?
          </h2>
          <p className="mt-4 max-w-xl text-lg text-emerald-100">
            Post what you need, compare bids from local taskers, and pick the best deal.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button
              render={<Link href="/auth/signup?role=user" />}
              nativeButton={false}
              size="lg"
              className="h-14 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 px-10 text-base font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              <Gavel className="mr-2 h-5 w-5" />
              Post a Request
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              render={<Link href="/auth/signup?role=tasker" />}
              nativeButton={false}
              size="lg"
              variant="outline"
              className="h-14 rounded-2xl border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 px-10 text-base font-semibold backdrop-blur-sm transition-all"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              I Want to Work
            </Button>
          </div>

          <p className="mt-6 text-sm text-emerald-200">
            Free to join • You choose the price • No hidden fees
          </p>
        </div>
      </div>
    </section>
  )
}
