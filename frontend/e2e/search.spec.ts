import { test, expect } from '@playwright/test'
import { createTestUser, createItem } from './helpers'

/**
 * Search E2E Tests
 * Tests the real-time search functionality with debounce and dropdown results.
 */

test.describe('Search', () => {
  test.describe('Search Input', () => {
    test('should display search input in header', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.getByPlaceholder(/search items/i)
      await expect(searchInput).toBeVisible()
    })

    test('should not show dropdown for single character', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('a')

      // Dropdown should not appear
      await page.waitForTimeout(500)
      await expect(page.locator('[class*="popover"]').locator('text=No items')).not.toBeVisible()
    })

    test('should trigger search after typing 2+ characters', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('te')

      // Wait for debounce and response
      await page.waitForTimeout(400)

      // Dropdown should appear (either with results or "no items" message)
      const dropdown = page.locator('.rounded-md.border.bg-popover')
      await expect(dropdown).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Search Results', () => {
    test('should display matching items in dropdown', async ({ page }) => {
      // Create a user and item
      await createTestUser(page, { prefix: 'search' })
      const { title } = await createItem(page, { title: `Searchable Widget ${Date.now()}` })

      await page.goto('/')

      // Search for the item
      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('Searchable Widget')

      // Wait for debounce
      await page.waitForTimeout(500)

      // Should show the item in results
      await expect(page.locator('.rounded-md.border.bg-popover')).toBeVisible()
      await expect(page.getByText(title)).toBeVisible()
    })

    test('should show no results message when no matches', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('xyznonexistentitem123')

      // Wait for debounce and response
      await page.waitForTimeout(500)

      // Should show "no items found" message
      await expect(page.getByText(/no items found/i)).toBeVisible()
    })

    test('should navigate to item on result click', async ({ page }) => {
      // Create a user and item
      await createTestUser(page, { prefix: 'search-nav' })
      const { title } = await createItem(page, { title: `Clickable Item ${Date.now()}` })

      await page.goto('/')

      // Search for the item
      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('Clickable Item')

      // Wait for results
      await page.waitForTimeout(500)

      // Click on the result
      await page.getByText(title).click()

      // Should navigate to item detail page
      await expect(page.url()).toContain('/item/')
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
    })

    test('should clear search on navigation', async ({ page }) => {
      // Create a user and item
      await createTestUser(page, { prefix: 'search-clear' })
      const { title } = await createItem(page, { title: `Clear Test Item ${Date.now()}` })

      await page.goto('/')

      // Search for the item
      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('Clear Test Item')

      // Wait for results and click
      await page.waitForTimeout(500)
      await page.getByText(title).click()

      // Wait for navigation
      await expect(page.url()).toContain('/item/')

      // Search input should be cleared
      await expect(searchInput).toHaveValue('')
    })
  })

  test.describe('Debounce Behavior', () => {
    test('should debounce search requests', async ({ page }) => {
      await page.goto('/')

      let requestCount = 0
      page.on('request', (request) => {
        if (request.url().includes('/graphql') && request.postData()?.includes('SearchItems')) {
          requestCount++
        }
      })

      const searchInput = page.getByPlaceholder(/search items/i)

      // Type quickly
      await searchInput.fill('t')
      await page.waitForTimeout(100)
      await searchInput.fill('te')
      await page.waitForTimeout(100)
      await searchInput.fill('tes')
      await page.waitForTimeout(100)
      await searchInput.fill('test')

      // Wait for debounce to complete
      await page.waitForTimeout(500)

      // Should only have made 1-2 requests, not 4
      expect(requestCount).toBeLessThanOrEqual(2)
    })
  })

  test.describe('Loading State', () => {
    test('should show loading indicator while searching', async ({ page }) => {
      await page.goto('/')

      // Slow down the network to see loading state
      await page.route('**/graphql', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        await route.continue()
      })

      const searchInput = page.getByPlaceholder(/search items/i)
      await searchInput.fill('test')

      // Loading spinner should appear
      await expect(page.locator('svg.animate-spin')).toBeVisible()
    })
  })
})
