import { test, expect } from "@playwright/test"

test.describe("SEO and meta", () => {
  test("homepage has correct meta tags", async ({ page }) => {
    await page.goto("/")
    const title = await page.title()
    expect(title).toContain("NepalSewa")

    const description = await page.getAttribute('meta[name="description"]', "content")
    expect(description).toBeTruthy()
  })

  test("homepage has structured data", async ({ page }) => {
    await page.goto("/")
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    expect(scripts.length).toBeGreaterThan(0)
  })

  test("services page has structured data", async ({ page }) => {
    await page.goto("/services")
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    expect(scripts.length).toBeGreaterThan(0)
  })
})

test.describe("Responsive design", () => {
  test("mobile viewport shows bottom nav", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    await expect(page.locator("text=Get Started")).toBeVisible()
  })

  test("desktop viewport shows full navbar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto("/")
    await expect(page.locator("text=Get Started")).toBeVisible()
  })
})

test.describe("Performance", () => {
  test("homepage loads within 5 seconds", async ({ page }) => {
    const start = Date.now()
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(5000)
  })

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    expect(errors.length).toBe(0)
  })
})
