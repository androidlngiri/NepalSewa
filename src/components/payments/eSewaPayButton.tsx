"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Wallet } from "lucide-react"

interface EsewaPayButtonProps {
  requestId: string
  amount: number
  disabled?: boolean
}

export function EsewaPayButton({ requestId, amount, disabled }: EsewaPayButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, amount }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to initiate payment")
        setLoading(false)
        return
      }

      const { action, fields } = await res.json()

      const form = document.createElement("form")
      form.method = "POST"
      form.action = action
      form.style.display = "none"

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = value as string
        form.appendChild(input)
      }

      document.body.appendChild(form)
      form.submit()
    } catch {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={disabled || loading}
      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
      size="lg"
    >
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-5 w-5" />
      )}
      Pay with eSewa
    </Button>
  )
}
