"use client"

import {
  ShieldCheck,
  Clock,
  Gavel,
  MessageSquare,
  MapPin,
  TrendingDown,
} from "lucide-react"

const features = [
  {
    icon: Gavel,
    title: "You Set the Price",
    description:
      "Post your task with a suggested budget. Taskers compete with their best offers — you pick what works for you.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Clock,
    title: "Same-Day Service",
    description:
      "Need help urgently? Many taskers offer same-day service. Average response time is under 30 minutes.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: ShieldCheck,
    title: "Verified Taskers",
    description:
      "Every tasker is background-verified, rated, and reviewed by real customers in Butwal before they can start bidding.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: MessageSquare,
    title: "Compare Before You Decide",
    description:
      "See all bids side by side — compare prices, ratings, and messages. No pressure, no rush.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: MapPin,
    title: "Local to Butwal",
    description:
      "We know Butwal inside out. From Milijuli to Motipur, serviced across all 19 wards by nearby taskers.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    icon: TrendingDown,
    title: "Save With Competition",
    description:
      "Taskers bid against each other to win your business. You often pay less than asking price.",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Why NepalSewa?
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            No fixed prices, no hidden fees. You say what you want to pay, and taskers bid for the job.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-white p-8 transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgColor} ${feature.color} transition-transform group-hover:scale-110`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
