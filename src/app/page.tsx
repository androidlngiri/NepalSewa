import dynamic from "next/dynamic"
import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { ServicesSection } from "@/components/landing/ServicesSection"
import { Footer } from "@/components/landing/Footer"

const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks").then((m) => m.HowItWorks), { loading: () => <div className="h-96" /> })
const WhyChooseUs = dynamic(() => import("@/components/landing/WhyChooseUs").then((m) => m.WhyChooseUs), { loading: () => <div className="h-96" /> })
const Stats = dynamic(() => import("@/components/landing/Stats").then((m) => m.Stats), { loading: () => <div className="h-48" /> })
const Testimonials = dynamic(() => import("@/components/landing/Testimonials").then((m) => m.Testimonials), { loading: () => <div className="h-96" /> })
const FAQSection = dynamic(() => import("@/components/landing/FAQSection").then((m) => m.FAQSection), { loading: () => <div className="h-96" /> })
const CTASection = dynamic(() => import("@/components/landing/CTASection").then((m) => m.CTASection), { loading: () => <div className="h-64" /> })

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <HowItWorks />
        <WhyChooseUs />
        <Stats />
        <Testimonials />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
