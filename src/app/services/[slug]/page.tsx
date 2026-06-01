import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

const ICON_MAP: Record<string, string> = {
  Wrench: "🔧", Zap: "⚡", PaintBucket: "🎨", Home: "🏠",
  Truck: "🚚", Code: "💻", GraduationCap: "🎓", Scissors: "✂️", Brush: "🖌️",
}

function getIconSvg(iconName: string | null) {
  return ICON_MAP[iconName || ""] || "📋"
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = slug.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  const category = await prisma.category.findFirst({ where: { slug: cleanSlug } })
  if (!category) return { title: "Service Not Found - NepalSewa" }
  const title = `${category.name} Services - NepalSewa Butwal`
  const description = category.description || `Find trusted ${category.name.toLowerCase()} service providers in Butwal, Nepal.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(category.name + " Services")}&description=${encodeURIComponent(description)}&type=Service`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og?title=${encodeURIComponent(category.name + " Services")}&description=${encodeURIComponent(description)}&type=Service`],
    },
  }
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params
  const cleanSlug = slug.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

  const category = await prisma.category.findFirst({ where: { slug: cleanSlug } })
  if (!category) notFound()

  const services = await prisma.service.findMany({
    where: { categoryId: category.id, isActive: true },
    orderBy: { price: "asc" },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${category.name} Services in Butwal`,
            description: category.description,
            numberOfItems: services.length,
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: s.name,
                description: s.description,
                provider: {
                  "@type": "Organization",
                  name: "NepalSewa",
                  url: "https://nepal-sewa.vercel.app",
                },
                areaServed: {
                  "@type": "City",
                  name: "Butwal",
                },
                offers: {
                  "@type": "Offer",
                  price: s.price,
                  priceCurrency: "NPR",
                  availability: "https://schema.org/InStock",
                },
              },
            })),
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://nepal-sewa.vercel.app" },
                { "@type": "ListItem", position: 2, name: "Services", item: "https://nepal-sewa.vercel.app/services" },
                { "@type": "ListItem", position: 3, name: category.name },
              ],
            },
          }),
        }}
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all services
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl shadow-md">
            {getIconSvg(category.icon)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name} Services</h1>
            <p className="text-muted-foreground mt-1">{category.description}</p>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Post a request and let taskers bid their best price — you choose.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">No services available yet.</p>
          )}
          {services.map((service) => (
              <Card key={service.id} className="group border-2 border-transparent hover:border-emerald-200 hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {service.priceUnit}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Expected range: NPR {service.price} — taskers bid their own price
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Bidding opens</span>
                    <Link
                      href={`/dashboard/user/requests/new?service=${service.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-sm font-medium transition-all"
                    >
                      Post a Request &amp; Get Bids
                    </Link>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
