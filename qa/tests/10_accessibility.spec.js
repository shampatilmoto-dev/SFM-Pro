const { test, expect } = require('../fixtures/base.fixture');
const { shellPages, openShellPage } = require('./shell.shared');

test.describe('10_accessibility', () => {
  for (const shellPage of shellPages) {
    test(`Accessibility basics are present on ${shellPage.label}`, async ({ page }) => {
      await openShellPage(page, shellPage.key);

      await expect(page).toHaveTitle(/SFM PRO Enterprise/i);
      await expect(page.locator('h1, h2, h3').first()).toBeVisible();
      await expect(page.locator('button').first()).toBeVisible();
      await expect(page.locator('form, input, select, textarea').first()).toBeVisible();
      await expect(page.locator('[aria-label], [aria-labelledby], [role]').first()).toBeVisible();

      const imageCount = await page.locator('img').count();
      if (imageCount > 0) {
        await expect(page.locator('img[alt]').first()).toBeVisible();
      }
    });
  }
});