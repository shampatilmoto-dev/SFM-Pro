const { test, expect } = require('../fixtures/base.fixture');
const { openShellPage, verifyNoHorizontalOverflow } = require('./shell.shared');

test.describe('03_sidebar', () => {
  test('Sidebar shows navigation, active state, and toggle behavior', async ({ page }) => {
    await openShellPage(page, 'dashboard');

    const sidebar = page.locator('.sidebar').first();
    const menuButton = page.locator('.menu-btn').first();
    const navItems = page.locator('.sidebar-menu a');
    const activeLink = page.locator('.sidebar-menu a.active, .sidebar-menu a[aria-current="page"]').first();

    await expect(page.locator('.logo, .sidebar-brand').first()).toBeVisible();
    await expect(navItems.first()).toBeVisible();
    await expect(await navItems.count()).toBeGreaterThanOrEqual(8);
    await expect(page.locator('.sidebar-menu i').first()).toBeVisible();
    await expect(activeLink).toContainText(/Dashboard/i);

    await menuButton.click();
    await expect(sidebar).toHaveClass(/open/);
    await menuButton.click();
    await expect(sidebar).not.toHaveClass(/open/);

    const scrollable = await sidebar.evaluate((el) => el.scrollHeight >= el.clientHeight);
    expect(scrollable).toBeTruthy();
    await verifyNoHorizontalOverflow(page);
  });
});