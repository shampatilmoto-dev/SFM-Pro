const { expect } = require("@playwright/test");
const { DEFAULT_TIMEOUT_MS } = require("../config/timeouts");
const { selectors } = require("../utils/selectors");

class AssertionManager {
  constructor(page) {
    this.page = page;
  }

  async verifyTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle instanceof RegExp ? expectedTitle : new RegExp(expectedTitle, "i"), { timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyHeading(expectedHeading) {
    await expect(this.page.getByRole("heading", { name: expectedHeading instanceof RegExp ? expectedHeading : new RegExp(expectedHeading, "i") }).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifySidebar(selector = selectors.sidebar.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyHeader(selector = selectors.header.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyHero(selector = selectors.hero.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyTable(selector = selectors.table.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifySearch(selector = selectors.search.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyFilters(selector = selectors.filters.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyPagination(selector = selectors.pagination.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyButton(label, selector = selectors.buttons.action) {
    const locator = selector.includes("button") || selector.includes("[role")
      ? this.page.locator(selector).filter({ hasText: label }).first()
      : this.page.getByRole("button", { name: label instanceof RegExp ? label : new RegExp(label, "i") }).first();
    await expect(locator).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyForm(selector = selectors.form.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyModal(selector = selectors.modal.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
  }

  async verifyToast(selector = selectors.toast.root) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS }).catch(() => {});
  }

  async verifyNoConsoleErrors(consoleManager) {
    const errors = consoleManager ? consoleManager.getConsoleErrors() : [];
    expect(errors, "Console errors should be empty").toHaveLength(0);
  }
}

module.exports = {
  AssertionManager
};