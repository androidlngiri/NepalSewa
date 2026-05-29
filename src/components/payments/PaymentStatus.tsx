"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface PaymentStatusProps {
  transactionId: string
  initialStatus?: string
  onStatusChange?: (status: string) => void
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-purple-50 text-purple-700 border-purple-200",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

export function PaymentStatus({ transactionId, initialStatus, onStatusChange }: PaymentStatusProps) {
  const [status, setStatus] = useState(initialStatus || "PENDING")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (initialStatus) setStatus(initialStatus)
  }, [initialStatus])

  async function handleVerify() {
    setVerifying(true)
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(data.status)
        onStatusChange?.(data.status)
        if (data.status === "COMPLETED") {
          toast.success("Payment confirmed!")
        }
      }
    } catch {
      toast.error("Failed to verify payment")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={statusColors[status] || ""}>
        {statusLabels[status] || status}
      </Badge>
      {status === "PENDING" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVerify}
          disabled={verifying}
        >
          {verifying ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  )
}
