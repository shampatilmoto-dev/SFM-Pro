const { test, expect } = require('../fixtures/base.fixture');
const { openFirstApplicationPage } = require('../utils/navigation');
const { expectHeaderShell } = require('../utils/assertions');

test.describe('Enterprise smoke coverage', () => {
  test('loads the application shell', async ({ page }) => {
    await openFirstApplicationPage(page);
    await expectHeaderShell(page);
    await expect(page.locator('body')).toBeVisible();
  });
});
