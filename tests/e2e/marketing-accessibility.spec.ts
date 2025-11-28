import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const PAGES = [
  { slug: '/', name: 'home' },
  { slug: '/over-iris', name: 'about' },
  { slug: '/rituelen', name: 'rituelen' }
];

const VIEWPORTS = [
  { label: 'mobile', width: 390, height: 844 },
  { label: 'desktop', width: 1280, height: 720 }
];

const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results', 'screenshots');
let screenshotDirReady = false;

async function ensureScreenshotDir() {
  if (screenshotDirReady) return;
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  screenshotDirReady = true;
}

test.describe('Marketing pages accessibility', () => {
  for (const pageDef of PAGES) {
    for (const viewport of VIEWPORTS) {
      test(`${pageDef.name} (${viewport.label}) passes axe (serious+) and captures responsive screenshot`, async ({ page }, testInfo) => {
        await ensureScreenshotDir();
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(pageDef.slug, { waitUntil: 'networkidle' });
        await page.waitForTimeout(250);

        const screenshotBuffer = await page.screenshot({ fullPage: true });
        const screenshotName = `${pageDef.name}-${viewport.label}.png`;
        const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
        await writeFile(screenshotPath, screenshotBuffer);
        await testInfo.attach(`screenshot-${pageDef.name}-${viewport.label}`, {
          body: screenshotBuffer,
          contentType: 'image/png'
        });

        const axeResults = await new AxeBuilder({ page }).analyze();
        const seriousOrCritical = axeResults.violations.filter((violation) => {
          return violation.impact === 'serious' || violation.impact === 'critical';
        });
        if (seriousOrCritical.length > 0) {
          await testInfo.attach(`axe-${pageDef.name}-${viewport.label}`, {
            body: JSON.stringify(seriousOrCritical, null, 2),
            contentType: 'application/json'
          });
        }
        expect(seriousOrCritical, 'Axe should not report serious or critical issues').toHaveLength(0);
      });
    }
  }
});
