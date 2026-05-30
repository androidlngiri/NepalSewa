"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Wrench, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There's a problem with the authentication configuration. Please try signing in with a different method or contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You don't have permission to sign in.",
  },
  Verification: {
    title: "Verification Error",
    description: "The verification link is invalid or has expired.",
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This email is already associated with another sign-in method.",
  },
  OAuthSignin: {
    title: "OAuth Sign In Error",
    description: "There was a problem signing in with the provider.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "There was a problem processing the authentication response.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create an account with this provider.",
  },
  EmailCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create an account with this email address.",
  },
  Callback: {
    title: "Callback Error",
    description: "There was a problem with the authentication callback.",
  },
  Default: {
    title: "Authentication Error",
    description: "Something went wrong during authentication. Please try again.",
  },
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"
  const { title, description } = errorMessages[error] || errorMessages.Default

  return (
    <Card className="w-full max-w-md border-2 shadow-xl">
      <CardHeader className="text-center space-y-1 pb-6">
        <Link href="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-emerald-600">Nepal</span>Sewa
          </span>
        </Link>
        <div className="flex justify-center mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/auth/signin">
          <Button className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            Try Again
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full h-11">
            Go Home
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md border-2 shadow-xl">
          <CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}
