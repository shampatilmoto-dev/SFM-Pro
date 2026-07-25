const { test, expect } = require('../fixtures/base.fixture');
const { shellPages, openShellPage, verifyCommonShell, verifyOptionalFooter, verifyVisibleHero } = require('./shell.shared');

test.describe('02_application-shell', () => {
  for (const shellPage of shellPages.filter((entry) => entry.shellType === 'enterprise')) {
    test(`Application shell loads on ${shellPage.label}`, async ({ page, consoleManager, assertionManager }) => {
      await openShellPage(page, shellPage.key);
      await verifyCommonShell(page);
      await verifyVisibleHero(page, shellPage.hero);
      await verifyOptionalFooter(page);
      await assertionManager.verifyNoConsoleErrors(consoleManager);
      await expect(consoleManager.getJavaScriptExceptions()).toHaveLength(0);
    });
  }
});