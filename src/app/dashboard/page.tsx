import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard")
  const role = (session.user.role as string)?.toLowerCase() || "user"
  const isTasker = (session.user as any).isTasker
  const target = isTasker ? "/dashboard/user" : `/dashboard/${role}`
  redirect(target)
}
