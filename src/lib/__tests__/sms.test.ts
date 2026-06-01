import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPost = vi.fn()

beforeEach(() => {
  vi.resetModules()
  vi.unstubAllEnvs()
  mockPost.mockReset()
})

describe("sendSms", () => {
  it("returns error when SPARROW_SMS_TOKEN not set", async () => {
    vi.stubEnv("SPARROW_SMS_TOKEN", "")
    vi.stubEnv("SPARROW_SMS_SENDER_ID", "")
    vi.doMock("axios", () => ({ default: { post: mockPost } }))
    const { sendSms } = await import("@/lib/sms")

    const result = await sendSms("9841234567", "test")
    expect(result.success).toBe(false)
    expect(result.error).toBe("SMS not configured")
  })

  it("returns success when SMS API responds with 200", async () => {
    vi.stubEnv("SPARROW_SMS_TOKEN", "test-token")
    vi.stubEnv("SPARROW_SMS_SENDER_ID", "test-sender")
    vi.doMock("axios", () => ({ default: { post: mockPost } }))
    const { sendSms } = await import("@/lib/sms")

    mockPost.mockResolvedValueOnce({
      data: { response_code: "200" },
    })

    const result = await sendSms("9841234567", "Hello")
    expect(result.success).toBe(true)
  })

  it("returns error when SMS API returns non-200 response_code", async () => {
    vi.stubEnv("SPARROW_SMS_TOKEN", "test-token")
    vi.stubEnv("SPARROW_SMS_SENDER_ID", "test-sender")
    vi.doMock("axios", () => ({ default: { post: mockPost } }))
    const { sendSms } = await import("@/lib/sms")

    mockPost.mockResolvedValueOnce({
      data: { response_code: "400" },
    })

    const result = await sendSms("9841234567", "Hello")
    expect(result.success).toBe(false)
    expect(result.error).toBe("400")
  })

  it("returns error on network failure", async () => {
    vi.stubEnv("SPARROW_SMS_TOKEN", "test-token")
    vi.stubEnv("SPARROW_SMS_SENDER_ID", "test-sender")
    vi.doMock("axios", () => ({ default: { post: mockPost } }))
    const { sendSms } = await import("@/lib/sms")

    mockPost.mockRejectedValueOnce(new Error("Network Error"))

    const result = await sendSms("9841234567", "Hello")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Network Error")
  })
})
