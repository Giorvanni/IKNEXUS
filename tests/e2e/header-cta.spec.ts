import { test, expect } from '@playwright/test';

test.describe('Header CTAs', () => {
  test('Boek nu navigates to contact', async ({ page }) => {
    await page.goto('/');
    const boekNu = page.getByRole('link', { name: 'Boek nu' });
    await expect(boekNu).toBeVisible();
    await boekNu.click();
    await expect(page).toHaveURL(/\/contact$/);
  });
});
