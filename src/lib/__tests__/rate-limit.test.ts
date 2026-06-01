import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/rate-limit", async () => {
  const mod = await vi.importActual<typeof import("@/lib/rate-limit")>("@/lib/rate-limit")
  return mod
})

import { rateLimit, getRemainingAttempts } from "@/lib/rate-limit"

beforeEach(() => {
  vi.useRealTimers()
})

describe("rateLimit", () => {
  it("returns true for first request", () => {
    expect(rateLimit("key1")).toBe(true)
  })

  it("allows requests up to maxRequests", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("key2", 5)).toBe(true)
    }
  })

  it("blocks after maxRequests exceeded", () => {
    for (let i = 0; i < 3; i++) {
      rateLimit("key3", 3)
    }
    expect(rateLimit("key3", 3)).toBe(false)
  })

  it("resets after window expires", () => {
    vi.useFakeTimers()
    rateLimit("key4", 2, 1000)
    rateLimit("key4", 2, 1000)
    expect(rateLimit("key4", 2, 1000)).toBe(false)

    vi.advanceTimersByTime(1001)
    expect(rateLimit("key4", 2, 1000)).toBe(true)
  })

  it("getRemainingAttempts returns 10 by default", () => {
    expect(getRemainingAttempts("fresh-key")).toBe(10)
  })

  it("getRemainingAttempts decreases as requests are made", () => {
    rateLimit("key5")
    rateLimit("key5")
    rateLimit("key5")
    expect(getRemainingAttempts("key5")).toBe(7)
  })
})
