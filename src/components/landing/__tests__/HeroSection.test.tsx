import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"

vi.mock("framer-motion", () => ({
  motion: {
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ users: 100, taskers: 25, completedJobs: 500, satisfactionRate: 98 }),
  }),
)

import { HeroSection } from "@/components/landing/HeroSection"

describe("HeroSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the main heading", () => {
    render(<HeroSection />)
    expect(screen.getByText("Expert Services")).toBeInTheDocument()
    expect(screen.getByText("At Your Doorstep in Butwal")).toBeInTheDocument()
  })

  it("renders the 'Post a Request & Get Quotes' button", () => {
    render(<HeroSection />)
    expect(screen.getByText("Post a Request & Get Quotes")).toBeInTheDocument()
  })

  it("renders the 'Browse Services' button", () => {
    render(<HeroSection />)
    expect(screen.getByText("Browse Services")).toBeInTheDocument()
  })

  it("displays stats from API", async () => {
    render(<HeroSection />)
    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument()
    })
    expect(screen.getByText("25")).toBeInTheDocument()
    expect(screen.getByText("500")).toBeInTheDocument()
    expect(screen.getByText("98%")).toBeInTheDocument()
  })
})
