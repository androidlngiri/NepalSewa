"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Wrench,
  Zap,
  PaintBucket,
  Home,
  Truck,
  Code,
  GraduationCap,
  Scissors,
  Brush,
  Clock,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const services = [
  {
    icon: Wrench,
    title: "Plumbing",
    slug: "plumbing",
    description: "Pipe repair, faucet installation, water tank cleaning",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    popular: true,
  },
  {
    icon: Zap,
    title: "Electrical",
    slug: "electrical",
    description: "Wiring, switchboard repair, fan installation",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    popular: true,
  },
  {
    icon: PaintBucket,
    title: "Painting",
    slug: "painting",
    description: "Interior/exterior painting, texture finishes",
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    popular: false,
  },
  {
    icon: Home,
    title: "Cleaning",
    slug: "cleaning",
    description: "Deep cleaning, office cleaning, carpet wash",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50",
    popular: true,
  },
  {
    icon: Truck,
    title: "Moving & Delivery",
    slug: "moving-delivery",
    description: "House shifting, parcel delivery, cargo transport",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    popular: false,
  },
  {
    icon: Code,
    title: "Tech Support",
    slug: "tech-support",
    description: "Computer repair, web design, IT solutions",
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    popular: false,
  },
  {
    icon: GraduationCap,
    title: "Tutoring",
    slug: "tutoring",
    description: "Home tutoring, exam prep, skill classes",
    color: "from-teal-500 to-emerald-600",
    bgColor: "bg-teal-50",
    popular: false,
  },
  {
    icon: Scissors,
    title: "Salon & Spa",
    slug: "salon-spa",
    description: "Haircut, massage, beauty services at home",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    popular: true,
  },
]

export function ServicesSection() {
  const router = useRouter()
  return (
    <section className="relative py-20 lg:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-14">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            Our Services
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything You Need
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            From urgent repairs to planned services — find the right professional
            for every job in Butwal.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`}>
              <Card className="group relative h-full overflow-hidden border-2 border-transparent bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} shadow-md`}
                    >
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    {service.popular && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 text-xs"
                      >
                        Popular
                      </Badge>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-end text-sm">
                    <span className="text-muted-foreground group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                      Get quotes →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-2 px-8 py-6 text-base font-medium"
            onClick={() => router.push("/services")}
          >
            View All Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
