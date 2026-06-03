"use client"

import { Suspense, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "./DashboardNav"
import { DashboardBottomNav } from "./DashboardBottomNav"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { DashboardSkeleton } from "@/components/ui/skeleton"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "user" | "tasker" | "admin"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push(`/auth/signin?callbackUrl=/dashboard/${role}`)
      return
    }

    if (role !== "admin" && session.user.role !== role.toUpperCase()) {
      if (role === "tasker" && session.user.isTasker) {
        setAuthorized(true)
      } else if (role === "user" && session.user.isTasker) {
        setAuthorized(true)
      } else {
        router.push(`/dashboard/${(session.user.role as string)?.toLowerCase() || "user"}`)
        return
      }
    } else {
      setAuthorized(true)
    }
  }, [status, session, role, router])

  if (status === "loading" || !authorized) {
    return (
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="bg-background hidden w-64 border-r lg:block" />
        <main className="flex-1 bg-gray-50/50">
          <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Suspense fallback={null}>
        <DashboardNav
          role={role}
          userName={session!.user.name || "User"}
          userImage={session!.user.image}
          isTasker={session!.user.isTasker}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </Suspense>
      <main className="flex-1 bg-gray-50/50 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:overflow-y-auto lg:pb-0">
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
        </div>
      </main>
      <Suspense fallback={null}>
        <DashboardBottomNav
          role={role}
          isTasker={session!.user.isTasker}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </Suspense>
    </div>
  )
}
