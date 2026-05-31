"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wrench, Zap, PaintBucket, Home, Truck, Code, Sparkles,
  User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield, Star, Clock,
  Briefcase, CheckCircle2, Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const floatingIcons = [
  { Icon: Wrench, delay: 0, x: "15%", y: "20%", size: 28 },
  { Icon: Zap, delay: 0.3, x: "75%", y: "15%", size: 24 },
  { Icon: PaintBucket, delay: 0.6, x: "85%", y: "60%", size: 32 },
  { Icon: Home, delay: 0.9, x: "10%", y: "70%", size: 26 },
  { Icon: Truck, delay: 1.2, x: "90%", y: "35%", size: 30 },
  { Icon: Code, delay: 1.5, x: "20%", y: "85%", size: 22 },
]

const perks = [
  "Post a task & get bids in minutes",
  "Compare prices from local taskers",
  "Pay only when the job is done right",
]

function SignUpForm() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "details">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTasker, setIsTasker] = useState(false)
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    phone: "",
  })

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) {
      toast.error("Enter your email")
      return
    }
    setStep("details")
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) {
      toast.error("Name is required")
      return
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone || undefined, isTasker }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        return
      }
      toast.success("Account created! Sign in to get started.")
      router.push("/auth/signin")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 py-8">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.1),transparent_50%)]" />
        {floatingIcons.map(({ Icon, delay, x, y, size }) => (
          <motion.div
            key={delay}
            className="absolute text-white/10"
            style={{ left: x, top: y }}
            animate={{
              y: [0, -25, 0, 15, 0],
              rotate: [0, -8, 5, -5, 0],
            }}
            transition={{
              duration: 5,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
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

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-2"
        >
          {perks.map((perk, i) => (
            <motion.div
              key={perk}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-2 text-sm text-emerald-200/80"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              {perk}
            </motion.div>
          ))}
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-6 text-xs text-emerald-200/80"
        >
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Verified taskers</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> Rated & reviewed</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Same-day service</span>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.form
                    key="email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleContinue}
                    className="space-y-5"
                  >
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-white">Join NepalSewa</h2>
                      <p className="text-sm text-emerald-200/70 mt-1">
                        Start getting things done in Butwal
                      </p>
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

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">
                        Phone <span className="text-white/40 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          type="tel"
                          placeholder="98XXXXXXXX"
                          className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400/50 focus:ring-emerald-400/20"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
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
                      Already have an account?{" "}
                      <Link href="/auth/signin" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                        Sign in
                      </Link>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={onSubmit}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-white">Almost there</h2>
                      <p className="text-sm text-emerald-200/70 mt-1">
                        {form.email}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 transition-colors"
                      >
                        Change email
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">Your name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          placeholder="Ram Sharma"
                          className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400/50 focus:ring-emerald-400/20"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
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

                    <div className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
                      <Checkbox
                        id="isTasker"
                        checked={isTasker}
                        onCheckedChange={(v) => setIsTasker(v === true)}
                        className="mt-0.5 border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <div>
                        <label htmlFor="isTasker" className="text-sm font-medium text-white/80 cursor-pointer">
                          <Briefcase className="inline h-4 w-4 mr-1 text-emerald-400" />
                          I also want to offer services as a tasker
                        </label>
                        <p className="text-xs text-emerald-200/50 mt-0.5">
                          Get hired, set your own rates, earn in your community
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 text-base font-semibold"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <Sparkles className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="pt-1 border-t border-white/10">
                      <p className="text-[11px] text-center text-white/30 pt-3">
                        By joining, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-white/50">Terms</Link>
                        {" "}&{" "}
                        <Link href="/privacy" className="underline hover:text-white/50">Privacy Policy</Link>
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return <SignUpForm />
}
