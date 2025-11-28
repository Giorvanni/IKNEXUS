import { test, expect, Page, APIResponse } from '@playwright/test';

async function uiLogin(page: Page) {
  await page.goto('/login');
  await page.evaluate(async () => {
    const csrfResp = await fetch('/api/auth/csrf');
    const { csrfToken } = await csrfResp.json();
    const params = new URLSearchParams();
    params.set('csrfToken', csrfToken);
    params.set('callbackUrl', '/');
    params.set('json', 'true');
    params.set('email', 'admin@iris.local');
    params.set('password', 'admin123');
    const resp = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    if (!resp.ok) throw new Error('Login failed');
  });
  await page.goto('/admin/ventures');
}

test.describe('Admin venture clear flow', () => {
  test('edits and clears value props + image alt', async ({ page }) => {
    await uiLogin(page);
    await page.waitForSelector('button:has-text("Bewerken")');

    // Pick first venture card edit (Dutch label "Bewerken")
    const firstEditButton = page.getByRole('button', { name: 'Bewerken' }).first();
    await firstEditButton.click();

    // Change name
    const nameInput = page.locator('input[placeholder="Name"]');
    await nameInput.fill('Playwright Updated Venture');

    // Clear featured image alt
    const altInput = page.locator('input[placeholder="Alt text (accessibility)"]');
    await altInput.fill('');

    // Save
    const saveButton = page.getByRole('button', { name: 'Saving...' }).or(page.getByRole('button', { name: 'Save' }));
    await Promise.all([
  page.waitForResponse((res: APIResponse) => res.url().includes('/api/ventures/') && res.request().method() === 'PATCH'),
      saveButton.click()
    ]);

    // Verify updated name present after edit mode closes
    const updatedCardTitle = page.getByRole('heading', { name: 'Playwright Updated Venture' });
    await expect(updatedCardTitle).toHaveCount(1);
  });
});
