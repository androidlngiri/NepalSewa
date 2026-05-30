"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Loader2, ArrowLeft, Wrench, Package, Plus, Eye, EyeOff,
  RefreshCw, AlertCircle, Pencil, X, Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  priceUnit: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  isActive: boolean
  sortOrder: number
  services: Service[]
}

function AdminServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddService, setShowAddService] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState<string | null>(null)
  const [editService, setEditService] = useState<string | null>(null)
  const [saving, setSaving] = useState("")

  const newCat = { name: "", slug: "", description: "" }
  const [newCategory, setNewCategory] = useState({ ...newCat })
  const [newService, setNewService] = useState({ name: "", slug: "", price: "", categoryId: "" })
  const [editCatName, setEditCatName] = useState("")
  const [editSvcName, setEditSvcName] = useState("")
  const [editSvcPrice, setEditSvcPrice] = useState("")

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/services")
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setCategories(data)
    } catch {
      setError("Failed to load services")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  async function toggleCategory(catId: string, current: boolean) {
    setSaving(`cat-toggle-${catId}`)
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", id: catId, isActive: !current }),
      })
      if (!res.ok) throw new Error()
      toast.success(current ? "Category disabled" : "Category enabled")
      fetchCategories()
    } catch {
      toast.error("Failed to toggle category")
    } finally {
      setSaving("")
    }
  }

  async function toggleService(svcId: string, current: boolean) {
    setSaving(`svc-toggle-${svcId}`)
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "service", id: svcId, isActive: !current }),
      })
      if (!res.ok) throw new Error()
      toast.success(current ? "Service disabled" : "Service enabled")
      fetchCategories()
    } catch {
      toast.error("Failed to toggle service")
    } finally {
      setSaving("")
    }
  }

  async function addCategory() {
    if (!newCategory.name || !newCategory.slug) {
      toast.error("Name and slug are required")
      return
    }
    setSaving("add-cat")
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", ...newCategory }),
      })
      if (!res.ok) throw new Error()
      toast.success("Category added")
      setNewCategory({ ...newCat })
      setShowAddCategory(false)
      fetchCategories()
    } catch {
      toast.error("Failed to add category")
    } finally {
      setSaving("")
    }
  }

  async function addService() {
    if (!newService.name || !newService.slug || !newService.categoryId) {
      toast.error("Name, slug, and category are required")
      return
    }
    setSaving("add-svc")
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "service",
          ...newService,
          price: parseFloat(newService.price) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Service added")
      setNewService({ name: "", slug: "", price: "", categoryId: "" })
      setShowAddService(null)
      fetchCategories()
    } catch {
      toast.error("Failed to add service")
    } finally {
      setSaving("")
    }
  }

  async function saveCategoryName(catId: string) {
    if (!editCatName.trim()) return
    setSaving(`cat-edit-${catId}`)
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", id: catId, name: editCatName }),
      })
      if (!res.ok) throw new Error()
      toast.success("Category updated")
      setEditCategory(null)
      fetchCategories()
    } catch {
      toast.error("Failed to update")
    } finally {
      setSaving("")
    }
  }

  async function saveServiceEdit(svcId: string) {
    if (!editSvcName.trim()) return
    setSaving(`svc-edit-${svcId}`)
    try {
      const body: any = { type: "service", id: svcId, name: editSvcName }
      if (editSvcPrice) body.price = parseFloat(editSvcPrice)
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success("Service updated")
      setEditService(null)
      fetchCategories()
    } catch {
      toast.error("Failed to update")
    } finally {
      setSaving("")
    }
  }

  function startEditCategory(cat: Category) {
    setEditCategory(cat.id)
    setEditCatName(cat.name)
  }

  function startEditService(svc: Service) {
    setEditService(svc.id)
    setEditSvcName(svc.name)
    setEditSvcPrice(String(svc.price))
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
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
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={fetchCategories} aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={() => setShowAddCategory(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
              <p className="text-sm font-medium mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchCategories}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {showAddCategory && (
          <Card className="border-emerald-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium">New Category</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="e.g., Gardening" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })} placeholder="e.g., gardening" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Brief description" rows={2} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" onClick={addCategory} disabled={saving === "add-cat"} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving === "add-cat" ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddCategory(false); setNewCategory({ ...newCat }) }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && categories.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No services configured</h3>
              <p className="text-sm text-muted-foreground">Add a category to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card key={cat.id} className={!cat.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {editCategory === cat.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => saveCategoryName(cat.id)} disabled={saving === `cat-edit-${cat.id}`}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setEditCategory(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <CardTitle className="text-base flex items-center gap-2">
                          {cat.name}
                          <button onClick={() => startEditCategory(cat)} className="text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3 w-3" />
                          </button>
                        </CardTitle>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!cat.isActive && <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">Disabled</Badge>}
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-xs">{cat.services.length}</Badge>
                    </div>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Switch
                      checked={cat.isActive}
                      onCheckedChange={() => toggleCategory(cat.id, cat.isActive)}
                      disabled={saving === `cat-toggle-${cat.id}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {saving === `cat-toggle-${cat.id}` ? "Saving..." : cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {cat.services.map((s) => (
                      <li key={s.id} className={`flex items-center gap-2 text-sm ${!s.isActive ? "opacity-50" : ""}`}>
                        <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
                        {editService === s.id ? (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <Input
                              value={editSvcName}
                              onChange={(e) => setEditSvcName(e.target.value)}
                              className="h-7 text-xs flex-1"
                              autoFocus
                            />
                            <Input
                              value={editSvcPrice}
                              onChange={(e) => setEditSvcPrice(e.target.value)}
                              className="h-7 text-xs w-20"
                              type="number"
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => saveServiceEdit(s.id)} disabled={saving === `svc-edit-${s.id}`}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setEditService(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 truncate">{s.name}</span>
                            <span className="text-muted-foreground text-xs">NPR {s.price}</span>
                            <button onClick={() => startEditService(s)} className="text-muted-foreground hover:text-foreground shrink-0">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => toggleService(s.id, s.isActive)}
                              disabled={saving === `svc-toggle-${s.id}`}
                              className="text-muted-foreground hover:text-foreground shrink-0"
                              title={s.isActive ? "Disable" : "Enable"}
                            >
                              {s.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3 text-emerald-500" />}
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  {showAddService === cat.id ? (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          placeholder="Service name"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value, categoryId: cat.id })}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="Slug"
                          value={newService.slug}
                          onChange={(e) => setNewService({ ...newService, slug: e.target.value, categoryId: cat.id })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Price"
                          value={newService.price}
                          onChange={(e) => {
                            const val = e.target.value
                            if (/^\d*\.?\d*$/.test(val)) setNewService({ ...newService, price: val, categoryId: cat.id })
                          }}
                          className="h-8 text-xs w-28"
                          type="text"
                          inputMode="decimal"
                        />
                        <Button size="sm" className="h-8 text-xs" onClick={addService} disabled={saving === "add-svc"}>
                          {saving === "add-svc" ? "Saving..." : "Add"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setShowAddService(null); setNewService({ name: "", slug: "", price: "", categoryId: "" }) }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddService(cat.id)}
                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add service
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminServicesPage
