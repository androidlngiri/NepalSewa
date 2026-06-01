import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { id: "email-1" }, error: null }),
)

vi.mock("resend", () => {
  function MockResend() {
    return { emails: { send: mockSend } }
  }
  return { Resend: MockResend }
})

import { wrapHtml, sendBidNotification } from "@/lib/email"

beforeEach(() => {
  mockSend.mockClear()
})

describe("wrapHtml", () => {
  it("wraps body in proper HTML structure", () => {
    const html = wrapHtml("<p>test</p>")
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("<html>")
    expect(html).toContain("</html>")
    expect(html).toContain("<p>test</p>")
  })

  it("includes NepalSewa branding", () => {
    const html = wrapHtml("body")
    expect(html).toContain("NepalSewa")
  })

  it("includes current year in footer", () => {
    const html = wrapHtml("body")
    expect(html).toContain(String(new Date().getFullYear()))
  })
})

describe("sendBidNotification", () => {
  it("calls resend.emails.send with correct params", async () => {
    await sendBidNotification({
      to: "user@test.com",
      taskerName: "Ram",
      serviceName: "Plumbing",
      amount: 500,
      requestId: "req-1",
    })

    expect(mockSend).toHaveBeenCalledTimes(1)
    const call = mockSend.mock.calls[0][0]
    expect(call.to).toBe("user@test.com")
    expect(call.subject).toContain("Plumbing")
  })

  it("includes tasker name, amount, and link in HTML", async () => {
    await sendBidNotification({
      to: "user@test.com",
      taskerName: "Ram",
      serviceName: "Plumbing",
      amount: 500,
      requestId: "req-1",
    })

    const call = mockSend.mock.calls[0][0]
    expect(call.html).toContain("Ram")
    expect(call.html).toContain((500).toLocaleString())
    expect(call.html).toContain("req-1")
  })
})
