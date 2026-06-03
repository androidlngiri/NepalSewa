"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    function check() {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 1024), 150)
    }
    check()
    window.addEventListener("resize", check)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", check)
    }
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", handler)

    const hasDismissed = localStorage.getItem("pwa-dismissed")
    if (hasDismissed) setDismissed(true)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === "accepted") {
      setShow(false)
      setDeferredPrompt(null)
    }
  }

  function handleDismiss() {
    setShow(false)
    setDismissed(true)
    localStorage.setItem("pwa-dismissed", "true")
  }

  if (!show || dismissed || !isMobile) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed right-4 bottom-20 left-4 z-50 mx-auto max-w-md"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <Download className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Install NepalSewa</p>
              <p className="truncate text-xs text-emerald-200/60">
                Add to your homescreen for a faster experience
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleInstall}
              className="h-9 shrink-0 rounded-xl bg-emerald-500 px-4 text-xs text-white hover:bg-emerald-400"
            >
              Install
            </Button>
            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 text-white/40 hover:text-white/60"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
