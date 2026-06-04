"use client"

import { useState } from "react"
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
  Bell,
  Mail,
  ChevronDown,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/notifications/NotificationBell"

interface DashboardNavProps {
  role: "user" | "tasker" | "admin"
  userName: string
  userImage?: string | null
  isTasker?: boolean
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

const userNav = [
  { href: "/dashboard/user", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/user/requests", label: "My Requests", icon: ClipboardList },
  { href: "/dashboard/user/bids", label: "Bids Received", icon: MessageSquare },
  { href: "/dashboard/chat", label: "Messages", icon: Mail },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/user/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/user/settings", label: "Settings", icon: Settings },
]

const taskerNav = [
  { href: "/dashboard/tasker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasker/jobs", label: "Available Jobs", icon: ClipboardList },
  { href: "/dashboard/tasker/my-bids", label: "My Bids", icon: MessageSquare },
  { href: "/dashboard/chat", label: "Messages", icon: Mail },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/tasker/earnings", label: "Earnings", icon: IndianRupee },
  { href: "/dashboard/tasker/payouts", label: "Withdraw", icon: IndianRupee },
  { href: "/dashboard/tasker/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/tasker/settings", label: "Settings", icon: Settings },
]

const adminNav = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: User },
  { href: "/dashboard/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/dashboard/admin/services", label: "Services", icon: Wrench },
  { href: "/dashboard/chat", label: "Messages", icon: Mail },
  { href: "/dashboard/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: Star },
  { href: "/dashboard/admin/commissions", label: "Commissions", icon: Percent },
  { href: "/dashboard/admin/payouts", label: "Payouts", icon: IndianRupee },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
]

export function DashboardNav({
  role,
  userName,
  userImage,
  isTasker,
  sidebarOpen = false,
  onToggleSidebar,
}: DashboardNavProps) {
  const pathname = usePathname()
  const isUserPage = pathname.startsWith("/dashboard/user")
  const [customerExpanded, setCustomerExpanded] = useState(isUserPage)
  const [taskerExpanded, setTaskerExpanded] = useState(!isUserPage)

  const initials =
    userName
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
        onClick={onToggleSidebar}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          isActive
            ? "bg-emerald-50 text-emerald-700 shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
      <div className="bg-background sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 lg:hidden">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="focus-visible:ring-ring/50 focus-visible:border-ring hover:bg-muted hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold">
            <span className="text-emerald-600">Nepal</span>Sewa
          </span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onToggleSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-background fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
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
              {adminNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          ) : isTasker ? (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setCustomerExpanded(!customerExpanded)}
                className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Customer
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    customerExpanded && "rotate-180",
                  )}
                />
              </button>
              {customerExpanded && userNav.map((item) => <NavItem key={item.href} {...item} />)}
              <div className="my-3 border-t" />
              <button
                type="button"
                onClick={() => setTaskerExpanded(!taskerExpanded)}
                className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Tasker
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    taskerExpanded && "rotate-180",
                  )}
                />
              </button>
              {taskerExpanded && taskerNav.map((item) => <NavItem key={item.href} {...item} />)}
            </div>
          ) : role === "user" ? (
            <div className="space-y-1">
              {userNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {taskerNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Avatar className="h-9 w-9">
              {userImage ? (
                <AvatarImage src={userImage} alt={userName} />
              ) : (
                <AvatarFallback className="bg-emerald-100 text-xs font-medium text-emerald-700">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="text-muted-foreground text-xs capitalize">{roleBadge}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              aria-label="Sign out"
              className="focus-visible:ring-ring/50 focus-visible:border-ring text-muted-foreground inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors outline-none hover:text-red-500 focus-visible:ring-3"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
