export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // silent — SW registration must never break UX
    })
  })
}
