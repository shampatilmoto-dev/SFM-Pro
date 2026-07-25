const { test, expect } = require('../fixtures/base.fixture');
const { openShellPage } = require('./shell.shared');

test.describe('06_theme', () => {
  test('Theme switch toggles dark mode and persists across reload', async ({ page }) => {
    await openShellPage(page, 'dashboard');

    const themeButton = page.locator('.dark-mode-btn, [aria-label="Toggle theme"], [aria-label="Toggle dark mode"]').first();
    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-theme', /light/i);
    await themeButton.click();
    await expect(html).toHaveAttribute('data-theme', /dark/i);
    expect(await page.evaluate(() => localStorage.getItem('sfm-theme'))).toBe('dark');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(html).toHaveAttribute('data-theme', /dark/i);
  });
});