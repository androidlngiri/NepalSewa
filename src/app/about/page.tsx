import Link from "next/link"
import { Wrench, Target, Heart, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { CTASection } from "@/components/landing/CTASection"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About - NepalSewa Butwal",
  description: "Learn about NepalSewa — Butwal's trusted service marketplace connecting customers with verified local professionals.",
}

const values = [
  { icon: Shield, title: "Trust & Safety", description: "Every tasker is verified. Every transaction is secure." },
  { icon: Users, title: "Community First", description: "Built for Butwal, by locals who understand the community." },
  { icon: Heart, title: "Quality Service", description: "We stand behind every booking with our satisfaction guarantee." },
  { icon: Target, title: "Fair Pricing", description: "Transparent rates, no hidden fees, competitive bids." },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                About NepalSewa
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                NepalSewa is Butwal's first and most trusted online service marketplace. 
                We connect people who need tasks done with skilled professionals in their community. 
                Our mission is to make quality services accessible, affordable, and reliable for every household in Butwal.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 mb-16">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border bg-white p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-6 rounded-2xl text-base shadow-lg">
                  Join NepalSewa Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
