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

        await expect(page.url()).toContain('/item/')
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
      const price = '1999' // $19.99

      await page.getByLabel(/title/i).fill(title)
      await page.getByLabel(/description/i).fill(description)
      await page.getByLabel(/price/i).fill(price)

      await page.getByRole('button', { name: /create/i }).click()

      // Should redirect to item page
      await expect(page.url()).toContain('/item/')
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
      await page.getByLabel(/price/i).fill('999')
      await page.getByRole('button', { name: /create/i }).click()

      // Should be on item detail page
      await expect(page.url()).toContain('/item/')

      // Go to items page and find the edit button
      await page.goto('/items')

      // Find the item card and click edit
      const itemCard = page.locator(`text=${originalTitle}`).locator('..').locator('..')
      await itemCard.getByRole('link', { name: /edit/i }).click()

      // Should be on update page
      await expect(page.url()).toContain('/update/')

      // Update the title
      const updatedTitle = `Updated ${originalTitle}`
      await page.getByLabel(/title/i).clear()
      await page.getByLabel(/title/i).fill(updatedTitle)
      await page.getByRole('button', { name: /update/i }).click()

      // Should redirect to item page with updated title
      await expect(page.url()).toContain('/item/')
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
      await page.getByLabel(/price/i).fill('500')
      await page.getByRole('button', { name: /create/i }).click()

      await expect(page.url()).toContain('/item/')

      // Go to items page
      await page.goto('/items')

      // Find the item and delete it
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..')

      // Handle the confirmation dialog
      page.on('dialog', (dialog) => dialog.accept())

      await itemCard.getByRole('button', { name: /delete/i }).click()

      // Item should no longer be visible
      await expect(page.locator(`text=${title}`)).not.toBeVisible()
    })
  })
})
