import { test, expect } from '@playwright/test'

test('page loads and has correct title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('SeedHeart')
})

test('root element renders', async ({ page }) => {
  await page.goto('/')
  const root = page.locator('#root')
  await expect(root).toBeVisible()
})
