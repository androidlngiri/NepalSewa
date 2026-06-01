import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const pages = [
  { name: "Homepage", url: "/" },
  { name: "Services", url: "/services" },
  { name: "About", url: "/about" },
  { name: "Contact", url: "/contact" },
  { name: "Pricing", url: "/pricing" },
  { name: "How It Works", url: "/how-it-works" },
  { name: "Signin", url: "/auth/signin" },
  { name: "Signup", url: "/auth/signup" },
]

for (const { name, url } of pages) {
  test(`${name} has no accessibility violations`, async ({ page }) => {
    await page.goto(url)
    await page.waitForLoadState("networkidle")

    const results = await new AxeBuilder({ page }).analyze()

    const violations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    )

    if (violations.length > 0) {
      const messages = violations.map(
        (v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`,
      )
      console.error(`Accessibility violations on ${name}:\n${messages.join("\n")}`)
    }

    expect(violations).toHaveLength(0)
  })
}
