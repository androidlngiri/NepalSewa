"use client"

import { useState } from "react"
import { ChevronDown, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How do I find a tasker in Butwal?",
    answer:
      "Simply describe your task, set a suggested budget, and post it on NepalSewa. Taskers in your area will see it and send you bids. Compare their prices, ratings, and reviews — then choose the best one.",
  },
  {
    question: "Is it safe to hire through NepalSewa?",
    answer:
      "Absolutely. All taskers go through a verification process. We check their credentials, and every completed job is rated and reviewed. Our secure payment system protects both parties.",
  },
  {
    question: "How much does it cost to use NepalSewa?",
    answer:
      "Posting a task and browsing bids is completely free. We only charge a small service fee (3-5% of the job amount) when a tasker completes your job. Taskers pay nothing unless they earn.",
  },
  {
    question: "What areas of Butwal do you cover?",
    answer:
      "We cover all 19 wards of Butwal Sub-Metropolitan City, including Milijuli, Golpark, Suryapura, Jitgadhi, Bageshwori, and surrounding areas. We're expanding to Bhairahawa and Devdaha soon.",
  },
  {
    question: "Can I become a tasker on NepalSewa?",
    answer:
      "Yes! If you have a skill — plumbing, electrical, painting, tutoring, cleaning, etc. — you can sign up as a tasker. Create your profile, browse open requests in your area, and bid on jobs that fit you.",
  },
  {
    question: "What if I'm not satisfied with the service?",
    answer:
      "Your satisfaction matters. If the work isn't up to standard, you can discuss it with the tasker. Our support team mediates any disputes to ensure fair resolution for both sides.",
  },
  {
    question: "How quickly can I get a tasker?",
    answer:
      "Most tasks receive bids within 30 minutes during business hours. Many taskers offer same-day or next-day service. Urgent requests can be tagged for faster response.",
  },
  {
    question: "Do you offer services in Nepali language?",
    answer:
      "Yes! The entire platform is available in Nepali and English. All our taskers are local Nepali speakers. You can communicate in the language you're most comfortable with.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Everything you need to know about NepalSewa.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.question}
              className={cn(
                "rounded-2xl border bg-white transition-all",
                openIndex === i && "border-emerald-200 shadow-md"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-medium text-base pr-4">
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                    openIndex === i
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {openIndex === i ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </div>
              </button>
              <div
                id={`faq-answer-${i}`}
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === i ? "max-h-96 pb-5" : "max-h-0"
                )}
              >
                <div className="px-6 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  )
}
