import { SessionProvider } from "@/components/SessionProvider"

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
