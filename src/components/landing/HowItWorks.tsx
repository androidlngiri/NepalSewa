"use client"

import { FileText, Users, ThumbsUp, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    icon: FileText,
    title: "1. Post What You Need",
    description:
      "Describe your task, add photos, and set a suggested budget. Pick your ward and urgency level.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "2. Taskers Bid Their Price",
    description:
      "Local taskers review your request and send you bids with their price. You get notified instantly.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: ThumbsUp,
    title: "3. Compare & Pick Your Tasker",
    description:
      "Compare bids, check ratings and reviews. Pick the tasker that offers the best value and get the job done.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Star,
    title: "4. Done, Paid & Reviewed",
    description:
      "Tasker completes the job. Pay cash or eSewa. Leave a review to help your community choose better.",
    color: "from-purple-500 to-pink-500",
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Post a request, get bids, choose your tasker. It&apos;s that simple.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${step.color} shadow-xl`}
                >
                  <step.icon className="h-9 w-9 text-white" />
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-[calc(100%-5rem)] h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-amber-200 -translate-y-1/2" />
                )}
              </div>
              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-6 text-base shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              Post Your First Request
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
