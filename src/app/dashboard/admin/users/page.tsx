"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Loader2,
  ArrowLeft,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { formatDate } from "@/lib/utils"

interface UserItem {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: string
  isActive: boolean
  wardNo: number | null
  rating: number | null
  createdAt: string
  _count: { requests: number; bids: number }
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  TASKER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  USER: "bg-blue-50 text-blue-700 border-blue-200",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (q) params.set("q", q)
      if (roleFilter && roleFilter !== " ") params.set("role", roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
    } catch {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [page, limit, q, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function toggleActive(user: UserItem) {
    setTogglingId(user.id)
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isActive: !user.isActive }),
      })
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      )
    } catch {
      // silent
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

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
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            {total} user{total !== 1 ? "s" : ""} registered
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1) }}
              className="pl-10"
            />
          </div>
          <Select
            value={roleFilter ?? ""}
            onValueChange={(v) => { setRoleFilter(v || null); setPage(1) }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="TASKER">Tasker</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchUsers} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <Card>
          {error ? (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">Failed to load users</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={fetchUsers} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          ) : loading && users.length === 0 ? (
            <CardContent className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </CardContent>
          ) : users.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No users found</h3>
              <p className="text-sm text-muted-foreground">
                {q || roleFilter ? "Try a different search or filter." : "No users have registered yet."}
              </p>
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">User</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Contact</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Role</th>
                      <th className="text-center font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Activity</th>
                      <th className="text-center font-medium text-muted-foreground px-4 py-3">Status</th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-[160px]">
                            {user.name || "Unnamed"}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-sm">{user.phone || "—"}</p>
                          {user.wardNo && (
                            <p className="text-xs text-muted-foreground">Ward {user.wardNo}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={roleColors[user.role] || ""}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <p className="text-xs text-muted-foreground">
                            {user._count.requests} req • {user._count.bids} bids
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {user.isActive ? (
                            <ShieldCheck className="h-5 w-5 text-emerald-500 inline-block" />
                          ) : (
                            <ShieldX className="h-5 w-5 text-red-400 inline-block" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={togglingId === user.id || user.role === "ADMIN"}
                            onClick={() => toggleActive(user)}
                            className={user.isActive ? "text-red-500 hover:text-red-600" : "text-emerald-600 hover:text-emerald-700"}
                          >
                            {togglingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.isActive ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
