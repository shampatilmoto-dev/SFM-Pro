const { test, expect } = require('../fixtures/base.fixture');
const viewports = require('../data/viewports.json');
const { openShellPage, verifyNoHorizontalOverflow } = require('./shell.shared');

test.describe('09_responsive', () => {
  for (const viewport of Object.values(viewports)) {
    test(`Responsive shell renders at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openShellPage(page, 'dashboard');

      await expect(page.locator('header, .top-header').first()).toBeVisible();
      await expect(page.locator('main, .main-content, .page-container').first()).toBeVisible();
      await expect(page.locator('.sidebar, .expense-sidebar').first()).toBeVisible();

      const menuButton = page.locator('.menu-btn').first();
      if (await menuButton.count()) {
        await expect(menuButton).toBeVisible();
      }

      await verifyNoHorizontalOverflow(page);
    });
  }
});