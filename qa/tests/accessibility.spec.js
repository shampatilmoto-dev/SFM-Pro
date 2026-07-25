const { test, expect } = require('../fixtures/base.fixture');
const { applicationPages } = require('../config/pages');
const { goToPage } = require('../utils/navigation');

test.describe('Accessibility smoke checks', () => {
  test('pages expose key landmarks and interactive controls', async ({ page }) => {
    await goToPage(page, applicationPages[0].name);

    await expect(page.locator('header, [data-qa="app-header"]')).toBeVisible();
    await expect(page.locator('main, [role="main"], .main-content')).toBeVisible();
    await expect(page.getByRole('button').first()).toBeVisible();
  });
});
