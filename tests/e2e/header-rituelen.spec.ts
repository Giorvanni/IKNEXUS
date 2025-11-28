import { test, expect } from '@playwright/test';

test.describe('Header Rituelen CTA', () => {
  test('Ontdek Rituelen navigates to /rituelen', async ({ page }) => {
    await page.goto('/');
    const ontdekHeader = page.locator('header').getByRole('link', { name: 'Ontdek Rituelen' }).first();
    await expect(ontdekHeader).toBeVisible();
    await ontdekHeader.click();
    await expect(page).toHaveURL(/\/rituelen$/);
  });
});
