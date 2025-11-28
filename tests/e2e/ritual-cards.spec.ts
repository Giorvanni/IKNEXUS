import { test, expect } from '@playwright/test';

test.describe('Ritual cards tonen alleen duur', () => {
  test('eerste kaarten tonen minuten maar geen prijs', async ({ page }) => {
    await page.goto('/rituelen');
    const cards = page.locator('article.card');
    await expect(cards.first()).toBeVisible();
    // Look for text like "min"
    const minutesText = cards.locator(':scope >> text=/\\bmin\\b/');
    await expect(minutesText.first()).toBeVisible();
    // Ensure euro teken niet zichtbaar zolang prijzen verborgen blijven
    await expect(cards.first().locator(':scope >> text=€')).toHaveCount(0);
  });
});
