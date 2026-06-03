import { describe, it, expect, vi, beforeEach } from "vitest"

const testUserId = "test-user-id"
const testTaskerId = "tasker-id"
const testAdminId = "admin-id"
const testRequestId = "request-1"
const testAssignmentId = "assignment-1"

function makeSession(overrides: any = {}) {
  return {
    user: {
      id: testUserId,
      name: "Test User",
      email: "test@example.com",
      role: "USER",
      isTasker: false,
      image: null,
      ...overrides,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
}

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

const mockTxUpdateAssignment = vi.hoisted(() => vi.fn())
const mockTxUpdateRequest = vi.hoisted(() => vi.fn())
const mockTxFindTransaction = vi.hoisted(() => vi.fn())
const mockTxCreateTransaction = vi.hoisted(() => vi.fn())
const mockTxFindBid = vi.hoisted(() => vi.fn())
const mockTxUserUpdate = vi.hoisted(() => vi.fn())

const mockTx = {
  taskerAssignment: { update: mockTxUpdateAssignment },
  request: { update: mockTxUpdateRequest },
  transaction: { findFirst: mockTxFindTransaction, create: mockTxCreateTransaction },
  bid: { findFirst: mockTxFindBid },
  user: { update: mockTxUserUpdate },
}

const mockFindUnique = vi.hoisted(() => vi.fn())
const mockUpdate = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({
  prisma: {
    taskerAssignment: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
    $transaction: vi.fn((cb: any) => cb(mockTx)),
  },
}))

vi.mock("@/lib/email", () => ({
  sendCompletionAwaitingNotification: vi.fn(() => Promise.resolve()),
  sendJobConfirmedNotification: vi.fn(() => Promise.resolve()),
  sendAssignmentCompletedNotification: vi.fn(() => Promise.resolve()),
}))

import { PATCH } from "./route"
import { prisma } from "@/lib/prisma"

describe("PATCH /api/assignments/[assignmentId]", () => {
  function makeAssignment(overrides: any = {}) {
    return {
      id: testAssignmentId,
      taskerId: testTaskerId,
      requestId: testRequestId,
      status: "IN_PROGRESS",
      ...overrides,
      request: {
        id: testRequestId,
        title: "Fix my sink",
        userId: testUserId,
        budget: 5000,
        status: "IN_PROGRESS",
        ...(overrides.request || {}),
        user: {
          id: testUserId,
          name: "Test User",
          email: "test@example.com",
          isActive: true,
          ...(overrides.request?.user || {}),
        },
        service: {
          name: "Plumbing",
          ...(overrides.request?.service || {}),
        },
      },
      tasker: {
        id: testTaskerId,
        name: "Test Tasker",
        email: "tasker@test.com",
        isActive: true,
        ...(overrides.tasker || {}),
      },
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockReq(body: any) {
    return { json: () => Promise.resolve(body) } as any
  }

  async function callPatch(assignmentData: any, sessionOverrides: any, status: string) {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue(makeSession(sessionOverrides))
    mockFindUnique.mockResolvedValue(makeAssignment(assignmentData))
    return PATCH(mockReq({ status }), {
      params: Promise.resolve({ assignmentId: testAssignmentId }),
    })
  }

  it("allows tasker to mark IN_PROGRESS → AWAITING_CONFIRMATION", async () => {
    mockUpdate.mockResolvedValue({ status: "AWAITING_CONFIRMATION" })
    const res = await callPatch(
      { status: "IN_PROGRESS", taskerId: testTaskerId },
      { id: testTaskerId, role: "TASKER" },
      "AWAITING_CONFIRMATION",
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe("AWAITING_CONFIRMATION")
  })

  it("rejects customer marking IN_PROGRESS → AWAITING_CONFIRMATION", async () => {
    const res = await callPatch(
      { status: "IN_PROGRESS", taskerId: testTaskerId },
      { id: testUserId, role: "USER" },
      "AWAITING_CONFIRMATION",
    )
    expect(res.status).toBe(403)
  })

  it("allows customer to confirm AWAITING_CONFIRMATION → COMPLETED", async () => {
    mockTxFindBid.mockResolvedValue({ id: "bid-1", amount: 4500 })
    mockTxFindTransaction.mockResolvedValue(null)
    mockTxUpdateAssignment.mockResolvedValue({ status: "COMPLETED" })
    const res = await callPatch(
      { status: "AWAITING_CONFIRMATION", taskerId: testTaskerId },
      { id: testUserId, role: "USER" },
      "COMPLETED",
    )
    expect(res.status).toBe(200)
    expect(mockTxUpdateRequest).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "COMPLETED" } }),
    )
    expect(mockTxCreateTransaction).toHaveBeenCalled()
  })

  it("rejects tasker confirming completion", async () => {
    const res = await callPatch(
      { status: "AWAITING_CONFIRMATION", taskerId: testTaskerId },
      { id: testTaskerId, role: "TASKER" },
      "COMPLETED",
    )
    expect(res.status).toBe(403)
  })

  it("rejects invalid transitions (COMPLETED → IN_PROGRESS)", async () => {
    const res = await callPatch(
      { status: "COMPLETED", taskerId: testTaskerId },
      { id: testAdminId, role: "ADMIN" },
      "IN_PROGRESS",
    )
    expect(res.status).toBe(400)
  })

  it("rejects unauthenticated requests", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue(null)
    const res = await PATCH(mockReq({ status: "COMPLETED" }), {
      params: Promise.resolve({ assignmentId: testAssignmentId }),
    })
    expect(res.status).toBe(401)
  })

  it("handles inactive users", async () => {
    const res = await callPatch(
      { status: "IN_PROGRESS", taskerId: testTaskerId, request: { user: { isActive: false } } },
      { id: testTaskerId, role: "TASKER" },
      "AWAITING_CONFIRMATION",
    )
    expect(res.status).toBe(400)
  })

  it("creates cash transaction on confirmation if none exists", async () => {
    mockTxFindBid.mockResolvedValue({ id: "bid-1", amount: 4500 })
    mockTxFindTransaction.mockResolvedValue(null)
    mockTxUpdateAssignment.mockResolvedValue({ status: "COMPLETED" })
    await callPatch(
      { status: "AWAITING_CONFIRMATION", taskerId: testTaskerId },
      { id: testUserId, role: "USER" },
      "COMPLETED",
    )
    expect(mockTxCreateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 4500, type: "cash", status: "COMPLETED" }),
      }),
    )
  })

  it("skips creating transaction if one already exists", async () => {
    mockTxFindTransaction.mockResolvedValue({ id: "tx-1", status: "COMPLETED" })
    mockTxUpdateAssignment.mockResolvedValue({ status: "COMPLETED" })
    await callPatch(
      { status: "AWAITING_CONFIRMATION", taskerId: testTaskerId },
      { id: testUserId, role: "USER" },
      "COMPLETED",
    )
    expect(mockTxCreateTransaction).not.toHaveBeenCalled()
  })

  describe("commission calculation", () => {
    it("cash transactions have 0 commission", async () => {
      mockTxFindBid.mockResolvedValue({ id: "bid-1", amount: 1000 })
      mockTxFindTransaction.mockResolvedValue(null)
      mockTxUpdateAssignment.mockResolvedValue({ status: "COMPLETED" })

      await callPatch(
        {
          status: "AWAITING_CONFIRMATION",
          taskerId: testTaskerId,
          tasker: { tier: "STANDARD", proExpiresAt: null },
        },
        { id: testUserId, role: "USER" },
        "COMPLETED",
      )

      expect(mockTxCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            commissionRate: 0,
            commission: 0,
            taskerId: testTaskerId,
          }),
        }),
      )
    })

    it("cash transactions have 0 commission for Pro tier too", async () => {
      const futureDate = new Date(Date.now() + 86400000 * 15).toISOString()
      mockTxFindBid.mockResolvedValue({ id: "bid-1", amount: 1000 })
      mockTxFindTransaction.mockResolvedValue(null)
      mockTxUpdateAssignment.mockResolvedValue({ status: "COMPLETED" })

      await callPatch(
        {
          status: "AWAITING_CONFIRMATION",
          taskerId: testTaskerId,
          tasker: { tier: "PRO", proExpiresAt: futureDate },
        },
        { id: testUserId, role: "USER" },
        "COMPLETED",
      )

      expect(mockTxCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            commissionRate: 0,
            commission: 0,
          }),
        }),
      )
    })

    it("credits full amount to tasker balance", async () => {
      mockTxFindBid.mockResolvedValue({ id: "bid-1", amount: 1000 })
      mockTxFindTransaction.mockResolvedValue(null)
      mockTxUpdateAssignment.mockResolvedValue({ status: "COMPLETED" })

      await callPatch(
        {
          status: "AWAITING_CONFIRMATION",
          taskerId: testTaskerId,
          tasker: { tier: "STANDARD", proExpiresAt: null },
        },
        { id: testUserId, role: "USER" },
        "COMPLETED",
      )

      expect(mockTxUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: testTaskerId },
          data: { balance: { increment: 1000 } },
        }),
      )
    })
  })
})
