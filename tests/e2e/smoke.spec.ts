import { test, expect } from '@playwright/test';

test('home and wizard render', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Canadian Tax Prep Organizer')).toBeVisible();
  await page.getByRole('link', { name: 'Start wizard' }).click();
  await expect(page.getByRole('heading', { name: 'Tax Prep Wizard' })).toBeVisible();
});
