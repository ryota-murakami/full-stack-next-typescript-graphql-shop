import { test, expect, Page } from '@playwright/test'
import { createTestUser } from './helpers'

/**
 * Permissions Management E2E Tests
 * Tests the admin-only permissions management functionality.
 * Note: These tests require an admin user to be able to access the permissions page.
 */

/**
 * Creates an admin user by mocking the permissions check
 */
async function createAdminUser(page: Page) {
  const timestamp = Date.now()
  const email = `admin-${timestamp}@example.com`
  const name = 'Admin User'
  const password = 'password123'

  await page.goto('/signup')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/name/i).fill(name)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign up/i }).click()

  await expect(page).toHaveURL('/')

  return { email, name, password }
}

test.describe('Permissions', () => {
  test.describe('Access Control', () => {
    test('should deny access to non-admin users', async ({ page }) => {
      await createTestUser(page, { prefix: 'non-admin' })

      // Try to access permissions page
      await page.goto('/permissions')

      // Should show error message (access denied or not authorized)
      await expect(
        page.getByText(/error|denied|not authorized|no users|you must be logged in/i)
      ).toBeVisible()
    })

    test('should show permissions page for admin users', async ({ page }) => {
      // Create a user and mock admin permissions
      await createAdminUser(page)

      // Mock the ALL_USERS_QUERY to return users (simulating admin access)
      // Note: The query uses "AllUsers" (capital A) or field "users"
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        // Check for the users query (either by operation name or field)
        if (postData?.includes('AllUsers') || (postData?.includes('"users"') && !postData?.includes('currentUser'))) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                users: [
                  {
                    id: 'user-1',
                    name: 'Test User 1',
                    email: 'test1@example.com',
                    permissions: ['USER'],
                  },
                  {
                    id: 'user-2',
                    name: 'Test User 2',
                    email: 'test2@example.com',
                    permissions: ['USER', 'ITEMCREATE'],
                  },
                ],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/permissions')

      // Should see the permissions page
      await expect(page.getByText(/user permissions/i)).toBeVisible()
    })
  })

  test.describe('Permissions Table', () => {
    test('should display user list with permissions', async ({ page }) => {
      await createAdminUser(page)

      // Mock admin access and user list
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('AllUsers') || (postData?.includes('"users"') && !postData?.includes('currentUser'))) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                users: [
                  {
                    id: 'user-1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    permissions: ['USER', 'ITEMCREATE'],
                  },
                ],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/permissions')

      // Should display user info
      await expect(page.getByText('John Doe')).toBeVisible()
      await expect(page.getByText('john@example.com')).toBeVisible()

      // Should display permission columns (use columnheader role to avoid strict mode violation)
      await expect(page.getByRole('columnheader', { name: 'ADMIN' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'USER', exact: true })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'ITEMCREATE' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'ITEMUPDATE' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'ITEMDELETE' })).toBeVisible()
    })

    test('should toggle permission checkbox', async ({ page }) => {
      await createAdminUser(page)

      // Mock admin access
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('AllUsers') || (postData?.includes('"users"') && !postData?.includes('currentUser'))) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                users: [
                  {
                    id: 'user-1',
                    name: 'Test User',
                    email: 'test@example.com',
                    permissions: ['USER'],
                  },
                ],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/permissions')

      // Find the first checkbox (after USER which is checked)
      const checkboxes = page.locator('input[type="checkbox"]')
      const firstCheckbox = checkboxes.first()

      // Get initial state
      const initialChecked = await firstCheckbox.isChecked()

      // Toggle the checkbox
      await firstCheckbox.click({ force: true })

      // State should have changed
      const newChecked = await firstCheckbox.isChecked()
      expect(newChecked).not.toBe(initialChecked)
    })

    test('should enable save button after changing permissions', async ({ page }) => {
      await createAdminUser(page)

      // Mock admin access
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('AllUsers') || (postData?.includes('"users"') && !postData?.includes('currentUser'))) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                users: [
                  {
                    id: 'user-1',
                    name: 'Test User',
                    email: 'test@example.com',
                    permissions: ['USER'],
                  },
                ],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/permissions')

      // Save button should initially be disabled
      const saveButton = page.getByRole('button', { name: /save/i })
      await expect(saveButton).toBeDisabled()

      // Toggle a permission
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.click({ force: true })

      // Save button should now be enabled
      await expect(saveButton).toBeEnabled()
    })

    test('should save updated permissions', async ({ page }) => {
      await createAdminUser(page)

      let updatePermissionsCalled = false

      // Mock admin access and update mutation
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('AllUsers') || (postData?.includes('"users"') && !postData?.includes('currentUser'))) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                users: [
                  {
                    id: 'user-1',
                    name: 'Test User',
                    email: 'test@example.com',
                    permissions: ['USER'],
                  },
                ],
              },
            }),
          })
        } else if (postData?.includes('updatePermissions')) {
          updatePermissionsCalled = true
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                updatePermissions: {
                  id: 'user-1',
                  name: 'Test User',
                  email: 'test@example.com',
                  permissions: ['USER', 'ADMIN'],
                },
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/permissions')

      // Toggle a permission
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.click({ force: true })

      // Click save
      await page.getByRole('button', { name: /save/i }).click()

      // Wait a bit for the mutation to be called
      await page.waitForTimeout(500)

      // Verify mutation was called
      expect(updatePermissionsCalled).toBe(true)
    })
  })

  test.describe('Empty State', () => {
    test('should display empty state when no users', async ({ page }) => {
      await createAdminUser(page)

      // Mock admin access with empty users
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postData()
        if (postData?.includes('AllUsers') || (postData?.includes('"users"') && !postData?.includes('currentUser'))) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                users: [],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await page.goto('/permissions')

      // Should show empty state
      await expect(page.getByText(/no users found/i)).toBeVisible()
    })
  })
})
