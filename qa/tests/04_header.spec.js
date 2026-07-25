const { test, expect } = require('../fixtures/base.fixture');
const { openShellPage } = require('./shell.shared');

test.describe('04_header', () => {
  test('Header exposes the core enterprise controls', async ({ page, assertionManager }) => {
    await openShellPage(page, 'reports');

    await assertionManager.verifyHeader();
    await expect(page.locator('h1, .page-header h1, .header-copy h1').first()).toBeVisible();
    await expect(page.locator('input[type="search"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /notifications/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /toggle theme|theme/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /open profile/i }).first()).toBeVisible();
  });
});