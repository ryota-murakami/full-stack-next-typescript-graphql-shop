import { test, expect } from '@playwright/test'

/**
 * Cart E2E Tests
 * Tests adding to cart, removing from cart, and viewing cart.
 */

test.describe('Cart', () => {
  // Helper to create an authenticated session with an item
  async function setupTestData(page: import('@playwright/test').Page) {
    const email = `cart-${Date.now()}@example.com`

    // Sign up
    await page.goto('/signup')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/name/i).fill('Cart Test User')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/')

    // Create a test item
    await page.goto('/sell')
    const title = `Cart Item ${Date.now()}`
    await page.getByLabel(/title/i).fill(title)
    await page.getByLabel(/description/i).fill('Test item for cart')
    await page.getByLabel(/price/i).fill('10') // $10.00 (component converts to cents)
    await page.getByRole('button', { name: /create/i }).click()

    // Wait for redirect to item page (use toHaveURL with regex for async waiting)
    await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })

    return { email, title }
  }

  test.describe('Add to Cart', () => {
    test('should add item to cart', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')
      // Wait for the specific item to appear (handles Apollo cache delays)
      await page.waitForSelector(`text=${title}`, { timeout: 10000 })

      // Find the item card and click add to cart
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..').locator('..')
      await itemCard.getByRole('button', { name: /add to cart/i }).click()

      // Cart badge should show 1 item
      await expect(page.locator('nav').getByText('1')).toBeVisible()
    })

    test('should increment quantity when adding same item', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')
      // Reload to bypass Apollo cache and get fresh data (parallel tests may create items)
      await page.reload()
      // Wait for the specific item to appear
      await page.waitForSelector(`text=${title}`, { timeout: 15000 })

      const itemCard = page.locator(`text=${title}`).locator('..').locator('..').locator('..')

      // Add to cart twice - use first() to handle case where parent locator matches multiple items
      await itemCard.getByRole('button', { name: /add to cart/i }).first().click()
      await page.waitForTimeout(500)
      await itemCard.getByRole('button', { name: /add to cart/i }).first().click()

      // Cart badge should show 2 items
      await expect(page.locator('nav').getByText('2')).toBeVisible()
    })
  })

  test.describe('View Cart', () => {
    test('should open cart sidebar', async ({ page }) => {
      await setupTestData(page)

      // Click cart button to open cart
      await page.locator('nav').getByRole('button', { name: /my cart/i }).click()

      // Cart should be visible
      await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible()
    })

    test('should display cart items', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')
      // Reload to bypass Apollo cache and get fresh data (parallel tests may create items)
      await page.reload()
      // Wait for the specific item to appear
      await page.waitForSelector(`text=${title}`, { timeout: 15000 })

      // Add item to cart - use first() to handle case where parent locator matches multiple items
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..').locator('..')
      await itemCard.getByRole('button', { name: /add to cart/i }).first().click()

      // Open cart
      await page.locator('nav').getByRole('button', { name: /my cart/i }).click()

      // Item should be in cart - use the cart list directly to avoid matching items on the page
      // The cart sidebar has: banner (with heading) + list (with items) as siblings
      const cartList = page.getByRole('list').filter({ has: page.getByRole('button', { name: /remove from cart/i }) })
      await expect(cartList.getByText(title)).toBeVisible()
    })
  })

  test.describe('Remove from Cart', () => {
    test('should remove item from cart', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')
      // Reload to bypass Apollo cache and get fresh data (parallel tests may create items)
      await page.reload()
      // Wait for the specific item to appear
      await page.waitForSelector(`text=${title}`, { timeout: 15000 })

      // Add item to cart - use first() to handle case where parent locator matches multiple items
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..').locator('..')
      await itemCard.getByRole('button', { name: /add to cart/i }).first().click()

      // Open cart
      await page.locator('nav').getByRole('button', { name: /my cart/i }).click()

      // Find remove button and click it
      await page.getByRole('button', { name: /remove from cart/i }).click()

      // Cart should show empty state
      await expect(page.getByText(/your cart is empty/i)).toBeVisible()
    })
  })
})
