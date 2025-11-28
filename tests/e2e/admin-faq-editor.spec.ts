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

test.describe('Admin FAQ editor', () => {
  test('add/edit FAQ rows and save', async ({ page }) => {
    await uiLogin(page);
    await page.waitForSelector('button:has-text("Bewerken")');

    // Open first card in edit mode (Dutch label "Bewerken")
    const editButton = page.getByRole('button', { name: 'Bewerken' }).first();
    await editButton.click();

    // Add FAQ row
    const addFaq = page.getByRole('button', { name: 'FAQ-item toevoegen' });
    await addFaq.click();

    // Fill first FAQ question/answer
    const faqQuestion = page.getByPlaceholder('Vraag').first();
    await faqQuestion.waitFor();
    const faqAnswer = page.getByPlaceholder('Antwoord').first();
    await faqAnswer.waitFor();
    await faqQuestion.fill('Is dit pijnlijk?');
    await faqAnswer.fill('Nee, het is zacht en aandachtig.');

    // Save and wait for PATCH completion
    const saveButton = page.getByRole('button', { name: 'Save' });
    await Promise.all([
      page.waitForResponse((res: APIResponse) => res.url().includes('/api/rituals/') && res.request().method() === 'PATCH'),
      saveButton.click()
    ]);
    // Fetch venture list and determine slug of first venture for verification
    const listResp = await page.request.get('/api/rituals');
    const listJson: any = await listResp.json();
    const listData = Array.isArray(listJson) ? listJson : listJson.data;
    const firstSlug = listData[0].slug;
    const ritualResp = await page.request.get(`/api/rituals/${firstSlug}`);
    const ritualJson: any = await ritualResp.json();
    const faq = ritualJson.data?.faq || ritualJson.faq;
    expect(Array.isArray(faq)).toBeTruthy();
    expect(faq[0].question).toBe('Is dit pijnlijk?');
    expect(faq[0].answer).toBe('Nee, het is zacht en aandachtig.');
  });
});
