import { test, expect } from '@playwright/test'

/**
 * Theme Toggle E2E Tests
 * Tests the light/dark/system theme switching functionality.
 * Uses next-themes for SSR-safe theme management.
 */

test.describe('Theme Toggle', () => {
  test.describe('Theme Button', () => {
    test('should display theme toggle button', async ({ page }) => {
      await page.goto('/')

      const themeButton = page.getByRole('button', { name: /toggle theme/i })
      await expect(themeButton).toBeVisible()
    })

    test('should open dropdown menu on click', async ({ page }) => {
      await page.goto('/')

      await page.getByRole('button', { name: /toggle theme/i }).click()

      // Should show dropdown with options
      await expect(page.getByRole('menuitem', { name: /light/i })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: /dark/i })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: /system/i })).toBeVisible()
    })
  })

  test.describe('Theme Switching', () => {
    test('should switch to light mode', async ({ page }) => {
      await page.goto('/')

      // Open theme menu
      await page.getByRole('button', { name: /toggle theme/i }).click()

      // Select light mode
      await page.getByRole('menuitem', { name: /light/i }).click()

      // HTML element should not have dark class
      await page.waitForTimeout(100)
      const htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).not.toContain('dark')
    })

    test('should switch to dark mode', async ({ page }) => {
      await page.goto('/')

      // Open theme menu
      await page.getByRole('button', { name: /toggle theme/i }).click()

      // Select dark mode
      await page.getByRole('menuitem', { name: /dark/i }).click()

      // HTML element should have dark class
      await page.waitForTimeout(100)
      const htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toContain('dark')
    })

    test('should switch to system mode', async ({ page }) => {
      await page.goto('/')

      // First set to dark mode
      await page.getByRole('button', { name: /toggle theme/i }).click()
      await page.getByRole('menuitem', { name: /dark/i }).click()
      await page.waitForTimeout(100)

      // Now switch to system mode
      await page.getByRole('button', { name: /toggle theme/i }).click()
      await page.getByRole('menuitem', { name: /system/i }).click()

      // Should reflect system preference (test environment typically light)
      await page.waitForTimeout(100)
      // System mode should be selectable
      await page.getByRole('button', { name: /toggle theme/i }).click()
      await expect(page.getByRole('menuitem', { name: /system/i })).toBeVisible()
    })
  })

  test.describe('Theme Persistence', () => {
    test('should persist theme after page refresh', async ({ page }) => {
      await page.goto('/')

      // Set to dark mode
      await page.getByRole('button', { name: /toggle theme/i }).click()
      await page.getByRole('menuitem', { name: /dark/i }).click()
      await page.waitForTimeout(100)

      // Verify dark mode is applied
      let htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toContain('dark')

      // Refresh the page
      await page.reload()
      await page.waitForTimeout(200)

      // Dark mode should still be applied
      htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toContain('dark')
    })

    test('should persist theme across navigation', async ({ page }) => {
      await page.goto('/')

      // Set to dark mode
      await page.getByRole('button', { name: /toggle theme/i }).click()
      await page.getByRole('menuitem', { name: /dark/i }).click()
      await page.waitForTimeout(100)

      // Navigate to items page
      await page.goto('/items')
      await page.waitForTimeout(100)

      // Dark mode should still be applied
      const htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toContain('dark')
    })
  })

  test.describe('Visual Changes', () => {
    test('should apply dark background color in dark mode', async ({ page }) => {
      await page.goto('/')

      // Switch to dark mode
      await page.getByRole('button', { name: /toggle theme/i }).click()
      await page.getByRole('menuitem', { name: /dark/i }).click()
      await page.waitForTimeout(200)

      // Check that body has dark background
      const bodyBgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })

      // Dark mode should have a darker background
      // RGB values should be low (dark colors have low RGB values)
      const rgbMatch = bodyBgColor.match(/\d+/g)
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number)
        // In dark mode, background should be dark (low RGB values)
        expect(r).toBeLessThan(100)
        expect(g).toBeLessThan(100)
        expect(b).toBeLessThan(100)
      }
    })

    test('should apply light background color in light mode', async ({ page }) => {
      await page.goto('/')

      // Switch to light mode
      await page.getByRole('button', { name: /toggle theme/i }).click()
      await page.getByRole('menuitem', { name: /light/i }).click()
      await page.waitForTimeout(200)

      // Check that body has light background
      const bodyBgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })

      // Light mode should have a lighter background
      const rgbMatch = bodyBgColor.match(/\d+/g)
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number)
        // In light mode, background should be light (high RGB values)
        expect(r).toBeGreaterThan(200)
        expect(g).toBeGreaterThan(200)
        expect(b).toBeGreaterThan(200)
      }
    })
  })
})
