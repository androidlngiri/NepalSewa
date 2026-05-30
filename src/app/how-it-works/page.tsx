"use client"

import Link from "next/link"
import { Search, ClipboardCheck, CreditCard, Star, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { CTASection } from "@/components/landing/CTASection"

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Describe Your Task",
    description: "Tell us what you need done — plumbing, cleaning, electrical work, tutoring, or anything else. Add details like your ward number in Butwal, preferred time, and budget range.",
    details: [
      "Choose from 50+ service categories",
      "Add photos for clarity",
      "Set your preferred schedule",
      "Define your budget range",
    ],
    color: "from-emerald-500 to-teal-500",
  },
  {
    step: "02",
    icon: ClipboardCheck,
    title: "Receive Bids from Taskers",
    description: "Qualified taskers near your ward review your request and send competitive bids. You'll see their rating, experience, and price upfront.",
    details: [
      "Get bids within 30 minutes on average",
      "View tasker ratings & reviews",
      "Compare prices side by side",
      "Chat directly with taskers",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Book & Pay Securely",
    description: "Choose the best tasker, agree on the price, and book. Payment is held securely until the job is done to your satisfaction.",
    details: [
      "Secure escrow payment system",
      "Pay online or in cash",
      "Transparent pricing, no hidden fees",
      "Cancel anytime before work starts",
    ],
    color: "from-amber-500 to-orange-500",
  },
  {
    step: "04",
    icon: Star,
    title: "Job Done & Reviewed",
    description: "Task completed to your satisfaction. Release payment, leave a review, and help other customers make informed choices.",
    details: [
      "Rate & review your tasker",
      "Earn reward points for reviews",
      "Get customer support if needed",
      "Re-book your favorite taskers",
    ],
    color: "from-purple-500 to-pink-500",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                <Sparkles className="h-4 w-4" />
                Simple & Transparent
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                How NepalSewa Works
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Getting things done in Butwal is as easy as 1-2-3-4.
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className={`flex flex-col items-center gap-8 lg:flex-row ${
                    i % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white text-sm font-bold mb-4`}>
                      {step.step}
                    </span>
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${step.color} shadow-xl`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
                    <p className="text-muted-foreground mb-6 max-w-lg">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${step.color}`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className={`h-64 w-64 rounded-3xl bg-gradient-to-br ${step.color} opacity-10`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  )
}
