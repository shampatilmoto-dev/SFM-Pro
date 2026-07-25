const fs = require("fs");
const path = require("path");
const { artifactPaths } = require("../config/paths");

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

class ScreenshotManager {
  constructor(page, testInfo = null, outputDir = artifactPaths.screenshots) {
    this.page = page;
    this.testInfo = testInfo;
    this.outputDir = outputDir;
  }

  getFolder() {
    const project = safeName(this.testInfo?.project?.name || "default");
    const suite = safeName(this.testInfo?.file ? path.basename(this.testInfo.file, path.extname(this.testInfo.file)) : "suite");
    const title = safeName(this.testInfo?.title || "test");
    const folder = path.join(this.outputDir, project, suite, title);
    ensureDirectory(folder);
    return folder;
  }

  buildPath(label, suffix = "png") {
    return path.join(this.getFolder(), `${safeName(label)}.${suffix}`);
  }

  async takeFullPage(label = "full-page") {
    const filePath = this.buildPath(label);
    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  async takeViewport(label = "viewport") {
    const filePath = this.buildPath(label);
    await this.page.screenshot({ path: filePath, fullPage: false });
    return filePath;
  }

  async takeFailure(label = "failure") {
    const filePath = this.buildPath(`${label}-failure`);
    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  async takeBeforeAfter(beforeLabel = "before", afterLabel = "after") {
    const before = await this.takeViewport(beforeLabel);
    const after = await this.takeViewport(afterLabel);
    return { before, after };
  }
}

module.exports = {
  ScreenshotManager
};