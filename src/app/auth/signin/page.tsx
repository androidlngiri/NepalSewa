"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wrench, Zap, PaintBucket, Home, Truck, Code, Sparkles,
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield, Star, Clock,
  Phone, Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

const floatingIcons = [
  { Icon: Wrench, delay: 0, x: "15%", y: "20%", size: 28 },
  { Icon: Zap, delay: 0.3, x: "75%", y: "15%", size: 24 },
  { Icon: PaintBucket, delay: 0.6, x: "85%", y: "60%", size: 32 },
  { Icon: Home, delay: 0.9, x: "10%", y: "70%", size: 26 },
  { Icon: Truck, delay: 1.2, x: "90%", y: "35%", size: 30 },
  { Icon: Code, delay: 1.5, x: "20%", y: "85%", size: 22 },
]

function OtpInput({ length, value, onChange }: { length: number; value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(idx: number, char: string) {
    if (!/^\d?$/.test(char)) return
    const next = [...value]
    next[idx] = char
    onChange(next)
    if (char && idx < length - 1) {
      refs.current[idx + 1]?.focus()
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
  }

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-11 h-12 text-center text-lg font-bold bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-400/50 focus:ring-emerald-400/20 outline-none"
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  )
}

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState<"email" | "password">("email")
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) {
      toast.error("Enter your email")
      return
    }
    setStep("password")
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.password) {
      toast.error("Enter your password")
      return
    }
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }
      toast.success("Welcome back!")
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/user"
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/dashboard/user")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendOtp() {
    const cleaned = phone.replace(/\D/g, "")
    if (!/^(98|97|96)\d{8}$/.test(cleaned)) {
      toast.error("Enter a valid 10-digit Nepali phone number")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to send OTP")
        return
      }
      toast.success("OTP sent to your phone")
      if (data.devOtp) {
        toast.info("Dev mode — code: " + data.devOtp)
        setOtp(data.devOtp.split(""))
        setTimeout(() => handleVerifyOtp(data.devOtp), 1500)
      }
      setPhone(cleaned)
      setPhoneStep("otp")
      setCooldown(60)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOtp(code: string) {
    if (code.length !== 6) return
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        phone,
        otp: code,
        redirect: false,
      })
      if (result?.error) {
        toast.error("Invalid or expired code")
        setOtp(Array(6).fill(""))
        return
      }
      toast.success("Welcome back!")
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/user"
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/dashboard/user")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  function handleOtpChange(v: string[]) {
    setOtp(v)
    if (v.every((c) => c)) {
      handleVerifyOtp(v.join(""))
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.1),transparent_50%)]" />
        {floatingIcons.map(({ Icon, delay, x, y, size }) => (
          <motion.div
            key={delay}
            className="absolute text-white/10"
            style={{ left: x, top: y }}
            animate={{ y: [0, -30, 0, 20, 0], rotate: [0, 10, -5, 5, 0] }}
            transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon size={size} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              <span className="text-emerald-400">Nepal</span>Sewa
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-4 mb-8 text-xs text-emerald-200/80"
        >
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Verified</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> 4.8 avg</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 30min response</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <p className="text-2xl font-bold text-white">
            <span className="text-emerald-400">5,000+</span>{" "}
            <span className="text-white/80">tasks completed</span>
          </p>
          <p className="text-sm text-emerald-200/70 mt-1">
            Join Butwal&apos;s trusted service marketplace
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Method tabs */}
              <div className="flex mb-6 rounded-xl bg-white/5 border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => { setLoginMethod("email"); setStep("email") }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === "email" ? "bg-emerald-500 text-white shadow" : "text-white/60 hover:text-white/80"}`}
                >
                  <Mail className="inline h-4 w-4 mr-1.5" />Email
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod("phone"); setPhoneStep("phone") }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === "phone" ? "bg-emerald-500 text-white shadow" : "text-white/60 hover:text-white/80"}`}
                >
                  <Smartphone className="inline h-4 w-4 mr-1.5" />Phone
                </button>
              </div>

              <AnimatePresence mode="wait">
                {loginMethod === "email" ? (
                  step === "email" ? (
                    <motion.form
                      key="email"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleContinue}
                      className="space-y-5"
                    >
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-white">Welcome back</h2>
                        <p className="text-sm text-emerald-200/70 mt-1">Sign in to continue</p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard/user" })}
                        className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-base font-medium flex items-center justify-center gap-3"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-transparent px-2 text-white/40">or</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-white/80">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400/50 focus:ring-emerald-400/20"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 text-base font-semibold"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      <p className="text-center text-sm text-emerald-200/60">
                        New here?{" "}
                        <Link href="/auth/signup" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                          Create an account
                        </Link>
                      </p>

                      <div className="pt-2 border-t border-white/10">
                        <p className="text-[11px] text-center text-white/30">
                          By continuing, you agree to our{" "}
                          <Link href="/terms" className="underline hover:text-white/50">Terms</Link>
                          {" "}&{" "}
                          <Link href="/privacy" className="underline hover:text-white/50">Privacy</Link>
                        </p>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="password"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={onSubmit}
                      className="space-y-5"
                    >
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-white">Enter password</h2>
                        <p className="text-sm text-emerald-200/70 mt-1">{form.email}</p>
                        <button
                          type="button"
                          onClick={() => setStep("email")}
                          className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 transition-colors"
                        >
                          Not you? Change email
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-white/80">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400/50 focus:ring-emerald-400/20"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide" : "Show"}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Link href="/auth/forgot" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                          Forgot password?
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 text-base font-semibold"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In<Sparkles className="ml-2 h-4 w-4" /></>}
                      </Button>
                    </motion.form>
                  )
                ) : (
                  phoneStep === "phone" ? (
                    <motion.div
                      key="phone-input"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-5"
                    >
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-white">Sign in with phone</h2>
                        <p className="text-sm text-emerald-200/70 mt-1">Get a one-time code on your phone</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-white/80">Phone number</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 text-sm font-mono">+977</span>
                          <Input
                            type="tel"
                            placeholder="98XXXXXXXX"
                            className="h-12 pl-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400/50 focus:ring-emerald-400/20 font-mono tracking-wider"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSendOtp() }}
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        disabled={isLoading}
                        onClick={handleSendOtp}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 text-base font-semibold"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send OTP<Smartphone className="ml-2 h-4 w-4" /></>}
                      </Button>

                      <p className="text-center text-sm text-emerald-200/60">
                        New here?{" "}
                        <Link href="/auth/signup" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                          Create an account
                        </Link>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp-input"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-white">Enter the code</h2>
                        <p className="text-sm text-emerald-200/70 mt-1">
                          Sent to +977 {phone}
                        </p>
                        <button
                          type="button"
                          onClick={() => setPhoneStep("phone")}
                          className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 transition-colors"
                        >
                          Wrong number? Change
                        </button>
                      </div>

                      <OtpInput length={6} value={otp} onChange={handleOtpChange} />

                      {isLoading && (
                        <div className="flex justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                        </div>
                      )}

                      <div className="text-center">
                        {cooldown > 0 ? (
                          <p className="text-xs text-white/40">Resend in {cooldown}s</p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isLoading}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Resend code
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
