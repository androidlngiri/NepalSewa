import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn(() => Promise.resolve("hashed-password")) },
  hash: vi.fn(() => Promise.resolve("hashed-password")),
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => true),
}))

const mockUserFindFirst = vi.hoisted(() => vi.fn())
const mockUserCreate = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: mockUserFindFirst,
      create: mockUserCreate,
    },
  },
}))

import { POST } from "./route"

describe("POST /api/auth/register", () => {
  function mockReq(body: any) {
    return {
      json: () => Promise.resolve(body),
      headers: new Map(),
    } as any
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("registers a new user", async () => {
    mockUserFindFirst.mockResolvedValue(null)
    mockUserCreate.mockResolvedValue({
      id: "new-user",
      name: "New User",
      email: "new@example.com",
      role: "USER",
      isTasker: false,
    })

    const res = await POST(
      mockReq({ name: "New User", email: "new@example.com", password: "Password1" })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.user.email).toBe("new@example.com")
  })

  it("rejects missing email and phone", async () => {
    const res = await POST(mockReq({ name: "Test", password: "Password1" }))
    expect(res.status).toBe(400)
  })

  it("rejects duplicate email", async () => {
    mockUserFindFirst.mockResolvedValue({ id: "existing" })

    const res = await POST(
      mockReq({ name: "Test", email: "existing@test.com", password: "Password1" })
    )
    expect(res.status).toBe(409)
  })

  it("rejects weak password", async () => {
    const res = await POST(
      mockReq({ name: "Test", email: "test@test.com", password: "short" })
    )
    expect(res.status).toBe(400)
  })

  it("registers with isTasker flag", async () => {
    mockUserFindFirst.mockResolvedValue(null)
    mockUserCreate.mockResolvedValue({
      id: "new-tasker",
      name: "New Tasker",
      email: "tasker@example.com",
      role: "USER",
      isTasker: true,
    })

    const res = await POST(
      mockReq({ name: "New Tasker", email: "tasker@example.com", password: "Password1", isTasker: true })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.user.isTasker).toBe(true)
    expect(body.user.role).toBe("USER")
  })

  it("respects rate limit", async () => {
    const { rateLimit } = await import("@/lib/rate-limit")
    ;(rateLimit as any).mockReturnValue(false)

    const res = await POST(
      mockReq({ name: "Test", email: "test@test.com", password: "Password1" })
    )
    expect(res.status).toBe(429)
  })
})
