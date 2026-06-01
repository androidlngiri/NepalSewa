import { test, expect } from "@playwright/test"

test.describe("Navigation", () => {
  test("landing page loads with all sections", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/NepalSewa/)
    await expect(page.locator("text=Find Trusted Local Services")).toBeVisible()
    await expect(page.locator("text=Become a Tasker")).toBeVisible()
    await expect(page.locator("text=Post a Request")).toBeVisible()
  })

  test("services page loads", async ({ page }) => {
    await page.goto("/services")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("about page loads", async ({ page }) => {
    await page.goto("/about")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("how-it-works page loads", async ({ page }) => {
    await page.goto("/how-it-works")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("signin page loads with email/phone tabs", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.locator("text=Email")).toBeVisible()
    await expect(page.locator("text=Phone")).toBeVisible()
  })

  test("signup page loads", async ({ page }) => {
    await page.goto("/auth/signup")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("navbar links navigate correctly", async ({ page }) => {
    await page.goto("/")

    await page.click("text=Services")
    await expect(page).toHaveURL(/\/services/)

    await page.click("text=About")
    await expect(page).toHaveURL(/\/about/)

    await page.click("text=Pricing")
    await expect(page).toHaveURL(/\/pricing/)
  })

  test("footer links work", async ({ page }) => {
    await page.goto("/")

    const footer = page.locator("footer")
    await expect(footer).toBeVisible()

    await footer.click("text=Services")
    await expect(page).toHaveURL(/\/services/)
  })
})
