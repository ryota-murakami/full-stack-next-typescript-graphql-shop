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
    await page.getByLabel(/price/i).fill('1000') // $10.00
    await page.getByRole('button', { name: /create/i }).click()

    await expect(page.url()).toContain('/item/')

    return { email, title }
  }

  test.describe('Add to Cart', () => {
    test('should add item to cart', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')

      // Find the item card and click add to cart
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..')
      await itemCard.getByRole('button', { name: /add to cart/i }).click()

      // Cart badge should show 1 item
      await expect(page.locator('nav').getByText('1')).toBeVisible()
    })

    test('should increment quantity when adding same item', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')

      const itemCard = page.locator(`text=${title}`).locator('..').locator('..')

      // Add to cart twice
      await itemCard.getByRole('button', { name: /add to cart/i }).click()
      await page.waitForTimeout(500)
      await itemCard.getByRole('button', { name: /add to cart/i }).click()

      // Cart badge should show 2 items
      await expect(page.locator('nav').getByText('2')).toBeVisible()
    })
  })

  test.describe('View Cart', () => {
    test('should open cart sidebar', async ({ page }) => {
      await setupTestData(page)

      // Click cart button to open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Cart should be visible
      await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible()
    })

    test('should display cart items', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')

      // Add item to cart
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..')
      await itemCard.getByRole('button', { name: /add to cart/i }).click()

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Item should be in cart
      await expect(page.getByText(title)).toBeVisible()
    })
  })

  test.describe('Remove from Cart', () => {
    test('should remove item from cart', async ({ page }) => {
      const { title } = await setupTestData(page)

      await page.goto('/items')

      // Add item to cart
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..')
      await itemCard.getByRole('button', { name: /add to cart/i }).click()

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Find remove button and click it
      await page.getByRole('button', { name: /remove/i }).click()

      // Cart should show empty state
      await expect(page.getByText(/your cart is empty/i)).toBeVisible()
    })
  })
})
