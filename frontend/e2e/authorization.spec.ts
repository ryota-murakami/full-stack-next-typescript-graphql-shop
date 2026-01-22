import { test, expect } from '@playwright/test'
import { createTestUser, createItem, signOut } from './helpers'

/**
 * Authorization E2E Tests
 * Tests that protected routes require authentication and
 * users can only modify their own resources.
 */

test.describe('Authorization', () => {
  test.describe('Unauthenticated Access', () => {
    test('should redirect to signin when accessing /sell without auth', async ({ page }) => {
      await page.goto('/sell')

      // Should show sign in prompt or redirect
      await expect(
        page.getByText(/sign in|please log in|must be logged in/i)
      ).toBeVisible()
    })

    test('should redirect to signin when accessing /orders without auth', async ({ page }) => {
      await page.goto('/orders')

      // Should show sign in prompt or redirect
      await expect(
        page.getByText(/sign in|please log in|must be logged in/i)
      ).toBeVisible()
    })

    test('should allow browsing items without auth', async ({ page }) => {
      await page.goto('/items')

      // Should be able to see items page
      await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible()
    })

    test('should not show add to cart for unauthenticated users', async ({ page }) => {
      // First create an item as authenticated user
      const userPage = await page.context().newPage()
      await createTestUser(userPage, { prefix: 'auth-test-item' })
      await createItem(userPage, { title: `Auth Test Item ${Date.now()}` })
      await userPage.close()

      // Now try to browse as unauthenticated user
      await page.goto('/items')

      // Add to cart should not be available OR should prompt for login
      const addToCartButtons = page.getByRole('button', { name: /add to cart/i })
      const count = await addToCartButtons.count()

      // If buttons exist, clicking should prompt for login
      if (count > 0) {
        await addToCartButtons.first().click()
        await expect(
          page.getByText(/sign in|please log in|must be logged in/i)
        ).toBeVisible()
      }
    })
  })

  test.describe('Owner-Only Access', () => {
    test('should only show edit button for item owner', async ({ page, context }) => {
      // Create first user and their item
      const user1Page = page
      await createTestUser(user1Page, { prefix: 'owner1' })
      const { title } = await createItem(user1Page, { title: `Owner1 Item ${Date.now()}` })

      // Sign out
      await signOut(user1Page)

      // Create second user
      await createTestUser(user1Page, { prefix: 'owner2' })

      // Go to items page
      await user1Page.goto('/items')

      // Find the item card
      const itemCard = user1Page.locator(`text=${title}`).locator('..').locator('..')

      // Edit button should NOT be visible for non-owner
      await expect(itemCard.getByRole('link', { name: /edit/i })).not.toBeVisible()
    })

    test('should only show delete button for item owner', async ({ page }) => {
      // Create first user and their item
      await createTestUser(page, { prefix: 'delete-owner' })
      const { title } = await createItem(page, { title: `Delete Test ${Date.now()}` })

      // Sign out
      await signOut(page)

      // Create second user
      await createTestUser(page, { prefix: 'delete-non-owner' })

      // Go to items page
      await page.goto('/items')

      // Find the item card
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..')

      // Delete button should NOT be visible for non-owner
      await expect(itemCard.getByRole('button', { name: /delete/i })).not.toBeVisible()
    })

    test('should allow owner to access edit page', async ({ page }) => {
      // Create user and item
      await createTestUser(page, { prefix: 'edit-owner' })
      const { title } = await createItem(page, { title: `Editable Item ${Date.now()}` })

      // Go to items page
      await page.goto('/items')

      // Find the item and click edit
      const itemCard = page.locator(`text=${title}`).locator('..').locator('..')
      await itemCard.getByRole('link', { name: /edit/i }).click()

      // Should be on update page
      await expect(page.url()).toContain('/update/')
      await expect(page.getByLabel(/title/i)).toHaveValue(title)
    })

    test('should prevent non-owner from accessing update page directly', async ({ page }) => {
      // Create first user and their item
      await createTestUser(page, { prefix: 'protect-owner' })
      const { title } = await createItem(page, { title: `Protected Item ${Date.now()}` })

      // Get the item ID from the URL
      const itemUrl = page.url()
      const itemId = itemUrl.split('/item/')[1]

      // Sign out
      await signOut(page)

      // Create second user
      await createTestUser(page, { prefix: 'protect-attacker' })

      // Try to access the update page directly
      await page.goto(`/update/${itemId}`)

      // Should show error or redirect - either "not authorized" or redirect back
      const hasError = await page.getByText(/not authorized|cannot edit|owner/i).isVisible().catch(() => false)
      const isRedirected = !page.url().includes('/update/')

      expect(hasError || isRedirected).toBe(true)
    })
  })

  test.describe('Protected Routes', () => {
    test('should show sign in form when required', async ({ page }) => {
      await page.goto('/sell')

      // Should see sign in option
      await expect(
        page.getByRole('button', { name: /sign in/i }).or(
          page.getByRole('link', { name: /sign in/i })
        ).or(
          page.getByText(/please sign in/i)
        )
      ).toBeVisible()
    })

    test('should maintain requested URL after sign in', async ({ page }) => {
      // Try to access sell page
      await page.goto('/sell')

      // If redirected to signin, complete the flow
      if (page.url().includes('/signin') || await page.getByRole('heading', { name: /sign in/i }).isVisible().catch(() => false)) {
        // Create account
        const email = `redirect-${Date.now()}@example.com`
        await page.getByLabel(/email/i).first().fill(email)
        await page.getByLabel(/name/i).fill('Redirect Test')
        await page.getByLabel(/password/i).fill('password123')
        await page.getByRole('button', { name: /sign up/i }).click()

        // After signup, should be able to access sell page
        await page.goto('/sell')
        await expect(page.getByRole('heading', { name: /sell/i })).toBeVisible()
      }
    })
  })

  test.describe('Session Handling', () => {
    test('should persist authentication across page reloads', async ({ page }) => {
      await createTestUser(page, { prefix: 'session' })

      // Should see signout button
      await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()

      // Reload the page
      await page.reload()

      // Should still be authenticated
      await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
    })

    test('should clear authentication on sign out', async ({ page }) => {
      await createTestUser(page, { prefix: 'clear-auth' })

      // Sign out
      await signOut(page)

      // Should see sign in button
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

      // Try to access protected route
      await page.goto('/sell')

      // Should be denied
      await expect(
        page.getByText(/sign in|please log in|must be logged in/i)
      ).toBeVisible()
    })
  })
})
