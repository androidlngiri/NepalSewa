const CACHE = "nepalsewa-v2"
const PRECACHE = ["/", "/auth/signin", "/auth/signup", "/icon-192.png", "/icon-512.png", "/og-image.png"]

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return
  const url = new URL(e.request.url)

  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    )
    return
  }

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(e.request, clone))
        return res
      }).catch(() => caches.match(e.request).then((cached) => cached || caches.match("/")))
    )
    return
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then((cache) => cache.put(e.request, clone))
        }
        return res
      }).catch(() => cached)
      return cached || fetched
    })
  )
})
