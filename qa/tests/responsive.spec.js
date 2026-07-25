const { test, expect } = require('../fixtures/base.fixture');
const { applicationPages } = require('../config/pages');
const viewports = require('../data/viewports.json');
const { goToPage } = require('../utils/navigation');

test.describe('Responsive validation', () => {
  for (const viewport of Object.values(viewports)) {
    test(`renders ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await goToPage(page, applicationPages[0].name);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main, [role="main"], .main-content')).toBeVisible();
    });
  }
});
