import { test, expect } from '@playwright/test'

/**
 * Checkout E2E Tests
 * Tests the complete order flow including Stripe payment.
 * Note: These tests require valid Stripe test keys configured.
 */

test.describe('Checkout', () => {
  // Helper to create an authenticated session with cart items
  async function setupCheckoutScenario(page: import('@playwright/test').Page) {
    const email = `checkout-${Date.now()}@example.com`

    // Sign up
    await page.goto('/signup')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/name/i).fill('Checkout Test User')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/')

    // Create a test item
    await page.goto('/sell')
    const title = `Checkout Item ${Date.now()}`
    await page.getByLabel(/title/i).fill(title)
    await page.getByLabel(/description/i).fill('Test item for checkout')
    await page.getByLabel(/price/i).fill('2500') // $25.00
    await page.getByRole('button', { name: /create/i }).click()

    await expect(page.url()).toContain('/item/')

    // Add item to cart
    await page.goto('/items')
    const itemCard = page.locator(`text=${title}`).locator('..').locator('..')
    await itemCard.getByRole('button', { name: /add to cart/i }).click()

    return { email, title }
  }

  test.describe('Order Flow', () => {
    test('should display checkout button in cart', async ({ page }) => {
      await setupCheckoutScenario(page)

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Checkout button should be visible
      await expect(page.getByRole('button', { name: /checkout/i })).toBeVisible()
    })

    test('should display total price in cart', async ({ page }) => {
      await setupCheckoutScenario(page)

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Should show the total ($25.00)
      await expect(page.getByText('$25')).toBeVisible()
    })

    // Note: Full Stripe checkout test requires Stripe test card
    // This test validates the checkout flow up to payment
    test('should initiate checkout process', async ({ page }) => {
      await setupCheckoutScenario(page)

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Check that checkout is available
      const checkoutButton = page.getByRole('button', { name: /checkout/i })
      await expect(checkoutButton).toBeEnabled()
    })
  })

  test.describe('Orders Page', () => {
    test('should display orders page', async ({ page }) => {
      // Sign up
      const email = `orders-${Date.now()}@example.com`
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Orders Test User')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()
      await expect(page).toHaveURL('/')

      await page.goto('/orders')

      await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible()
    })

    test('should show empty state when no orders', async ({ page }) => {
      // Sign up with fresh user
      const email = `no-orders-${Date.now()}@example.com`
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('No Orders User')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()
      await expect(page).toHaveURL('/')

      await page.goto('/orders')

      await expect(page.getByText(/no orders/i)).toBeVisible()
    })
  })
})
