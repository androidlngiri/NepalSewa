import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"

vi.mock("framer-motion", () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt"

describe("PwaInstallPrompt", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 })
    window.dispatchEvent(new Event("resize"))
    localStorage.clear()
  })

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 })
  })

  it("renders nothing by default (no beforeinstallprompt event)", () => {
    const { container } = render(<PwaInstallPrompt />)
    expect(container.innerHTML).toBe("")
  })

  it("renders install banner after beforeinstallprompt event", () => {
    render(<PwaInstallPrompt />)

    act(() => {
      const installEvent = new Event("beforeinstallprompt") as any
      installEvent.preventDefault = vi.fn()
      window.dispatchEvent(installEvent)
    })

    expect(screen.getByText("Install NepalSewa")).toBeInTheDocument()
    expect(screen.getByText("Install")).toBeInTheDocument()
  })

  it("hides after dismiss button clicked", () => {
    render(<PwaInstallPrompt />)

    act(() => {
      const installEvent = new Event("beforeinstallprompt") as any
      installEvent.preventDefault = vi.fn()
      window.dispatchEvent(installEvent)
    })

    expect(screen.getByText("Install NepalSewa")).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("Dismiss"))
    expect(screen.queryByText("Install NepalSewa")).not.toBeInTheDocument()
  })
})
