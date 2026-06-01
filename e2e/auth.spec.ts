import { test, expect } from "@playwright/test"

test.describe("Auth flows", () => {
  test("signin page shows email tab by default", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.locator("input[type='email']")).toBeVisible()
  })

  test("signin page switches to phone tab", async ({ page }) => {
    await page.goto("/auth/signin")
    await page.click("text=Phone")
    await expect(page.locator("input[placeholder*='98']")).toBeVisible()
  })

  test("signup page has Google sign-up", async ({ page }) => {
    await page.goto("/auth/signup")
    await expect(page.locator("text=Continue with Google")).toBeVisible()
  })

  test("signin page has forgot password link", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.locator("text=Forgot password?")).toBeVisible()
  })

  test("signin page shows terms text", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.locator("text=By continuing")).toBeVisible()
  })
})

test.describe("Services browsing", () => {
  test("services page shows search input", async ({ page }) => {
    await page.goto("/services")
    await expect(page.locator("input[placeholder]")).toBeVisible()
  })

  test("services page shows category buttons", async ({ page }) => {
    await page.goto("/services")
    await expect(page.locator("text=All Services")).toBeVisible()
  })

  test("services page search works", async ({ page }) => {
    await page.goto("/services")
    const searchInput = page.locator("input[placeholder*='Search']")
    await searchInput.fill("plumbing")
    await page.waitForTimeout(1000)
    await expect(page.locator("text=/plumbing|Plumbing/")).toBeVisible()
  })
})
