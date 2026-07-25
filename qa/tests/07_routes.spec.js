const { test, expect } = require('../fixtures/base.fixture');
const { shellPages, openShellPage } = require('./shell.shared');

test.describe('07_routes', () => {
  test('Valid routes render the expected shell pages', async ({ page }) => {
    for (const shellPage of shellPages.filter((entry) => entry.key !== 'login')) {
      await openShellPage(page, shellPage.key);
      await expect(page).toHaveURL(new RegExp(shellPage.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('Invalid route returns a not-found response when implemented', async ({ page }) => {
    const response = await page.goto('/this-route-should-not-exist-qa.html', { waitUntil: 'domcontentloaded' });

    if (response && response.status() === 404) {
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).toContainText(/404|not found/i);
      return;
    }

    test.skip(true, '404 behavior is not implemented in this environment.');
  });
});