"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Wrench, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTasker, setIsTasker] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.password) {
      toast.error("Name and password are required")
      return
    }
    if (!form.email && !form.phone) {
      toast.error("Email or phone is required")
      return
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (!/[A-Z]/.test(form.password)) {
      toast.error("Password must contain at least one uppercase letter")
      return
    }
    if (!/[0-9]/.test(form.password)) {
      toast.error("Password must contain at least one number")
      return
    }

    if (form.phone && !/^(98|97|96)\d{8}$/.test(form.phone)) {
      toast.error("Please enter a valid Nepali phone number (98/97/96 followed by 8 digits)")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isTasker,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        return
      }

      toast.success("Account created! Please sign in.")
      router.push("/auth/signin")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

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
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Join Butwal&apos;s growing service community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Your full name"
                className="pl-10 h-11"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 h-11"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Nepal)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="98XXXXXXXX"
                className="pl-10 h-11"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                className="pl-10 pr-10 h-11"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Checkbox
              id="isTasker"
              checked={isTasker}
              onCheckedChange={(v) => setIsTasker(v === true)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="isTasker" className="text-sm font-medium cursor-pointer">
                <Briefcase className="inline h-4 w-4 mr-1 text-emerald-600" />
                I also want to offer my services as a tasker
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Get hired for jobs, set your own rates, and earn money in your community.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-emerald-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-xs text-center text-muted-foreground">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-emerald-600">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-emerald-600">Privacy Policy</Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4 py-8">
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
