"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/register-sw"
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt"

export default function PwaWrapper() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return <PwaInstallPrompt />
}
