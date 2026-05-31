"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Bell,
  Settings,
  IndianRupee,
  User,
  Percent,
  Plus,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavItem {
  href: string
  label: string
  icon: any
}

const userNav: BottomNavItem[] = [
  { href: "/dashboard/user", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/user/requests", label: "Requests", icon: ClipboardList },
  { href: "/dashboard/user/requests/new", label: "Post", icon: Plus },
  { href: "/dashboard/user/bids", label: "Bids", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
]

const taskerNav: BottomNavItem[] = [
  { href: "/dashboard/tasker", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/tasker/jobs", label: "Jobs", icon: ClipboardList },
  { href: "/dashboard/tasker/my-bids", label: "My Bids", icon: MessageSquare },
  { href: "/dashboard/tasker/earnings", label: "Earnings", icon: IndianRupee },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
]

const adminNav: BottomNavItem[] = [
  { href: "/dashboard/admin", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: User },
  { href: "/dashboard/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/dashboard/admin/commissions", label: "Commission", icon: Percent },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
]

export function DashboardBottomNav({ role, isTasker }: { role: string; isTasker?: boolean }) {
  const pathname = usePathname()

  const navItems: BottomNavItem[] =
    role === "admin" ? adminNav : isTasker ? taskerNav : role === "tasker" ? taskerNav : userNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard/notifications"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0",
                isActive
                  ? "text-emerald-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
