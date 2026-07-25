const { test, expect } = require('../fixtures/base.fixture');
const { shellPages, openShellPage } = require('./shell.shared');

test.describe('05_navigation', () => {
  for (const shellPage of shellPages.filter((entry) => entry.key !== 'login')) {
    test(`Navigates to ${shellPage.label} with the correct URL and shell title`, async ({ page }) => {
      await openShellPage(page, shellPage.key);

      await expect(page).toHaveURL(new RegExp(shellPage.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      await expect(page).toHaveTitle(shellPage.title);
      await expect(page.locator(shellPage.hero).first()).toBeVisible();

      if (shellPage.shellType === 'enterprise') {
        await expect(page.locator('.sidebar-menu a.active, .sidebar-menu a[aria-current="page"]').first()).toContainText(shellPage.label);
      } else {
        await expect(page.locator('h1').first()).toBeVisible();
      }
    });
  }
});