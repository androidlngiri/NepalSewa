"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Banknote } from "lucide-react"

interface CashPayButtonProps {
  requestId: string
  amount: number
  disabled?: boolean
}

export function CashPayButton({ requestId, amount, disabled }: CashPayButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    if (!confirm("Mark this job as paid with cash?\n\nThe job will be marked complete.")) return
    setLoading(true)
    try {
      const res = await fetch("/api/payments/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to process payment")
        return
      }

      toast.success("Payment recorded! Job marked complete.")
      window.location.reload()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={disabled || loading}
      variant="outline"
      size="lg"
      className="w-full gap-2"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Banknote className="h-5 w-5" />
      )}
      Pay with Cash
    </Button>
  )
}
