const { test, expect } = require('../fixtures/base.fixture');

const loginLogo = 'img[alt*="logo" i], .brand-mark__logo';
const usernameInput = '#username, input[autocomplete="username"]';
const passwordInput = '#password, input[autocomplete="current-password"]';
const loginButton = '.login-button, button:has-text("SIGN IN"), button:has-text("Login")';
const forgotPassword = '.text-link, button:has-text("Forgot Password?"), text=Forgot Password?';

test.describe('01_login-shell', () => {
  test('Login page loads with the expected auth shell', async ({ loginPage, page, consoleManager, assertionManager }) => {
    await loginPage.openPage();

    await assertionManager.verifyTitle(/Secure Login/i);
    await expect(page.locator(loginLogo).first()).toBeVisible();
    await expect(page.locator(usernameInput).first()).toBeVisible();
    await expect(page.locator(passwordInput).first()).toBeVisible();
    await expect(page.locator(loginButton).first()).toBeVisible();

    if (await page.locator(forgotPassword).count()) {
      await expect(page.locator(forgotPassword).first()).toBeVisible();
    }

    await expect(consoleManager.getConsoleErrors()).toHaveLength(0);
    await expect(consoleManager.getJavaScriptExceptions()).toHaveLength(0);
  });
});