import { describe, it, expect, vi, beforeEach } from "vitest"

const testUserId = "test-user-id"
const testTaskerId = "tasker-id"
const testRequestId = "request-1"

const mockBidFindUnique = vi.hoisted(() => vi.fn())
const mockBidCreate = vi.hoisted(() => vi.fn())
const mockBidFindMany = vi.hoisted(() => vi.fn())
const mockRequestFindUnique = vi.hoisted(() => vi.fn())

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    bid: {
      findMany: mockBidFindMany,
      findUnique: mockBidFindUnique,
      create: mockBidCreate,
    },
    request: {
      findUnique: mockRequestFindUnique,
    },
  },
}))

vi.mock("@/lib/email", () => ({
  sendBidNotification: vi.fn(() => Promise.resolve()),
}))

import { POST } from "./route"

describe("POST /api/bids", () => {
  function mockReq(body: any) {
    return {
      json: () => Promise.resolve(body),
    } as any
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("allows tasker to place a bid", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testTaskerId, name: "Test Tasker", role: "TASKER", isTasker: false },
    })

    mockRequestFindUnique
      .mockResolvedValueOnce({
        id: testRequestId,
        userId: "other-user-id",
        status: "OPEN",
        user: { isActive: true, email: "customer@test.com" },
        service: { name: "Plumbing" },
      })
      .mockResolvedValueOnce({
        id: testRequestId,
        title: "Fix plumbing",
        user: { email: "customer@test.com" },
        service: { name: "Plumbing" },
      })
    mockBidFindUnique.mockResolvedValue(null)
    mockBidCreate.mockResolvedValue({
      id: "bid-1",
      amount: 5000,
      message: "I can do this",
      status: "PENDING",
    })

    const res = await POST(mockReq({ requestId: testRequestId, amount: 5000, message: "I can do this" }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.amount).toBe(5000)
  })

  it("rejects bid from non-tasker role", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testUserId, name: "Test User", role: "USER", isTasker: false },
    })

    const res = await POST(mockReq({ requestId: testRequestId, amount: 5000 }))
    expect(res.status).toBe(403)
  })

  it("rejects duplicate bids", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testTaskerId, name: "Test Tasker", role: "TASKER" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: "other-user-id",
      status: "OPEN",
      user: { isActive: true },
    })
    mockBidFindUnique.mockResolvedValue({ id: "existing-bid" })
    const res = await POST(mockReq({ requestId: testRequestId, amount: 5000 }))
    expect(res.status).toBe(409)
  })

  it("rejects bids on non-OPEN requests", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testTaskerId, name: "Test Tasker", role: "TASKER" },
    })

    mockBidFindUnique.mockResolvedValue(null)
    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: "other-user-id",
      status: "IN_PROGRESS",
      user: { isActive: true },
    })

    const res = await POST(mockReq({ requestId: testRequestId, amount: 5000 }))
    expect(res.status).toBe(400)
  })

  it("rejects bids on own requests", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testUserId, name: "Test User", role: "TASKER" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: testUserId,
      status: "OPEN",
      user: { isActive: true },
    })

    const res = await POST(mockReq({ requestId: testRequestId, amount: 5000 }))
    expect(res.status).toBe(400)
  })

  it("requires amount field", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testTaskerId, name: "Test Tasker", role: "TASKER" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: "other-user-id",
      status: "OPEN",
      user: { isActive: true },
    })

    const res = await POST(mockReq({ requestId: testRequestId }))
    expect(res.status).toBe(400)
  })

  it("allows isTasker users to place bids", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testUserId, name: "Hybrid User", role: "USER", isTasker: true },
    })

    mockRequestFindUnique
      .mockResolvedValueOnce({
        id: testRequestId,
        userId: "other-user-id",
        status: "OPEN",
        user: { isActive: true, email: "customer@test.com" },
        service: { name: "Plumbing" },
      })
      .mockResolvedValueOnce({
        id: testRequestId,
        title: "Fix plumbing",
        user: { email: "customer@test.com" },
        service: { name: "Plumbing" },
      })
    mockBidFindUnique.mockResolvedValue(null)
    mockBidCreate.mockResolvedValue({ id: "bid-1", amount: 5000 })

    const res = await POST(mockReq({ requestId: testRequestId, amount: 5000 }))
    expect(res.status).toBe(201)
  })

  it("rejects bids on inactive user requests", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testTaskerId, name: "Test Tasker", role: "TASKER" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: "other-user-id",
      status: "OPEN",
      user: { isActive: false },
    })

    const res = await POST(mockReq({ requestId: testRequestId, amount: 5000 }))
    expect(res.status).toBe(400)
  })
})
