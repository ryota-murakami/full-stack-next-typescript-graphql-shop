import { test, expect } from '@playwright/test'

/**
 * Password Reset E2E Tests
 * Tests request password reset and reset password flows.
 * Note: Actual email delivery is not tested - only the UI flow.
 */

test.describe('Password Reset', () => {
  test.describe('Request Reset Form', () => {
    test('should display request reset form on signin page', async ({ page }) => {
      await page.goto('/signin')

      await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible()
      await expect(page.getByLabel(/email/i).nth(1)).toBeVisible() // Second email field is for reset
      await expect(page.getByRole('button', { name: /request reset/i })).toBeVisible()
    })

    test('should submit reset request with valid email', async ({ page }) => {
      await page.goto('/signin')

      // Fill in the reset email field (second email input on the page)
      const resetEmailInput = page.locator('#reset-email')
      await resetEmailInput.fill('user@example.com')

      // Mock the GraphQL response for successful request
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('requestReset')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                requestReset: {
                  message: 'Success! Check your email for a reset link',
                },
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.getByRole('button', { name: /request reset/i }).click()

      // Should show success message
      await expect(page.getByText(/check your email/i)).toBeVisible()
    })

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/signin')

      const resetEmailInput = page.locator('#reset-email')
      await resetEmailInput.fill('invalid-email')

      // Try to submit - browser validation should prevent
      await page.getByRole('button', { name: /request reset/i }).click()

      // Form should not be submitted due to HTML5 validation
      // The input should still be visible (form didn't submit)
      await expect(resetEmailInput).toBeVisible()
    })
  })

  test.describe('Reset Password Page', () => {
    test('should show error for missing token', async ({ page }) => {
      await page.goto('/reset')

      await expect(page.getByRole('heading', { name: /invalid reset link/i })).toBeVisible()
      await expect(page.getByText(/invalid or has expired/i)).toBeVisible()
    })

    test('should show reset form with valid token', async ({ page }) => {
      await page.goto('/reset?resetToken=valid-test-token')

      await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible()
      await expect(page.getByLabel(/new password/i)).toBeVisible()
      await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    })

    test('should validate password minimum length', async ({ page }) => {
      await page.goto('/reset?resetToken=test-token')

      const newPasswordInput = page.getByLabel(/new password/i)
      const confirmPasswordInput = page.getByLabel(/confirm password/i)

      await newPasswordInput.fill('short')
      await confirmPasswordInput.fill('short')

      await page.getByRole('button', { name: /reset password/i }).click()

      // Should show validation error
      await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
    })

    test('should validate passwords match', async ({ page }) => {
      await page.goto('/reset?resetToken=test-token')

      const newPasswordInput = page.getByLabel(/new password/i)
      const confirmPasswordInput = page.getByLabel(/confirm password/i)

      await newPasswordInput.fill('password123')
      await confirmPasswordInput.fill('different456')

      await page.getByRole('button', { name: /reset password/i }).click()

      // Should show validation error
      await expect(page.getByText(/passwords do not match/i)).toBeVisible()
    })

    test('should show error for invalid token', async ({ page }) => {
      await page.goto('/reset?resetToken=invalid-token')

      // Mock the GraphQL response for invalid token
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('resetPassword')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [
                {
                  message: 'This token is either invalid or expired!',
                },
              ],
            }),
          })
        } else {
          await route.continue()
        }
      })

      const newPasswordInput = page.getByLabel(/new password/i)
      const confirmPasswordInput = page.getByLabel(/confirm password/i)

      await newPasswordInput.fill('newpassword123')
      await confirmPasswordInput.fill('newpassword123')

      await page.getByRole('button', { name: /reset password/i }).click()

      // Should show error message
      await expect(page.getByText(/invalid or expired/i)).toBeVisible()
    })

    test('should redirect on successful reset', async ({ page }) => {
      await page.goto('/reset?resetToken=valid-token')

      // Mock successful reset
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('resetPassword')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                resetPassword: {
                  id: 'user-id',
                  email: 'user@example.com',
                  name: 'Test User',
                },
              },
            }),
          })
        } else if (postData?.includes('currentUser')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                me: {
                  id: 'user-id',
                  email: 'user@example.com',
                  name: 'Test User',
                  permissions: ['USER'],
                  cart: [],
                },
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      const newPasswordInput = page.getByLabel(/new password/i)
      const confirmPasswordInput = page.getByLabel(/confirm password/i)

      await newPasswordInput.fill('newpassword123')
      await confirmPasswordInput.fill('newpassword123')

      await page.getByRole('button', { name: /reset password/i }).click()

      // Should redirect to homepage
      await expect(page).toHaveURL('/')
    })
  })
})
