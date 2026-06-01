import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    oTPCode: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(true),
}))

import { POST } from "@/app/api/auth/verify-otp/route"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

function makePostReq(body: object) {
  return new Request("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimit).mockReturnValue(true)
})

describe("POST /api/auth/verify-otp", () => {
  it("returns 400 for missing phone/code", async () => {
    const res = await POST(makePostReq({ phone: "9841234567" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid/expired code", async () => {
    vi.mocked(prisma.oTPCode.findFirst).mockResolvedValue(null)

    const res = await POST(makePostReq({ phone: "9841234567", code: "000000" }))
    expect(res.status).toBe(400)
  })

  it("returns 200 and creates new user for first-time phone", async () => {
    vi.mocked(prisma.oTPCode.findFirst).mockResolvedValue({ id: "otp-1" } as any)
    vi.mocked(prisma.oTPCode.update).mockResolvedValue({} as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "u1",
      name: null,
      phone: "9841234567",
      email: null,
      role: "USER",
      isTasker: false,
    } as any)

    const res = await POST(makePostReq({ phone: "9841234567", code: "123456" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user.phone).toBe("9841234567")
  })

  it("returns 200 and returns existing user", async () => {
    const existingUser = {
      id: "u2",
      name: "Ram",
      phone: "9841234567",
      email: "ram@test.com",
      role: "USER",
      isTasker: false,
      phoneVerified: true,
    }

    vi.mocked(prisma.oTPCode.findFirst).mockResolvedValue({ id: "otp-1" } as any)
    vi.mocked(prisma.oTPCode.update).mockResolvedValue({} as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any)

    const res = await POST(makePostReq({ phone: "9841234567", code: "123456" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user.name).toBe("Ram")
  })

  it("marks OTP as used after verification", async () => {
    vi.mocked(prisma.oTPCode.findFirst).mockResolvedValue({ id: "otp-1" } as any)
    vi.mocked(prisma.oTPCode.update).mockResolvedValue({} as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "u1",
      name: null,
      phone: "9841234567",
      email: null,
      role: "USER",
      isTasker: false,
    } as any)

    await POST(makePostReq({ phone: "9841234567", code: "123456" }))
    expect(prisma.oTPCode.update).toHaveBeenCalledWith({
      where: { id: "otp-1" },
      data: { used: true },
    })
  })
})
