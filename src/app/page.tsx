import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { ServicesSection } from "@/components/landing/ServicesSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { WhyChooseUs } from "@/components/landing/WhyChooseUs"
import { Stats } from "@/components/landing/Stats"
import { Testimonials } from "@/components/landing/Testimonials"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"

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
