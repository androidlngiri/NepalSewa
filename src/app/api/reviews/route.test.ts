import { describe, it, expect, vi, beforeEach } from "vitest"

const testUserId = "test-user-id"
const testTaskerId = "tasker-id"
const testRequestId = "request-1"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

const mockReviewFindFirst = vi.hoisted(() => vi.fn())
const mockReviewCreate = vi.hoisted(() => vi.fn())
const mockReviewFindMany = vi.hoisted(() => vi.fn())
const mockReviewAggregate = vi.hoisted(() => vi.fn())
const mockRequestFindUnique = vi.hoisted(() => vi.fn())
const mockUserUpdate = vi.hoisted(() => vi.fn())
const mockAssignmentFindFirst = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findFirst: mockReviewFindFirst,
      create: mockReviewCreate,
      findMany: mockReviewFindMany,
      aggregate: mockReviewAggregate,
    },
    request: {
      findUnique: mockRequestFindUnique,
    },
    user: {
      update: mockUserUpdate,
    },
    taskerAssignment: {
      findFirst: mockAssignmentFindFirst,
    },
  },
}))

import { POST } from "./route"

describe("POST /api/reviews", () => {
  function mockReq(body: any) {
    return {
      json: () => Promise.resolve(body),
    } as any
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("submits a valid review", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({
      user: { id: testUserId },
    })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: testUserId,
      status: "COMPLETED",
      taskerAssignments: [{ taskerId: testTaskerId }],
    })
    mockAssignmentFindFirst.mockResolvedValue({ id: "assignment-1" })
    mockReviewFindFirst.mockResolvedValue(null)
    mockReviewCreate.mockResolvedValue({ id: "review-1", rating: 5, comment: "Great work!" })
    mockReviewAggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 10 } })

    const res = await POST(
      mockReq({ revieweeId: testTaskerId, requestId: testRequestId, rating: 5, comment: "Great work!" })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.review.rating).toBe(5)
    expect(body.averageRating).toBe(4.5)
  })

  it("rejects review without rating", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: testUserId } })

    const res = await POST(mockReq({ revieweeId: testTaskerId }))
    expect(res.status).toBe(400)
  })

  it("rejects out of range rating", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: testUserId } })

    const res = await POST(mockReq({ revieweeId: testTaskerId, rating: 6 }))
    expect(res.status).toBe(400)
  })

  it("rejects self-review", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: testUserId } })

    const res = await POST(mockReq({ revieweeId: testUserId, rating: 5 }))
    expect(res.status).toBe(400)
  })

  it("rejects review on non-completed request", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: testUserId } })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      status: "IN_PROGRESS",
      taskerAssignments: [{ taskerId: testTaskerId }],
    })

    const res = await POST(
      mockReq({ revieweeId: testTaskerId, requestId: testRequestId, rating: 5 })
    )
    expect(res.status).toBe(400)
  })

  it("rejects duplicate reviews", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: testUserId } })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: testUserId,
      status: "COMPLETED",
      taskerAssignments: [{ taskerId: testTaskerId }],
    })
    mockAssignmentFindFirst.mockResolvedValue({ id: "assignment-1" })
    mockReviewFindFirst.mockResolvedValue({ id: "existing-review" })

    const res = await POST(
      mockReq({ revieweeId: testTaskerId, requestId: testRequestId, rating: 4 })
    )
    expect(res.status).toBe(409)
  })

  it("updates user rating after review", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: testUserId } })

    mockRequestFindUnique.mockResolvedValue({
      id: testRequestId,
      userId: testUserId,
      status: "COMPLETED",
      taskerAssignments: [{ taskerId: testTaskerId }],
    })
    mockAssignmentFindFirst.mockResolvedValue({ id: "assignment-1" })
    mockReviewFindFirst.mockResolvedValue(null)
    mockReviewCreate.mockResolvedValue({ id: "review-1", rating: 5 })
    mockReviewAggregate.mockResolvedValue({ _avg: { rating: 4.8 }, _count: { rating: 5 } })

    await POST(
      mockReq({ revieweeId: testTaskerId, requestId: testRequestId, rating: 5 })
    )

    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: testTaskerId },
        data: { rating: 4.8 },
      })
    )
  })
})
