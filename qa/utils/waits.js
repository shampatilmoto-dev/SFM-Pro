const { DEFAULT_TIMEOUT_MS } = require('../config/timeouts');

async function waitForNetworkIdle(page, timeout = DEFAULT_TIMEOUT_MS) {
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
}

async function waitForElement(page, selector, timeout = DEFAULT_TIMEOUT_MS) {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}

async function waitForAnimationFrame(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
}

module.exports = {
  waitForNetworkIdle,
  waitForElement,
  waitForAnimationFrame
};
