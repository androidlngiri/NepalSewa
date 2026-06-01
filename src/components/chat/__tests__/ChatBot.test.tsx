import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

vi.mock("framer-motion", () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock("react-markdown", () => ({
  default: ({ children }: any) => <>{children}</>,
}))

vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ reply: "Hello!" }),
  }),
)

import { ChatBot } from "@/components/chat/ChatBot"

describe("ChatBot", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the toggle button", () => {
    render(<ChatBot />)
    expect(screen.getByLabelText("Open chat")).toBeInTheDocument()
  })

  it("opens chat window when toggle button is clicked", () => {
    render(<ChatBot />)
    fireEvent.click(screen.getByLabelText("Open chat"))
    expect(screen.getByText("NepalSewa Assistant")).toBeInTheDocument()
    expect(screen.getByLabelText("Close chat")).toBeInTheDocument()
  })

  it("closes chat window when close button is clicked", () => {
    render(<ChatBot />)
    fireEvent.click(screen.getByLabelText("Open chat"))
    expect(screen.getByText("NepalSewa Assistant")).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("Close chat"))
    expect(screen.queryByText("NepalSewa Assistant")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Open chat")).toBeInTheDocument()
  })

  it("has an input field", () => {
    render(<ChatBot />)
    fireEvent.click(screen.getByLabelText("Open chat"))
    expect(screen.getByPlaceholderText("Type your question...")).toBeInTheDocument()
  })

  it("has a send button", () => {
    const { container } = render(<ChatBot />)
    fireEvent.click(screen.getByLabelText("Open chat"))
    const sendButton = container.querySelector('[data-slot="button"]:not([aria-label])')
    expect(sendButton).toBeInTheDocument()
    expect(sendButton).toHaveAttribute("disabled")
  })
})
