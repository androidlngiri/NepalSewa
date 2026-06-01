import Link from "next/link"
import { Wrench, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
        <Wrench className="h-8 w-8 text-white" />
      </div>

      <h1 className="mb-2 text-6xl font-bold text-emerald-600">404</h1>
      <h2 className="mb-2 text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
        back on track.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-emerald-600 hover:to-teal-700"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/services"
          className="border-input bg-background hover:bg-muted inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-all"
        >
          <Search className="h-4 w-4" />
          Browse Services
        </Link>
      </div>
    </div>
  )
}
