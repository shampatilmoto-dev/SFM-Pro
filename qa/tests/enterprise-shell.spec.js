const { test, expect } = require('../fixtures/base.fixture');
const { applicationPages } = require('../config/pages');
const { goToPage } = require('../utils/navigation');
const { expectHeaderShell, expectAccessibleButton } = require('../utils/assertions');

test.describe('Enterprise shell', () => {
  for (const applicationPage of applicationPages) {
    test(`renders ${applicationPage.name}`, async ({ page }) => {
      await goToPage(page, applicationPage.name);
      await expectHeaderShell(page);
      await expect(page.locator('main, [role="main"], .main-content')).toBeVisible();
    });
  }

  test('exposes core header actions', async ({ page }) => {
    await goToPage(page, applicationPages[0].name);
    await expectAccessibleButton(page, 'notification');
    await expectAccessibleButton(page, 'theme');
    await expectAccessibleButton(page, 'profile');
  });
});
