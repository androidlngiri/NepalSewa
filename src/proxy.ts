import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/forgot",
  "/about",
  "/pricing",
  "/contact",
  "/services",
  "/terms",
  "/privacy",
]

const rolePaths: Record<string, string> = {
  USER: "/dashboard/user",
  TASKER: "/dashboard/tasker",
  ADMIN: "/dashboard/admin",
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

  if (isPublic || isApi || isStatic) return

  const session = req.auth

  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const role = session.user.role as string

  if (pathname.startsWith("/dashboard")) {
    const expectedPath = rolePaths[role]
    if (expectedPath && !pathname.startsWith(expectedPath)) {
      return NextResponse.redirect(new URL(expectedPath, req.url))
    }
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
