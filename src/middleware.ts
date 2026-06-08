import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = [
  "/",
  "/auth",
  "/about",
  "/how-it-works",
  "/pricing",
  "/contact",
  "/services",
  "/terms",
  "/privacy",
  "/faq",
  "/blog",
  "/safety",
  "/become-tasker",
  "/tasker-guide",
  "/earnings",
  "/success-stories",
]

const rolePaths: Record<string, string> = {
  USER: "/dashboard/user",
  TASKER: "/dashboard/tasker",
  ADMIN: "/dashboard/admin",
}

const adminPaths = ["/dashboard/admin"]

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  return response
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/")) return addSecurityHeaders(NextResponse.next())
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  )
    return addSecurityHeaders(NextResponse.next())

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  if (isPublic) return addSecurityHeaders(NextResponse.next())

  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("next-auth.session-token")?.value
  const secureToken =
    req.cookies.get("__Secure-authjs.session-token")?.value ??
    req.cookies.get("__Secure-next-auth.session-token")?.value

  if (!sessionToken && !secureToken) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return addSecurityHeaders(NextResponse.redirect(signInUrl))
  }

  const isAdminRoute = adminPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  if (isAdminRoute) {
    const token = sessionToken || secureToken
    try {
      const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString())
      if (payload.role !== "ADMIN") {
        const dashUrl = new URL(rolePaths[payload.role] || "/dashboard/user", req.nextUrl.origin)
        return addSecurityHeaders(NextResponse.redirect(dashUrl))
      }
    } catch {
      const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return addSecurityHeaders(NextResponse.redirect(signInUrl))
    }
  }

  return addSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: ["/((?!api|_next|.*\\.[\\w]+$).*)"],
}
