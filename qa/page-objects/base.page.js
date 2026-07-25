const fs = require("fs");
const path = require("path");
const { artifactPaths } = require("../config/paths");
const { DEFAULT_TIMEOUT_MS } = require("../config/timeouts");
const { waitForNetworkIdle } = require("../utils/waits");

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(value) {
  return String(value || "screenshot")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "screenshot";
}

class BasePage {
  constructor(page) {
    this.page = page;
  }

  locator(target) {
    return typeof target === "string" ? this.page.locator(target) : target;
  }

  async open(target = "/") {
    const url = /^https?:\/\//i.test(target) ? target : target.startsWith("/") ? target : `/${target}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await waitForNetworkIdle(this.page);
    return this;
  }

  async reload() {
    await this.page.reload({ waitUntil: "domcontentloaded" });
    await waitForNetworkIdle(this.page);
    return this;
  }

  async refresh() {
    return this.reload();
  }

  async goBack() {
    await this.page.goBack({ waitUntil: "domcontentloaded" });
    await waitForNetworkIdle(this.page);
  }

  async goForward() {
    await this.page.goForward({ waitUntil: "domcontentloaded" });
    await waitForNetworkIdle(this.page);
  }

  async waitForLoad(state = "load") {
    await this.page.waitForLoadState(state, { timeout: DEFAULT_TIMEOUT_MS });
  }

  async waitForNetworkIdle(timeout = DEFAULT_TIMEOUT_MS) {
    await waitForNetworkIdle(this.page, timeout);
  }

  async waitForVisible(target, timeout = DEFAULT_TIMEOUT_MS) {
    await this.locator(target).first().waitFor({ state: "visible", timeout });
  }

  async waitForHidden(target, timeout = DEFAULT_TIMEOUT_MS) {
    await this.locator(target).first().waitFor({ state: "hidden", timeout });
  }

  async click(target, options = {}) {
    await this.locator(target).click(options);
  }

  async doubleClick(target, options = {}) {
    await this.locator(target).dblclick(options);
  }

  async rightClick(target, options = {}) {
    await this.locator(target).click({ button: "right", ...options });
  }

  async hover(target, options = {}) {
    await this.locator(target).hover(options);
  }

  async fill(target, value, options = {}) {
    await this.locator(target).fill(String(value ?? ""), options);
  }

  async clear(target, options = {}) {
    await this.fill(target, "", options);
  }

  async select(target, value, options = {}) {
    await this.locator(target).selectOption(value, options);
  }

  async check(target, options = {}) {
    await this.locator(target).check(options);
  }

  async uncheck(target, options = {}) {
    await this.locator(target).uncheck(options);
  }

  async press(target, key, options = {}) {
    await this.locator(target).press(key, options);
  }

  async scrollIntoView(target) {
    await this.locator(target).scrollIntoViewIfNeeded();
  }

  async scrollTop() {
    await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  }

  async scrollBottom() {
    await this.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  }

  async takeScreenshot(label = "page", options = {}) {
    ensureDirectory(artifactPaths.screenshots);
    const filePath = path.join(artifactPaths.screenshots, `${safeName(label)}.png`);
    await this.page.screenshot({ path: filePath, fullPage: true, ...options });
    return filePath;
  }

  async getText(target) {
    return this.locator(target).first().textContent();
  }

  async getValue(target) {
    return this.locator(target).first().inputValue();
  }

  async isVisible(target) {
    return this.locator(target).first().isVisible();
  }

  async isHidden(target) {
    return this.locator(target).first().isHidden();
  }

  async exists(target) {
    return (await this.locator(target).count()) > 0;
  }
}

module.exports = {
  BasePage
};