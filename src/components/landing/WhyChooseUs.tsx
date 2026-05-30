"use client"

import {
  ShieldCheck,
  Clock,
  BadgeCheck,
  MessageSquare,
  MapPin,
  Wallet,
} from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description:
      "Every tasker is background-verified, rated, and reviewed by real customers in Butwal.",
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
    icon: BadgeCheck,
    title: "Quality Guaranteed",
    description:
      "Not satisfied? We stand behind our work. Get a free redo or your money back — no questions asked.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: MessageSquare,
    title: "Transparent Pricing",
    description:
      "See the price upfront. Compare bids from multiple taskers. No hidden charges, no surprises.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: MapPin,
    title: "Local to Butwal",
    description:
      "We know Butwal inside out. From Milijuli to Motipur, serviced across all 19 wards.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    icon: Wallet,
    title: "Best Value Pricing",
    description:
      "Get competitive rates from local taskers. Save up to 30% compared to traditional service providers.",
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
            We make it easy, safe, and affordable to get things done in Butwal.
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
