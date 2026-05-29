const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

export function getRemainingAttempts(key: string): number {
  const entry = store.get(key)
  if (!entry || Date.now() > entry.resetAt) return 10
  return Math.max(0, 10 - entry.count)
}
