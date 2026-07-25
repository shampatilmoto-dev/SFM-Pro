const path = require('path');
const fs = require('fs');
const { artifactPaths } = require('../config/paths');

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function captureFullPage(page, label) {
  ensureDirectory(artifactPaths.screenshots);
  const filename = `${label.replace(/[^\w-]+/g, '_')}.png`;
  const filePath = path.join(artifactPaths.screenshots, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function captureElement(page, selector, label) {
  ensureDirectory(artifactPaths.screenshots);
  const filename = `${label.replace(/[^\w-]+/g, '_')}_element.png`;
  const filePath = path.join(artifactPaths.screenshots, filename);
  await page.locator(selector).first().screenshot({ path: filePath });
  return filePath;
}

module.exports = {
  captureFullPage,
  captureElement
};
