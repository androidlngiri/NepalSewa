"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, Wrench, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  isActive: boolean
  services: { id: string; name: string; isActive: boolean }[]
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage service categories and offerings.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No services configured</h3>
              <p className="text-sm text-muted-foreground">Add categories and services to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card key={cat.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                      {cat.services.length}
                    </Badge>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {cat.services.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-sm">
                        <Wrench className="h-3 w-3 text-muted-foreground" />
                        <span>{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
