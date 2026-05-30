import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

const mockRequestFindUnique = vi.hoisted(() => vi.fn())
const mockTransactionFindFirst = vi.hoisted(() => vi.fn())
const mockTransactionCreate = vi.hoisted(() => vi.fn())
const mockBidFindFirst = vi.hoisted(() => vi.fn())
const mockRequestUpdate = vi.hoisted(() => vi.fn())
const mockAssignmentFindFirst = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: {
      findUnique: mockRequestFindUnique,
      update: mockRequestUpdate,
    },
    transaction: {
      findFirst: mockTransactionFindFirst,
      create: mockTransactionCreate,
    },
    bid: {
      findFirst: mockBidFindFirst,
    },
    taskerAssignment: {
      findFirst: mockAssignmentFindFirst,
    },
  },
}))

vi.mock("@/lib/email", () => ({
  sendPaymentConfirmation: vi.fn(() => Promise.resolve()),
}))

import { POST } from "./route"

describe("POST /api/payments/cash", () => {
  function mockReq(body: any) {
    return {
      json: () => Promise.resolve(body),
    } as any
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("processes cash payment successfully", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-1",
      title: "Fix plumbing",
      status: "IN_PROGRESS",
      budget: 5000,
      service: { name: "Plumbing" },
    })
    mockTransactionFindFirst.mockResolvedValue(null)
    mockBidFindFirst.mockResolvedValue(null)
    mockAssignmentFindFirst.mockResolvedValue({
      id: "assignment-1",
      tasker: { id: "tasker-1", tier: "STANDARD", proExpiresAt: null },
    })

    const res = await POST(mockReq({ requestId: "request-1" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockTransactionCreate).toHaveBeenCalled()
    expect(mockRequestUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "COMPLETED" } })
    )
  })

  it("rejects unauthorized user", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue(null)

    const res = await POST(mockReq({ requestId: "request-1" }))
    expect(res.status).toBe(401)
  })

  it("rejects payment on non-own request", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: "user-2", name: "Other" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-1",
      status: "IN_PROGRESS",
      service: { name: "Plumbing" },
    })

    const res = await POST(mockReq({ requestId: "request-1" }))
    expect(res.status).toBe(403)
  })

  it("rejects payment when request not in progress", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-1",
      status: "COMPLETED",
      service: { name: "Plumbing" },
    })

    const res = await POST(mockReq({ requestId: "request-1" }))
    expect(res.status).toBe(400)
  })

  it("rejects duplicate payment", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-1",
      status: "IN_PROGRESS",
      service: { name: "Plumbing" },
    })
    mockTransactionFindFirst.mockResolvedValue({ id: "existing-tx", status: "COMPLETED" })

    const res = await POST(mockReq({ requestId: "request-1" }))
    expect(res.status).toBe(400)
  })

  it("uses accepted bid amount if available", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-1",
      title: "Fix plumbing",
      status: "IN_PROGRESS",
      budget: 5000,
      service: { name: "Plumbing" },
    })
    mockTransactionFindFirst.mockResolvedValue(null)
    mockBidFindFirst.mockResolvedValue({ id: "accepted-bid", amount: 3500 })
    mockAssignmentFindFirst.mockResolvedValue({
      id: "assignment-1",
      tasker: { id: "tasker-1", tier: "STANDARD", proExpiresAt: null },
    })

    await POST(mockReq({ requestId: "request-1" }))

    expect(mockTransactionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 3500 }),
      })
    )
  })
})
