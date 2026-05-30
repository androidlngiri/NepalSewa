import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

import { GET } from "./route"

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 200 when DB is connected", async () => {
    const { prisma } = await import("@/lib/prisma")
    ;(prisma.$queryRaw as any).mockResolvedValue([{ "?column?": 1 }])

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ status: "ok" })
  })

  it("returns 503 when DB is down", async () => {
    const { prisma } = await import("@/lib/prisma")
    ;(prisma.$queryRaw as any).mockRejectedValue(new Error("DB connection failed"))

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body).toEqual({ status: "error" })
  })
})
