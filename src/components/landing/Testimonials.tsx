"use client"

import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Rajesh Sharma",
    location: "Ward 3, Butwal",
    role: "Homeowner",
    content:
      "My sink was leaking at midnight. Found a plumber on NepalSewa in 10 minutes. He came within an hour and fixed it perfectly. This service is a lifesaver!",
    rating: 5,
    initials: "RS",
  },
  {
    name: "Sita Poudel",
    location: "Ward 7, Butwal",
    role: "Homemaker",
    content:
      "I needed my house painted before Tihar. Got 3 bids within hours, chose the best one. The painter did an amazing job at half the price quoted by others.",
    rating: 5,
    initials: "SP",
  },
  {
    name: "Anil KC",
    location: "Ward 11, Butwal",
    role: "Business Owner",
    content:
      "We use NepalSewa for office cleaning and IT support. Reliable, professional, and affordable. Highly recommend to all business owners in Butwal.",
    rating: 5,
    initials: "AK",
  },
  {
    name: "Mina Thapa",
    location: "Ward 5, Butwal",
    role: "Teacher",
    content:
      "Found a great math tutor for my son through NepalSewa. His grades have improved significantly. The platform is very easy to use.",
    rating: 4,
    initials: "MT",
  },
]

export function Testimonials() {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-emerald-50/50 to-white overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-emerald-100/30 to-transparent rounded-full blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative">
        <div className="flex flex-col items-center text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Real stories from real people in Butwal.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border bg-white/80 p-8 backdrop-blur-sm transition-all hover:border-emerald-200 hover:shadow-xl"
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-emerald-100 group-hover:text-emerald-200 transition-colors" />
              <div className="mb-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-medium">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </div>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_: unknown, j: number) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${
                      j < testimonial.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
