"use client"

import { Search, ClipboardCheck, CreditCard, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    icon: Search,
    title: "1. Describe Your Task",
    description:
      "Tell us what you need — plumbing, cleaning, electrical work. Add photos, location (your ward), and set your budget.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: ClipboardCheck,
    title: "2. Get Matched Instantly",
    description:
      "Qualified taskers in your area review your request and send you bids with their price within minutes.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: CreditCard,
    title: "3. Compare & Book",
    description:
      "Review ratings, compare prices, check profiles. Book the best tasker and schedule at your convenience.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Star,
    title: "4. Get It Done & Rate",
    description:
      "Task gets completed. Pay securely. Leave a review to help the community — earn rewards for both sides.",
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
            Getting help has never been easier. Four simple steps to get your
            tasks done.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${step.color} shadow-xl shadow-${step.color}/20`}
                >
                  <step.icon className="h-9 w-9 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
          <div className="absolute left-[12%] right-[12%] top-10 hidden md:block">
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200" />
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-6 text-base shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              Start Your First Task
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
