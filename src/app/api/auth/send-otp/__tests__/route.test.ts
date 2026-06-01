import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: { oTPCode: { create: vi.fn() } },
}))

vi.mock("@/lib/sms", () => ({
  sendSms: vi.fn(),
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(true),
}))

import { POST } from "@/app/api/auth/send-otp/route"
import { prisma } from "@/lib/prisma"
import { sendSms } from "@/lib/sms"
import { rateLimit } from "@/lib/rate-limit"

function makePostReq(body: object) {
  return new Request("http://localhost/api/auth/send-otp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimit).mockReturnValue(true)
})

describe("POST /api/auth/send-otp", () => {
  it("returns 400 for invalid phone number", async () => {
    const res = await POST(makePostReq({ phone: "12345" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 for missing phone", async () => {
    const res = await POST(makePostReq({}))
    expect(res.status).toBe(400)
  })

  it("returns 200 and creates OTP for valid phone", async () => {
    vi.mocked(prisma.oTPCode.create).mockResolvedValue({} as any)
    vi.mocked(sendSms).mockResolvedValue({ success: true })

    const res = await POST(makePostReq({ phone: "9841234567" }))
    expect(res.status).toBe(200)
    expect(prisma.oTPCode.create).toHaveBeenCalled()
  })

  it("includes devOtp when SMS fails", async () => {
    vi.mocked(prisma.oTPCode.create).mockResolvedValue({} as any)
    vi.mocked(sendSms).mockResolvedValue({ success: false, error: "send failed" })

    const res = await POST(makePostReq({ phone: "9841234567" }))
    const json = await res.json()
    expect(json.devOtp).toBeDefined()
  })

  it("returns 429 when rate limited", async () => {
    vi.mocked(rateLimit).mockReturnValue(false)

    const res = await POST(makePostReq({ phone: "9841234567" }))
    expect(res.status).toBe(429)
  })
})
