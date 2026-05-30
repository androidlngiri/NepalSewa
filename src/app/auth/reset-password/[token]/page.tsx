"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Wrench, Lock, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function ResetPasswordForm() {
  const { token } = useParams() as { token: string }
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Password must be 8+ characters with 1 uppercase and 1 number")
      return
    }

    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }

      setDone(true)
      toast.success("Password reset successfully!")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
        <Card className="w-full max-w-md border-2 shadow-xl">
          <CardContent className="flex flex-col items-center text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Password Reset Complete</h2>
            <p className="text-sm text-muted-foreground mb-6">Your password has been updated.</p>
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
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
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repeat your password"
                  className="pl-10 h-11"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/auth/signin" className="text-emerald-600 font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4"><div className="h-96 flex items-center justify-center">Loading...</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
