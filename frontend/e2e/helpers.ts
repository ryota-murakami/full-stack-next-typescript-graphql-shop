import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * E2E Test Helpers
 * Shared utility functions for common test operations.
 * Each function is isolated to prevent test pollution.
 */

/**
 * Creates a unique test user with timestamp-based email
 * @param page - Playwright page instance
 * @param options - Optional user data overrides
 * @returns User credentials for subsequent operations
 * @example
 * const { email, name, password } = await createTestUser(page)
 * // User is now signed in and on homepage
 */
export async function createTestUser(
  page: Page,
  options: { prefix?: string; name?: string } = {}
) {
  const timestamp = Date.now()
  const prefix = options.prefix ?? 'test'
  const email = `${prefix}-${timestamp}@example.com`
  const name = options.name ?? 'Test User'
  const password = 'password123'

  await page.goto('/signup')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/name/i).fill(name)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign up/i }).click()

  await expect(page).toHaveURL('/')

  return { email, name, password }
}

/**
 * Signs in with existing credentials
 * @param page - Playwright page instance
 * @param email - User email
 * @param password - User password
 * @example
 * await signIn(page, 'user@example.com', 'password123')
 */
export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/signin')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL('/')
}

/**
 * Signs out the current user
 * @param page - Playwright page instance
 * @example
 * await signOut(page)
 * // User is now signed out
 */
export async function signOut(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
}

/**
 * Creates a new item via the sell page
 * @param page - Playwright page instance
 * @param data - Item data
 * @returns Created item details including title
 * @example
 * await createTestUser(page)
 * const { title } = await createItem(page, { price: 1999 })
 */
export async function createItem(
  page: Page,
  data: {
    title?: string
    description?: string
    price?: number
  } = {}
) {
  const timestamp = Date.now()
  const title = data.title ?? `Test Item ${timestamp}`
  const description = data.description ?? 'Test item description'
  const price = String(data.price ?? 999)

  await page.goto('/sell')
  await page.getByLabel(/title/i).fill(title)
  await page.getByLabel(/description/i).fill(description)
  await page.getByLabel(/price/i).fill(price)
  await page.getByRole('button', { name: /create/i }).click()

  await expect(page.url()).toContain('/item/')

  return { title, description, price }
}

/**
 * Adds an item to cart by title
 * @param page - Playwright page instance
 * @param itemTitle - Title of the item to add
 * @example
 * await addToCart(page, 'My Item')
 */
export async function addToCart(page: Page, itemTitle: string) {
  await page.goto('/items')
  const itemCard = page.locator(`text=${itemTitle}`).locator('..').locator('..')
  await itemCard.getByRole('button', { name: /add to cart/i }).click()
}

/**
 * Opens the cart sidebar
 * @param page - Playwright page instance
 */
export async function openCart(page: Page) {
  await page.locator('nav').getByRole('button', { name: /shopping/i }).click()
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible()
}

/**
 * Waits for GraphQL network response
 * @param page - Playwright page instance
 * @param operationName - GraphQL operation name
 * @example
 * await waitForGraphQL(page, 'SearchItems')
 */
export async function waitForGraphQL(page: Page, operationName: string) {
  await page.waitForResponse(
    (response) =>
      response.url().includes('/graphql') &&
      response.request().postData()?.includes(operationName)
  )
}

/**
 * Gets the current theme from document
 * @param page - Playwright page instance
 * @returns Current theme ('light' | 'dark' | 'system')
 */
export async function getCurrentTheme(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })
}

/**
 * Opens theme toggle dropdown and selects theme
 * @param page - Playwright page instance
 * @param theme - Theme to select
 */
export async function setTheme(
  page: Page,
  theme: 'light' | 'dark' | 'system'
) {
  // Click the theme toggle button
  await page.getByRole('button', { name: /toggle theme/i }).click()

  // Wait for dropdown to appear and click the theme option
  const themeName = theme.charAt(0).toUpperCase() + theme.slice(1)
  await page.getByRole('menuitem', { name: new RegExp(themeName, 'i') }).click()
}

/**
 * Generates unique item data for testing
 * @returns Item data with unique title
 */
export function generateItemData() {
  const timestamp = Date.now()
  return {
    title: `Test Item ${timestamp}`,
    description: 'Test description for E2E testing',
    price: Math.floor(Math.random() * 10000) + 100,
  }
}

/**
 * Checks if an element exists and is visible
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @returns Whether element is visible
 */
export async function isElementVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000 })
    return true
  } catch {
    return false
  }
}
