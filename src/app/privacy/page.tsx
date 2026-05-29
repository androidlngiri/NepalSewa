import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - NepalSewa",
  description: "Privacy policy for NepalSewa service marketplace.",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 lg:py-24">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="space-y-6">
            <p>Last updated: January 2025</p>

            <h2 className="text-xl font-semibold mt-8">1. Information We Collect</h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email, phone number, address)</li>
              <li>Profile information (bio, photo, skills, ward number)</li>
              <li>Service request details and communications</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitate connections between customers and Taskers</li>
              <li>Process transactions and send notifications</li>
              <li>Improve our platform and user experience</li>
              <li>Send service-related communications</li>
              <li>Prevent fraud and ensure platform safety</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">3. Information Sharing</h2>
            <p>
              We share information only as necessary to provide our services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Between customers and Taskers to facilitate service bookings</li>
              <li>With payment processors to handle transactions</li>
              <li>When required by law or to protect our rights</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption
              in transit and at rest, secure authentication, and regular security audits.
            </p>

            <h2 className="text-xl font-semibold mt-8">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Object to processing of your data</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and platform functionality. We do not use
              third-party tracking cookies without your consent.
            </p>

            <h2 className="text-xl font-semibold mt-8">7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at{" "}
              <a href="mailto:hello@nepalsewa.com.np" className="text-emerald-600 hover:underline">
                hello@nepalsewa.com.np
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
