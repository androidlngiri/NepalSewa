"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  User,
  Wrench,
  Menu,
  X,
  Briefcase,
  IndianRupee,
  Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface DashboardNavProps {
  role: "user" | "tasker" | "admin"
  userName: string
  userImage?: string | null
  isTasker?: boolean
}

const userNav = [
  { href: "/dashboard/user", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/user/requests", label: "My Requests", icon: ClipboardList },
  { href: "/dashboard/user/bids", label: "Bids Received", icon: MessageSquare },
  { href: "/dashboard/user/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/user/settings", label: "Settings", icon: Settings },
]

const taskerNav = [
  { href: "/dashboard/tasker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasker/jobs", label: "Available Jobs", icon: ClipboardList },
  { href: "/dashboard/tasker/my-bids", label: "My Bids", icon: MessageSquare },
  { href: "/dashboard/tasker/earnings", label: "Earnings", icon: IndianRupee },
  { href: "/dashboard/tasker/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/tasker/settings", label: "Settings", icon: Settings },
]

const adminNav = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: User },
  { href: "/dashboard/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/dashboard/admin/services", label: "Services", icon: Wrench },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: Star },
  { href: "/dashboard/admin/commissions", label: "Commissions", icon: Percent },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
]

export function DashboardNav({ role, userName, userImage, isTasker }: DashboardNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    const isActive = pathname === href || pathname.startsWith(href + "/")
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          isActive
            ? "bg-emerald-50 text-emerald-700 shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {label}
      </Link>
    )
  }

  const roleBadge = isTasker ? "User + Tasker" : role

  return (
    <>
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm">
            <span className="text-emerald-600">Nepal</span>Sewa
          </span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-emerald-600">Nepal</span>Sewa
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-4">
          {role === "admin" ? (
            <div className="space-y-1">
              {adminNav.map((item) => <NavItem key={item.href} {...item} />)}
            </div>
          ) : isTasker ? (
            <div className="space-y-1">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="inline h-3 w-3 mr-1" />
                Customer
              </p>
              {userNav.map((item) => <NavItem key={item.href} {...item} />)}
              <div className="my-3 border-t" />
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Briefcase className="inline h-3 w-3 mr-1" />
                Tasker
              </p>
              {taskerNav.map((item) => <NavItem key={item.href} {...item} />)}
            </div>
          ) : role === "user" ? (
            <div className="space-y-1">
              {userNav.map((item) => <NavItem key={item.href} {...item} />)}
            </div>
          ) : (
            <div className="space-y-1">
              {taskerNav.map((item) => <NavItem key={item.href} {...item} />)}
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              {userImage ? (
                <img src={userImage} alt={userName} />
              ) : (
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{roleBadge}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-500"
              onClick={() => signOut({ callbackUrl: "/" })}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
