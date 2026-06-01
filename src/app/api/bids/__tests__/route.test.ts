import { describe, it, expect, vi, beforeEach } from "vitest"

const mockAuth = vi.hoisted(() => vi.fn())
const mockFindUniqueRequest = vi.hoisted(() => vi.fn())
const mockFindUniqueBid = vi.hoisted(() => vi.fn())
const mockCreateBid = vi.hoisted(() => vi.fn())
const mockSendBidNotification = vi.hoisted(() => vi.fn())
const mockCreateNotification = vi.hoisted(() => vi.fn())

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: { findUnique: mockFindUniqueRequest },
    bid: { findUnique: mockFindUniqueBid, create: mockCreateBid },
  },
}))

vi.mock("@/lib/email", () => ({
  sendBidNotification: mockSendBidNotification,
}))

vi.mock("@/lib/notification", () => ({
  createNotification: mockCreateNotification,
}))

import { POST } from "../route"

function createPostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/bids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const taskerSession = {
  user: { id: "tasker-1", name: "Test Tasker", role: "TASKER", isTasker: true },
}

const openRequest = {
  status: "OPEN",
  userId: "user-1",
  user: { isActive: true },
}

const requestWithDetails = {
  user: { email: "user@test.com" },
  service: { name: "Plumbing" },
}

describe("POST /api/bids", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(createPostRequest({ requestId: "req-1", amount: 500 }))
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({ error: "Unauthorized" })
  })

  it("returns 403 when user is not a tasker", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Regular User", role: "USER", isTasker: false },
    })

    const res = await POST(createPostRequest({ requestId: "req-1", amount: 500 }))
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data).toEqual({ error: "Only taskers can place bids" })
  })

  it("returns 400 when missing required fields", async () => {
    mockAuth.mockResolvedValue(taskerSession)

    const res = await POST(createPostRequest({ message: "Hello" }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: "Missing required fields" })
  })

  it("returns 404 when request not found", async () => {
    mockAuth.mockResolvedValue(taskerSession)
    mockFindUniqueRequest.mockResolvedValue(null)

    const res = await POST(createPostRequest({ requestId: "req-1", amount: 500 }))
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data).toEqual({ error: "Request not found" })
  })

  it("returns 400 when bidding on own request", async () => {
    mockAuth.mockResolvedValue(taskerSession)
    mockFindUniqueRequest.mockResolvedValue({
      status: "OPEN",
      userId: "tasker-1",
      user: { isActive: true },
    })

    const res = await POST(createPostRequest({ requestId: "req-1", amount: 500 }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: "Cannot bid on your own request" })
  })

  it("returns 400 when request is not OPEN", async () => {
    mockAuth.mockResolvedValue(taskerSession)
    mockFindUniqueRequest.mockResolvedValue({
      status: "IN_PROGRESS",
      userId: "user-1",
      user: { isActive: true },
    })

    const res = await POST(createPostRequest({ requestId: "req-1", amount: 500 }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: "Can only bid on open requests" })
  })

  it("returns 409 when duplicate bid", async () => {
    mockAuth.mockResolvedValue(taskerSession)
    mockFindUniqueRequest.mockResolvedValue(openRequest)
    mockFindUniqueBid.mockResolvedValue({ id: "bid-1" })

    const res = await POST(createPostRequest({ requestId: "req-1", amount: 500 }))
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data).toEqual({ error: "You have already bid on this request" })
  })

  it("creates bid successfully and sends notification", async () => {
    mockAuth.mockResolvedValue(taskerSession)
    mockFindUniqueRequest
      .mockResolvedValueOnce(openRequest)
      .mockResolvedValueOnce(requestWithDetails)
    mockFindUniqueBid.mockResolvedValue(null)
    mockCreateBid.mockResolvedValue({ id: "bid-new", requestId: "req-1", amount: 500 })
    mockSendBidNotification.mockResolvedValue(undefined)
    mockCreateNotification.mockResolvedValue(undefined)

    const res = await POST(
      createPostRequest({ requestId: "req-1", amount: 500, message: "I can do it" }),
    )
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data).toEqual({ id: "bid-new", requestId: "req-1", amount: 500 })
    expect(mockCreateBid).toHaveBeenCalledWith({
      data: {
        requestId: "req-1",
        taskerId: "tasker-1",
        amount: 500,
        message: "I can do it",
      },
    })
    expect(mockSendBidNotification).toHaveBeenCalledWith({
      to: "user@test.com",
      taskerName: "Test Tasker",
      serviceName: "Plumbing",
      amount: 500,
      requestId: "req-1",
    })
    expect(mockCreateNotification).toHaveBeenCalledWith({
      userId: "user-1",
      type: "new_bid",
      title: "New Bid Received",
      message: expect.stringContaining("Test Tasker"),
      link: "/dashboard/user/bids?requestId=req-1",
    })
  })
})
