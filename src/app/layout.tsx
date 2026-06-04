import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Providers } from "@/components/providers"
import PwaWrapper from "@/components/pwa/PwaWrapper"
import { ChatBot } from "@/components/chat/ChatBot"
import { FloatingSearch } from "@/components/search/FloatingSearch"

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
  manifest: "/manifest",
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
  icons: {
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ne_NP",
    alternateLocale: "en_US",
    siteName: "NepalSewa",
    title: "NepalSewa - Butwal's Trusted Service Marketplace",
    description:
      "Find trusted professionals in Butwal, Nepal for all your service needs. Book verified taskers instantly.",
    url: "https://nepalsewa.com.np",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NepalSewa - Butwal's Trusted Service Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NepalSewa - Butwal's Trusted Service Marketplace",
    description: "Find trusted professionals in Butwal, Nepal for all your service needs.",
    images: ["/og-image.png"],
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
    google: "",
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
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
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
              telephone: "+977-9800000000",
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
              sameAs: ["https://facebook.com/nepalsewa", "https://instagram.com/nepalsewa"],
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
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <TooltipProvider>
          <Providers>
            <ErrorBoundary>
              <main id="main-content">{children}</main>
            </ErrorBoundary>
          </Providers>
        </TooltipProvider>
        <PwaWrapper />
        <FloatingSearch />
        <ChatBot />
        <Toaster richColors position="top-center" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
