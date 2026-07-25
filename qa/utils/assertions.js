const { expect } = require('@playwright/test');
const { DEFAULT_TIMEOUT_MS } = require('../config/timeouts');

async function expectHeaderShell(page) {
  await expect(page.locator('header, [data-qa="app-header"]')).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  await expect(page.locator('main, [role="main"], .main-content')).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
}

async function expectCardGrid(page, cardSelector, minimum = 1) {
  const cards = page.locator(cardSelector);
  const count = await cards.count();
  await expect(count).toBeGreaterThanOrEqual(minimum);
  if (count > 0) {
    await expect(cards.first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }
}

async function expectTableHeaders(page, tableSelector, expectedHeaders) {
  const table = page.locator(tableSelector).first();
  await expect(table).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  for (const header of expectedHeaders) {
    await expect(page.getByRole('columnheader', { name: new RegExp(header, 'i') }).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }
}

async function expectAccessibleButton(page, name) {
  await expect(page.getByRole('button', { name: new RegExp(name, 'i') }).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
}

module.exports = {
  expectHeaderShell,
  expectCardGrid,
  expectTableHeaders,
  expectAccessibleButton
};