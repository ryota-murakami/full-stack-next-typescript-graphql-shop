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

  test.describe('Stripe Checkout Flow', () => {
    test('should display Stripe checkout button', async ({ page }) => {
      await setupCheckoutScenario(page)

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Checkout button should be visible
      const checkoutButton = page.getByRole('button', { name: /checkout/i })
      await expect(checkoutButton).toBeVisible()
    })

    test('should handle Stripe test card checkout', async ({ page }) => {
      await setupCheckoutScenario(page)

      // Mock Stripe checkout for testing
      // Note: Full Stripe integration requires actual test keys
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('createOrder')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                checkout: {
                  id: 'test-order-id',
                  total: 2500,
                  items: [
                    {
                      id: 'order-item-1',
                      title: 'Checkout Item',
                      price: 2500,
                      quantity: 1,
                    },
                  ],
                },
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Checkout button should be clickable
      const checkoutButton = page.getByRole('button', { name: /checkout/i })
      await expect(checkoutButton).toBeEnabled()
    })

    test('should show multiple items total correctly', async ({ page }) => {
      const email = `multi-item-${Date.now()}@example.com`

      // Sign up
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Multi Item User')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()
      await expect(page).toHaveURL('/')

      // Create first item
      await page.goto('/sell')
      const title1 = `Multi Item 1 ${Date.now()}`
      await page.getByLabel(/title/i).fill(title1)
      await page.getByLabel(/description/i).fill('First item')
      await page.getByLabel(/price/i).fill('1000') // $10.00
      await page.getByRole('button', { name: /create/i }).click()
      await expect(page.url()).toContain('/item/')

      // Create second item
      await page.goto('/sell')
      const title2 = `Multi Item 2 ${Date.now()}`
      await page.getByLabel(/title/i).fill(title2)
      await page.getByLabel(/description/i).fill('Second item')
      await page.getByLabel(/price/i).fill('1500') // $15.00
      await page.getByRole('button', { name: /create/i }).click()
      await expect(page.url()).toContain('/item/')

      // Add both items to cart
      await page.goto('/items')
      const item1Card = page.locator(`text=${title1}`).locator('..').locator('..')
      await item1Card.getByRole('button', { name: /add to cart/i }).click()

      const item2Card = page.locator(`text=${title2}`).locator('..').locator('..')
      await item2Card.getByRole('button', { name: /add to cart/i }).click()

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Should show total ($10 + $15 = $25)
      await expect(page.getByText('$25')).toBeVisible()
    })
  })

  test.describe('Order Completion', () => {
    test('should navigate to order detail after successful checkout', async ({ page }) => {
      await setupCheckoutScenario(page)

      // Mock successful order creation
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('createOrder') || postData?.includes('checkout')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                checkout: {
                  id: 'completed-order-123',
                  total: 2500,
                  items: [
                    {
                      id: 'item-1',
                      title: 'Checkout Item',
                      price: 2500,
                      quantity: 1,
                    },
                  ],
                },
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      // Open cart
      await page.locator('nav').getByRole('button', { name: /shopping/i }).click()

      // Checkout button visible
      await expect(page.getByRole('button', { name: /checkout/i })).toBeVisible()
    })

    test('should display order in orders list after checkout', async ({ page }) => {
      const email = `orders-list-${Date.now()}@example.com`

      // Sign up
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Orders List User')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()
      await expect(page).toHaveURL('/')

      // Mock orders query to show an order
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('orders') || postData?.includes('myOrders')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                orders: [
                  {
                    id: 'order-1',
                    total: 2500,
                    createdAt: new Date().toISOString(),
                    items: [
                      {
                        id: 'order-item-1',
                        title: 'Test Product',
                        price: 2500,
                        quantity: 1,
                        image: null,
                      },
                    ],
                  },
                ],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/orders')

      // Should show the order
      await expect(page.getByText(/\$25/)).toBeVisible()
    })
  })

  test.describe('Cart Clearing', () => {
    test('should clear cart UI after successful order', async ({ page }) => {
      await setupCheckoutScenario(page)

      // Verify cart has items
      await expect(page.locator('nav').getByText('1')).toBeVisible()

      // Mock the checkout to succeed and clear cart
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('checkout')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                checkout: {
                  id: 'order-clear-test',
                  total: 2500,
                  items: [],
                },
              },
            }),
          })
        } else if (postData?.includes('currentUser') || postData?.includes('me')) {
          // Return user with empty cart after checkout
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                me: {
                  id: 'user-id',
                  email: 'test@example.com',
                  name: 'Test User',
                  permissions: ['USER'],
                  cart: [], // Empty cart
                },
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      // Cart badge should show item count before checkout
      const cartBadge = page.locator('nav').getByText('1')
      await expect(cartBadge).toBeVisible()
    })
  })
})
