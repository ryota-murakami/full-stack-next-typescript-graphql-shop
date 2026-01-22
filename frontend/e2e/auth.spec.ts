import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * Tests signup, signin, signout, and password reset flows.
 */

test.describe('Authentication', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'testpassword123',
  }

  test.describe('Signup Flow', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup')

      await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/name/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('should create a new account', async ({ page }) => {
      await page.goto('/signup')

      await page.getByLabel(/email/i).fill(testUser.email)
      await page.getByLabel(/name/i).fill(testUser.name)
      await page.getByLabel(/password/i).fill(testUser.password)

      await page.getByRole('button', { name: /sign up/i }).click()

      // Should redirect to home page after signup
      await expect(page).toHaveURL('/')
    })

    test('should show error for duplicate email', async ({ page }) => {
      // First create a user
      await page.goto('/signup')
      const email = `duplicate-${Date.now()}@example.com`

      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Duplicate User')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()

      await expect(page).toHaveURL('/')

      // Sign out first
      await page.getByRole('button', { name: /sign out/i }).click()

      // Try to create same user again
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Another User')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()

      // Should show error message
      await expect(page.getByText(/already exists/i)).toBeVisible()
    })
  })

  test.describe('Signin Flow', () => {
    test('should display signin form', async ({ page }) => {
      await page.goto('/signin')

      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('should sign in with valid credentials', async ({ page }) => {
      // First create a user
      const email = `signin-${Date.now()}@example.com`
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Signin Test')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()
      await expect(page).toHaveURL('/')

      // Sign out
      await page.getByRole('button', { name: /sign out/i }).click()

      // Now sign in
      await page.goto('/signin')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page).toHaveURL('/')
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/signin')

      await page.getByLabel(/email/i).fill('nonexistent@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText(/invalid/i)).toBeVisible()
    })
  })

  test.describe('Signout Flow', () => {
    test('should sign out successfully', async ({ page }) => {
      // Sign up first
      const email = `signout-${Date.now()}@example.com`
      await page.goto('/signup')
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/name/i).fill('Signout Test')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign up/i }).click()
      await expect(page).toHaveURL('/')

      // Verify signed in (should see signout button)
      await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()

      // Sign out
      await page.getByRole('button', { name: /sign out/i }).click()

      // Should see sign in button after signout
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })
  })
})
