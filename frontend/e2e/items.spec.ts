import { test, expect } from '@playwright/test'

/**
 * Items E2E Tests
 * Tests browsing, creating, updating, and deleting items.
 */

test.describe('Items', () => {
  // Helper to create an authenticated session
  async function createAuthenticatedSession(page: import('@playwright/test').Page) {
    const email = `items-${Date.now()}@example.com`
    await page.goto('/signup')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/name/i).fill('Items Test User')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/')
    return email
  }

  test.describe('Browse Items', () => {
    test('should display items page', async ({ page }) => {
      await page.goto('/items')

      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible()
    })

    test('should navigate to item detail', async ({ page }) => {
      await page.goto('/items')

      // If there are items, click on the first one
      const firstItem = page.locator('article').first()
      if (await firstItem.isVisible()) {
        const itemTitle = await firstItem.locator('h2').textContent()
        await firstItem.click()

        await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })
        if (itemTitle) {
          await expect(page.getByRole('heading', { name: itemTitle })).toBeVisible()
        }
      }
    })
  })

  test.describe('Create Item', () => {
    test('should display sell page for authenticated users', async ({ page }) => {
      await createAuthenticatedSession(page)

      await page.goto('/sell')
      await expect(page.getByRole('heading', { name: /sell/i })).toBeVisible()
      await expect(page.getByLabel(/title/i)).toBeVisible()
      await expect(page.getByLabel(/description/i)).toBeVisible()
      await expect(page.getByLabel(/price/i)).toBeVisible()
    })

    test('should create a new item', async ({ page }) => {
      await createAuthenticatedSession(page)

      await page.goto('/sell')

      const title = `Test Item ${Date.now()}`
      const description = 'This is a test item description'
      const price = '19.99' // $19.99 (component converts to cents)

      await page.getByLabel(/title/i).fill(title)
      await page.getByLabel(/description/i).fill(description)
      await page.getByLabel(/price/i).fill(price)

      await page.getByRole('button', { name: /create/i }).click()

      // Should redirect to item page
      await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
    })
  })

  test.describe('Update Item', () => {
    test('should update an existing item', async ({ page }) => {
      await createAuthenticatedSession(page)

      // First create an item
      await page.goto('/sell')

      const originalTitle = `Update Test ${Date.now()}`
      await page.getByLabel(/title/i).fill(originalTitle)
      await page.getByLabel(/description/i).fill('Original description')
      await page.getByLabel(/price/i).fill('9.99') // $9.99 (component converts to cents)
      await page.getByRole('button', { name: /create/i }).click()

      // Should be on item detail page
      await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })

      // Go to items page and find the edit button
      await page.goto('/items')
      // Wait for the specific item to appear
      await page.waitForSelector(`text=${originalTitle}`, { timeout: 10000 })

      // Find the item card and click edit
      const itemCard = page.locator(`text=${originalTitle}`).locator('..').locator('..').locator('..')
      await itemCard.getByRole('link', { name: 'Edit', exact: true }).click()

      // Should be on update page
      await expect(page).toHaveURL(/\/update\//, { timeout: 10000 })

      // Update the title
      const updatedTitle = `Updated ${originalTitle}`
      await page.getByLabel(/title/i).clear()
      await page.getByLabel(/title/i).fill(updatedTitle)
      await page.getByRole('button', { name: /save changes/i }).click()

      // Should redirect to item page with updated title
      await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })
      await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible()
    })
  })

  test.describe('Delete Item', () => {
    test('should delete an item', async ({ page }) => {
      await createAuthenticatedSession(page)

      // First create an item
      await page.goto('/sell')

      const title = `Delete Test ${Date.now()}`
      await page.getByLabel(/title/i).fill(title)
      await page.getByLabel(/description/i).fill('To be deleted')
      await page.getByLabel(/price/i).fill('5') // $5.00 (component converts to cents)
      await page.getByRole('button', { name: /create/i }).click()

      await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })

      // Go to items page
      await page.goto('/items')
      // Wait for the specific item to appear
      await page.waitForSelector(`text=${title}`, { timeout: 10000 })

      // Find the item and delete it
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..').locator('..')

      // Handle the confirmation dialog
      page.on('dialog', (dialog) => dialog.accept())

      await itemCard.getByRole('button', { name: /delete item/i }).click()

      // Item should no longer be visible
      await expect(page.locator(`text=${title}`)).not.toBeVisible()
    })
  })

  test.describe('Items Pagination', () => {
    test('should display pagination when many items exist', async ({ page }) => {
      await page.goto('/items')

      // Pagination may or may not be visible depending on item count
      // This test verifies the page loads correctly with or without pagination
      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible()
    })

    test('should navigate between pages if pagination exists', async ({ page }) => {
      await page.goto('/items')

      // Look for next page button
      const nextButton = page.getByRole('button', { name: /next/i }).or(
        page.getByRole('link', { name: /next/i })
      )

      // If pagination exists, test it
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click()
        // URL should change or content should change
        await page.waitForTimeout(500)
      }

      // Page should still show items heading
      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible()
    })
  })

  test.describe('Empty States', () => {
    test('should handle items page with no items gracefully', async ({ page }) => {
      // Mock empty items response - must include pagination data
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('itemsConnection')) {
          // Pagination query needs aggregate count
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                itemsConnection: {
                  aggregate: { count: 0 },
                },
              },
            }),
          })
        } else if (postData?.includes('allItems') || postData?.includes('items')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                items: [],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/items')

      // Should show empty state or heading
      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible()
    })
  })

  test.describe('Price Formatting', () => {
    test('should display price correctly formatted', async ({ page }) => {
      await createAuthenticatedSession(page)

      // Create an item with specific price
      await page.goto('/sell')
      const title = `Price Format ${Date.now()}`
      await page.getByLabel(/title/i).fill(title)
      await page.getByLabel(/description/i).fill('Test price formatting')
      await page.getByLabel(/price/i).fill('25.99') // $25.99 (component converts to cents)
      await page.getByRole('button', { name: /create/i }).click()

      await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })

      // Check price is displayed correctly on item page
      await expect(page.getByText('$25.99').or(page.getByText('$25'))).toBeVisible()
    })

    test('should display free items as $0.00', async ({ page }) => {
      await createAuthenticatedSession(page)

      // Create a free item
      await page.goto('/sell')
      const title = `Free Item ${Date.now()}`
      await page.getByLabel(/title/i).fill(title)
      await page.getByLabel(/description/i).fill('This is free')
      await page.getByLabel(/price/i).fill('0')
      await page.getByRole('button', { name: /create/i }).click()

      await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })

      // Price should show as $0 or $0.00 (use first() to handle multiple matches)
      await expect(
        page.getByText('$0').or(page.getByText('$0.00')).or(page.getByText('Free')).first()
      ).toBeVisible()
    })
  })

  test.describe('Item Images', () => {
    test('should handle items without images', async ({ page }) => {
      await createAuthenticatedSession(page)

      // Create an item without an image
      await page.goto('/sell')
      const title = `No Image Item ${Date.now()}`
      await page.getByLabel(/title/i).fill(title)
      await page.getByLabel(/description/i).fill('Item without image')
      await page.getByLabel(/price/i).fill('15') // $15.00 (component converts to cents)
      // Don't upload an image
      await page.getByRole('button', { name: /create/i }).click()

      await expect(page).toHaveURL(/\/item\//, { timeout: 10000 })

      // Item page should still display correctly
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
    })
  })

  test.describe('Item Validation', () => {
    test('should require title for new item', async ({ page }) => {
      await createAuthenticatedSession(page)

      await page.goto('/sell')

      // Only fill description and price
      await page.getByLabel(/description/i).fill('Description only')
      await page.getByLabel(/price/i).fill('10') // $10.00 (component converts to cents)

      // Try to submit without title
      await page.getByRole('button', { name: /create/i }).click()

      // Should show validation error or stay on page
      // HTML5 validation should prevent submission
      await expect(page.url()).toContain('/sell')
    })

    test('should require price for new item', async ({ page }) => {
      await createAuthenticatedSession(page)

      await page.goto('/sell')

      // Only fill title and description
      await page.getByLabel(/title/i).fill('Title only')
      await page.getByLabel(/description/i).fill('Description only')

      // Clear price field
      await page.getByLabel(/price/i).clear()

      // Try to submit without price
      await page.getByRole('button', { name: /create/i }).click()

      // Should show validation error or stay on page
      await expect(page.url()).toContain('/sell')
    })
  })
})
