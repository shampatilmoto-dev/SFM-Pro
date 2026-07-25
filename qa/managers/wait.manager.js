const { DEFAULT_TIMEOUT_MS } = require("../config/timeouts");

class WaitManager {
  constructor(page) {
    this.page = page;
  }

  async waitForLoader(selector = '[data-qa="loader"], .loader, .loading, .spinner') {
    await this.page.locator(selector).first().waitFor({ state: "hidden", timeout: DEFAULT_TIMEOUT_MS }).catch(() => {});
  }

  async waitForAnimation(timeout = 250) {
    await this.page.waitForTimeout(timeout);
  }

  async waitForSpinner(selector = '[data-qa="spinner"], .spinner, .loading-indicator') {
    await this.page.locator(selector).first().waitFor({ state: "hidden", timeout: DEFAULT_TIMEOUT_MS }).catch(() => {});
  }

  async waitForNetwork(timeout = DEFAULT_TIMEOUT_MS) {
    await this.page.waitForLoadState("networkidle", { timeout }).catch(() => {});
  }

  async waitForTable(selector = "table, [role='table'], .data-table") {
    await this.page.locator(selector).first().waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT_MS });
  }

  async waitForModal(selector = '[role="dialog"], .modal, .dialog') {
    await this.page.locator(selector).first().waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT_MS });
  }

  async waitForToast(selector = '[role="status"], .toast, .notification') {
    await this.page.locator(selector).first().waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT_MS }).catch(() => {});
  }
}

module.exports = {
  WaitManager
};