const { test, expect } = require('@playwright/test')

test('home route navigates into the APOD experience through the live backend', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /home & beyond/i })).toBeVisible()
  await page.getByRole('link', { name: /astronomy picture of the day/i }).click()

  await expect(page).toHaveURL(/\/wonders-of-the-universe\/apod$/)
  await expect(page.getByRole('heading', { name: /Mock APOD/i })).toBeVisible()
  await expect(page.getByText('Browse recent discoveries')).toBeVisible()
})

test('asteroid watch loads through the live backend and opens a generated radar brief', async ({
  page,
}) => {
  await page.goto('/asteroid-watch')

  await expect(page.getByRole('heading', { name: 'Asteroid Watch' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Mock Alpha', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Radar Brief' }).click()

  await expect(page.getByRole('heading', { name: 'Radar Brief', exact: true })).toBeVisible()
  await expect(page.getByText('System')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Radar brief for /i })).toBeVisible()
  await expect(page.getByText(/Illustrative scenario only/i)).toBeVisible()
})
