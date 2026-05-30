import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { Search, Wrench, Zap, PaintBucket, Home, Truck, Code, GraduationCap, Scissors } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Services - NepalSewa Butwal",
  description: "Browse all available services in Butwal, Nepal. From plumbing to tutoring, find verified professionals near you.",
  openGraph: {
    title: "Services - NepalSewa Butwal",
    description: "Browse all available services in Butwal, Nepal.",
  },
}

const allServices = [
  { icon: Wrench, title: "Plumbing", slug: "plumbing", count: "24 taskers", color: "from-blue-500 to-cyan-600", popular: true },
  { icon: Zap, title: "Electrical", slug: "electrical", count: "18 taskers", color: "from-amber-500 to-orange-600", popular: true },
  { icon: PaintBucket, title: "Painting", slug: "painting", count: "15 taskers", color: "from-rose-500 to-pink-600" },
  { icon: Home, title: "Cleaning", slug: "cleaning", count: "20 taskers", color: "from-emerald-500 to-green-600", popular: true },
  { icon: Truck, title: "Moving & Delivery", slug: "moving-delivery", count: "12 taskers", color: "from-violet-500 to-purple-600" },
  { icon: Code, title: "Tech Support", slug: "tech-support", count: "10 taskers", color: "from-indigo-500 to-blue-600" },
  { icon: GraduationCap, title: "Tutoring", slug: "tutoring", count: "22 taskers", color: "from-teal-500 to-emerald-600" },
  { icon: Scissors, title: "Salon & Spa", slug: "salon-spa", count: "16 taskers", color: "from-pink-500 to-rose-600", popular: true },
]

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-16 lg:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center mb-10">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                All Services in Butwal
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Find exactly what you need. Browse by category or search below.
              </p>
              <div className="mt-8 flex w-full max-w-xl gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search services..." aria-label="Filter services" className="h-12 pl-11 text-base rounded-2xl border-2" />
                </div>
                <Button className="h-12 rounded-2xl bg-emerald-600 text-white px-6 hover:bg-emerald-700">
                  Search
                </Button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allServices.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`}>
                  <Card className="group h-full border-2 border-transparent bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} shadow-md`}>
                          <service.icon className="h-6 w-6 text-white" />
                        </div>
                        {service.popular && (
                          <Badge className="bg-emerald-50 text-emerald-700">Popular</Badge>
                        )}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.count} available</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
