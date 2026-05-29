import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/ui/error-boundary"

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "NepalSewa - Butwal's Trusted Service Marketplace",
    template: "%s | NepalSewa",
  },
  description:
    "Find trusted professionals in Butwal, Nepal for home services, repairs, cleaning, tutoring, and more. Book verified taskers instantly.",
  keywords: [
    "Butwal services",
    "Nepal service marketplace",
    "home services Butwal",
    "taskers Nepal",
    "plumber Butwal",
    "electrician Butwal",
    "cleaning service Butwal",
    "local services Nepal",
  ],
  authors: [{ name: "NepalSewa" }],
  creator: "NepalSewa",
  publisher: "NepalSewa",
  metadataBase: new URL("https://nepalsewa.com.np"),
  openGraph: {
    type: "website",
    locale: "ne_NP",
    alternateLocale: "en_US",
    siteName: "NepalSewa",
    title: "NepalSewa - Butwal's Trusted Service Marketplace",
    description:
      "Find trusted professionals in Butwal, Nepal for all your service needs. Book verified taskers instantly.",
    url: "https://nepalsewa.com.np",
  },
  twitter: {
    card: "summary_large_image",
    title: "NepalSewa - Butwal's Trusted Service Marketplace",
    description:
      "Find trusted professionals in Butwal, Nepal for all your service needs.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://nepalsewa.com.np",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ne" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "NepalSewa",
              description:
                "Butwal's premier service marketplace connecting customers with trusted local professionals.",
              url: "https://nepalsewa.com.np",
              telephone: "+977-98XXXXXXXX",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Butwal",
                addressLocality: "Butwal",
                addressRegion: "Lumbini Province",
                addressCountry: "NP",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 27.7,
                longitude: 83.4667,
              },
              areaServed: [
                {
                  "@type": "City",
                  name: "Butwal",
                },
                {
                  "@type": "City",
                  name: "Bhairahawa",
                },
                {
                  "@type": "City",
                  name: "Devdaha",
                },
              ],
              sameAs: [
                "https://facebook.com/nepalsewa",
                "https://instagram.com/nepalsewa",
              ],
              founder: {
                "@type": "Person",
                name: "NepalSewa Team",
              },
              foundingDate: "2024",
              priceRange: "$$",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </TooltipProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
