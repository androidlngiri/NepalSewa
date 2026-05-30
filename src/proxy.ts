import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

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

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  return response
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )
  const isApi = pathname.startsWith("/api/")
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")

  if (isPublic || isApi || isStatic) return addSecurityHeaders(NextResponse.next())

  const session = req.auth

  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return addSecurityHeaders(NextResponse.redirect(signInUrl))
  }

  const role = session.user.role as string

  if (pathname.startsWith("/dashboard")) {
    const expectedPath = rolePaths[role]
    if (expectedPath && !pathname.startsWith(expectedPath)) {
      return addSecurityHeaders(NextResponse.redirect(new URL(expectedPath, req.url)))
    }
  }

  return addSecurityHeaders(NextResponse.next())
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
