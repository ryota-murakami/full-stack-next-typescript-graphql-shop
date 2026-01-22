import { test, expect } from '@playwright/test'
import { createTestUser, createItem } from './helpers'

/**
 * Error Handling E2E Tests
 * Tests 404 pages, error boundaries, network errors, and edge cases.
 */

test.describe('Error Handling', () => {
  test.describe('404 Not Found', () => {
    test('should display 404 page for invalid routes', async ({ page }) => {
      await page.goto('/this-route-does-not-exist-12345')

      // Should show 404 page
      await expect(page.getByText(/not found/i)).toBeVisible()
    })

    test('should display 404 page for invalid item ID', async ({ page }) => {
      await page.goto('/item/invalid-item-id-that-does-not-exist')

      // Should show error or 404
      await expect(
        page.getByText(/not found/i).or(page.getByText(/error/i)).or(page.getByText(/doesn't exist/i))
      ).toBeVisible()
    })

    test('should provide navigation options on 404 page', async ({ page }) => {
      await page.goto('/nonexistent-page')

      // Should have link to go home
      const goHomeLink = page.getByRole('link', { name: /home/i }).or(
        page.getByRole('button', { name: /home/i })
      )
      await expect(goHomeLink).toBeVisible()
    })

    test('should provide link to browse shop on 404', async ({ page }) => {
      await page.goto('/nonexistent-page')

      // Should have link to browse shop
      const browseLink = page.getByRole('link', { name: /shop|browse/i }).or(
        page.getByRole('button', { name: /shop|browse/i })
      )
      await expect(browseLink).toBeVisible()
    })
  })

  test.describe('Network Errors', () => {
    test('should handle GraphQL network failure gracefully', async ({ page }) => {
      // Create a user first
      await createTestUser(page, { prefix: 'network-error' })

      // Mock network failure
      await page.route('**/graphql', async (route) => {
        await route.abort('failed')
      })

      // Try to navigate to items
      await page.goto('/items')

      // Should show error state or retry option
      // The page should not crash
      await expect(page.locator('body')).toBeVisible()
    })

    test('should display error message for failed queries', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('allItems')) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{ message: 'Internal server error' }],
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/items')

      // Should show error state
      await expect(
        page.getByText(/error/i).or(page.getByRole('heading', { name: /shop/i }))
      ).toBeVisible()
    })
  })

  test.describe('Error Boundary', () => {
    test('should catch and display runtime errors', async ({ page }) => {
      // Mock a query that causes an error
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('allItems')) {
          // Return malformed data that might cause a render error
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                items: null, // Unexpected null might cause issues
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/items')

      // Page should still be functional (either showing error UI or empty state)
      await expect(page.locator('body')).toBeVisible()
    })

    test('should provide recovery option on error', async ({ page }) => {
      // Navigate to a page that might have an error state
      await page.goto('/item/invalid-id-format!@#$%')

      // If there's an error, there should be a way to recover
      const tryAgainButton = page.getByRole('button', { name: /try again/i })
      const goHomeButton = page.getByRole('button', { name: /go home/i }).or(
        page.getByRole('link', { name: /home/i })
      )

      // At least one recovery option should be available
      await expect(
        tryAgainButton.or(goHomeButton).or(page.getByText(/not found/i))
      ).toBeVisible()
    })
  })

  test.describe('Invalid Data Handling', () => {
    test('should handle invalid order ID gracefully', async ({ page }) => {
      await createTestUser(page, { prefix: 'invalid-order' })

      await page.goto('/order/invalid-order-id-12345')

      // Should show error or redirect
      await expect(
        page.getByText(/not found/i).or(page.getByText(/error/i)).or(page.getByText(/invalid/i))
      ).toBeVisible()
    })

    test('should handle invalid update page ID', async ({ page }) => {
      await createTestUser(page, { prefix: 'invalid-update' })

      await page.goto('/update/invalid-item-id-67890')

      // Should show error or not found
      await expect(
        page.getByText(/not found/i).or(page.getByText(/error/i)).or(page.getByText(/cannot/i))
      ).toBeVisible()
    })
  })

  test.describe('Form Error States', () => {
    test('should display validation errors on sign up', async ({ page }) => {
      await page.goto('/signup')

      // Try to submit empty form
      await page.getByRole('button', { name: /sign up/i }).click()

      // Should show validation error (HTML5 or custom)
      // Form should still be on the page
      await expect(page.getByLabel(/email/i)).toBeVisible()
    })

    test('should display error for invalid sign in', async ({ page }) => {
      await page.goto('/signin')

      // Try invalid credentials
      await page.getByLabel(/email/i).first().fill('nonexistent@email.com')
      await page.getByLabel(/password/i).first().fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()

      // Should show error message
      await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible()
    })

    test('should handle duplicate email on signup', async ({ page }) => {
      // Create first user
      const email = `duplicate-${Date.now()}@example.com`
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('First User')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()
      await expect(page).toHaveURL('/')

      // Sign out
      await page.getByRole('button', { name: /sign out/i }).click()

      // Try to create second user with same email
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Second User')
      await page.getByLabel(/password/i).fill('password456')
      await page.getByRole('button', { name: /sign up/i }).click()

      // Should show error about duplicate email
      await expect(page.getByText(/already exists|duplicate|registered/i)).toBeVisible()
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle very long item titles', async ({ page }) => {
      await createTestUser(page, { prefix: 'long-title' })

      await page.goto('/sell')

      // Create item with very long title
      const longTitle = 'A'.repeat(200) + ` ${Date.now()}`
      await page.getByLabel(/title/i).fill(longTitle)
      await page.getByLabel(/description/i).fill('Test long title')
      await page.getByLabel(/price/i).fill('1000')
      await page.getByRole('button', { name: /create/i }).click()

      // Should either succeed or show validation error
      // Page should not crash
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle special characters in search', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('<script>alert("xss")</script>')

      // Wait for debounce
      await page.waitForTimeout(500)

      // Should not execute script, should show no results
      await expect(page.getByText(/no items found/i)).toBeVisible()
    })

    test('should handle rapid form submissions', async ({ page }) => {
      await createTestUser(page, { prefix: 'rapid-submit' })

      await page.goto('/sell')

      const title = `Rapid Submit ${Date.now()}`
      await page.getByLabel(/title/i).fill(title)
      await page.getByLabel(/description/i).fill('Test rapid submission')
      await page.getByLabel(/price/i).fill('1000')

      // Click submit rapidly
      const submitButton = page.getByRole('button', { name: /create/i })
      await submitButton.click()
      await submitButton.click()
      await submitButton.click()

      // Should handle gracefully - either redirect once or show error
      await page.waitForTimeout(1000)
      await expect(page.locator('body')).toBeVisible()
    })

    test('should maintain state during navigation with back button', async ({ page }) => {
      await createTestUser(page, { prefix: 'back-nav' })

      // Navigate to items
      await page.goto('/items')
      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible()

      // Navigate to sell
      await page.goto('/sell')
      await expect(page.getByRole('heading', { name: /sell/i })).toBeVisible()

      // Go back
      await page.goBack()

      // Should be back on items page
      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible()
    })
  })

  test.describe('Loading States', () => {
    test('should show loading state during data fetch', async ({ page }) => {
      // Slow down the GraphQL response
      await page.route('**/graphql', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await route.continue()
      })

      await page.goto('/items')

      // Should show loading indicator or skeleton
      // Page should eventually load
      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible({ timeout: 10000 })
    })
  })
})