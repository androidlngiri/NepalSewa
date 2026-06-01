import { describe, it, expect, vi, beforeEach } from "vitest"

const mockAuth = vi.hoisted(() => vi.fn())
const mockFindUniqueRequest = vi.hoisted(() => vi.fn())
const mockFindFirstAssignment = vi.hoisted(() => vi.fn())
const mockFindFirstReview = vi.hoisted(() => vi.fn())
const mockCreateReview = vi.hoisted(() => vi.fn())
const mockAggregateReview = vi.hoisted(() => vi.fn())
const mockUpdateUser = vi.hoisted(() => vi.fn())
const mockCreateNotification = vi.hoisted(() => vi.fn())

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: { findUnique: mockFindUniqueRequest },
    taskerAssignment: { findFirst: mockFindFirstAssignment },
    review: {
      findFirst: mockFindFirstReview,
      create: mockCreateReview,
      aggregate: mockAggregateReview,
    },
    user: { update: mockUpdateUser },
  },
}))

vi.mock("@/lib/notification", () => ({
  createNotification: mockCreateNotification,
}))

import { POST } from "../route"

function createPostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const userSession = {
  user: { id: "user-1", name: "Test User" },
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(createPostRequest({ revieweeId: "user-2", rating: 5 }))
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({ error: "Unauthorized" })
  })

  it("returns 400 when missing required fields", async () => {
    mockAuth.mockResolvedValue(userSession)

    const res = await POST(createPostRequest({ comment: "Great job" }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: "Missing required fields: revieweeId, rating" })
  })

  it("returns 400 when rating is below range", async () => {
    mockAuth.mockResolvedValue(userSession)

    const res = await POST(createPostRequest({ revieweeId: "user-2", rating: -1 }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: "Rating must be between 1 and 5" })
  })

  it("returns 400 when rating is above range", async () => {
    mockAuth.mockResolvedValue(userSession)

    const res = await POST(createPostRequest({ revieweeId: "user-2", rating: 6 }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: "Rating must be between 1 and 5" })
  })

  it("returns 400 when reviewing yourself", async () => {
    mockAuth.mockResolvedValue(userSession)

    const res = await POST(createPostRequest({ revieweeId: "user-1", rating: 5 }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: "Cannot review yourself" })
  })

  it("returns 409 when duplicate review", async () => {
    mockAuth.mockResolvedValue(userSession)
    mockFindFirstReview.mockResolvedValue({ id: "rev-1" })

    const res = await POST(createPostRequest({ revieweeId: "user-2", rating: 5 }))
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data).toEqual({ error: "You have already reviewed this user for this request" })
  })

  it("creates review successfully without requestId", async () => {
    mockAuth.mockResolvedValue(userSession)
    mockFindFirstReview.mockResolvedValue(null)
    mockCreateReview.mockResolvedValue({
      id: "rev-new",
      rating: 5,
      reviewerId: "user-1",
      revieweeId: "user-2",
    })
    mockAggregateReview.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 10 } })
    mockUpdateUser.mockResolvedValue({ id: "user-2", rating: 4.5 })
    mockCreateNotification.mockResolvedValue(undefined)

    const res = await POST(
      createPostRequest({ revieweeId: "user-2", rating: 5, comment: "Excellent work" }),
    )
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.review).toEqual({
      id: "rev-new",
      rating: 5,
      reviewerId: "user-1",
      revieweeId: "user-2",
    })
    expect(data.averageRating).toBe(4.5)
    expect(data.totalReviews).toBe(10)
    expect(mockCreateReview).toHaveBeenCalledWith({
      data: {
        reviewerId: "user-1",
        revieweeId: "user-2",
        requestId: null,
        rating: 5,
        comment: "Excellent work",
      },
    })
    expect(mockUpdateUser).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { rating: 4.5 },
    })
    expect(mockCreateNotification).toHaveBeenCalledWith({
      userId: "user-2",
      type: "new_review",
      title: "New Review Received",
      message: expect.stringContaining("5 stars"),
      link: "/dashboard/reviews",
    })
  })

  it("creates review successfully with requestId", async () => {
    mockAuth.mockResolvedValue(userSession)
    mockFindUniqueRequest.mockResolvedValue({
      status: "COMPLETED",
      userId: "user-1",
      taskerAssignments: [{ taskerId: "user-2" }],
    })
    mockFindFirstAssignment.mockResolvedValue(null)
    mockFindFirstReview.mockResolvedValue(null)
    mockCreateReview.mockResolvedValue({ id: "rev-new", rating: 4 })
    mockAggregateReview.mockResolvedValue({ _avg: { rating: 4.0 }, _count: { rating: 5 } })
    mockUpdateUser.mockResolvedValue({ id: "user-2", rating: 4.0 })
    mockCreateNotification.mockResolvedValue(undefined)

    const res = await POST(
      createPostRequest({ revieweeId: "user-2", requestId: "req-1", rating: 4 }),
    )
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(mockCreateReview).toHaveBeenCalledWith({
      data: {
        reviewerId: "user-1",
        revieweeId: "user-2",
        requestId: "req-1",
        rating: 4,
        comment: null,
      },
    })
  })
})
