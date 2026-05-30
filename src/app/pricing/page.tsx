import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing - NepalSewa Butwal",
  description: "Transparent pricing for NepalSewa's service marketplace. Post tasks for free, pay only when satisfied.",
}

const plans = [
  {
    name: "Free",
    subtitle: "For customers",
    price: "NPR 0",
    period: "forever",
    description: "Post tasks and browse bids at no cost.",
    features: [
      "Post unlimited tasks",
      "Browse & compare bids",
      "Chat with taskers",
      "Rate & review services",
      "Email support",
    ],
    cta: "Get Started",
    href: "/auth/signup?role=user",
    popular: false,
  },
  {
    name: "Standard",
    subtitle: "For taskers",
    price: "5%",
    period: "per job",
    description: "Start earning with minimal fees.",
    features: [
      "Unlimited job applications",
      "Create your profile",
      "Accept secure payments",
      "Get customer reviews",
      "Priority support",
      "Earnings dashboard",
    ],
    cta: "Become a Tasker",
    href: "/auth/signup?role=tasker",
    popular: true,
  },
  {
    name: "Pro",
    subtitle: "For power taskers",
    price: "3%",
    period: "per job + NPR 199/mo",
    description: "Maximize your earnings with premium features.",
    features: [
      "All Standard features",
      "Reduced service fee (3%)",
      "Featured profile badge",
      "Priority in search results",
      "Advanced analytics",
      "Dedicated support",
      "Early access to new jobs",
    ],
    cta: "Go Pro",
    href: "/auth/signup?role=tasker",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Post tasks for free. Taskers pay a small fee only when they get hired.
                No hidden costs, no surprises.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col border-2 ${
                    plan.popular
                      ? "border-emerald-500 shadow-xl shadow-emerald-500/10"
                      : "border-transparent"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-1 text-xs font-medium text-white shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.subtitle}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 mt-0.5">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={plan.href} className="w-full">
                      <Button
                        className={`w-full h-11 ${
                          plan.popular
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
