import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - NepalSewa",
  description: "Terms and conditions for using NepalSewa service marketplace.",
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 lg:py-24">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-sm max-w-none space-y-6">
            <p>Last updated: January 2025</p>

            <h2 className="text-xl font-semibold mt-8">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NepalSewa, you agree to be bound by these Terms of Service. If you do not agree,
              please do not use the platform.
            </p>

            <h2 className="text-xl font-semibold mt-8">2. Description of Service</h2>
            <p>
              NepalSewa is an online marketplace that connects customers with local service providers (Taskers).
              We facilitate the booking and payment process but are not directly responsible for the quality of
              services provided by Taskers.
            </p>

            <h2 className="text-xl font-semibold mt-8">3. User Responsibilities</h2>
            <p>As a user of NepalSewa, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Communicate respectfully with other users</li>
              <li>Not misuse the platform for fraudulent activities</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">4. Tasker Obligations</h2>
            <p>
              Taskers are independent contractors and not employees of NepalSewa. Taskers agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate representations of their skills and qualifications</li>
              <li>Complete booked services professionally and on time</li>
              <li>Maintain appropriate insurance and licenses where required</li>
              <li>Pay applicable service fees as outlined in the pricing page</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">5. Payments and Fees</h2>
            <p>
              Posting a task is free for customers. Taskers agree to pay a service fee as a percentage of each
              completed job. All payments are processed securely through our platform.
            </p>

            <h2 className="text-xl font-semibold mt-8">6. Dispute Resolution</h2>
            <p>
              If you are unsatisfied with a service, please contact our support team. We will mediate disputes
              and may offer refunds or credits at our discretion.
            </p>

            <h2 className="text-xl font-semibold mt-8">7. Limitation of Liability</h2>
            <p>
              NepalSewa is not liable for any damages arising from the use of our platform or services provided
              by Taskers. Our total liability is limited to the amount paid for the specific service in question.
            </p>

            <h2 className="text-xl font-semibold mt-8">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Users will be notified of material changes.
            </p>

            <h2 className="text-xl font-semibold mt-8">9. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
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
