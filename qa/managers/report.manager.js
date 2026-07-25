const fs = require("fs");
const path = require("path");
const { artifactPaths } = require("../config/paths");

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(value) {
  return String(value || "report")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "report";
}

class ReportManager {
  constructor({ testInfo = null, logger = null, performanceManager = null, screenshotManager = null, consoleManager = null, outputDir = artifactPaths.reportsSummaryDir } = {}) {
    this.testInfo = testInfo;
    this.logger = logger;
    this.performanceManager = performanceManager;
    this.screenshotManager = screenshotManager;
    this.consoleManager = consoleManager;
    this.outputDir = outputDir;
  }

  async collectSummary() {
    const performance = this.performanceManager ? await this.performanceManager.collect() : null;
    const consoleErrors = this.consoleManager ? this.consoleManager.getConsoleErrors() : [];
    const consoleWarnings = this.consoleManager ? this.consoleManager.getConsoleWarnings() : [];
    const networkErrors = this.consoleManager ? this.consoleManager.getNetworkErrors() : [];

    return {
      test: {
        title: this.testInfo?.title || "unknown",
        file: this.testInfo?.file || null,
        project: this.testInfo?.project?.name || null,
        status: this.testInfo?.status || null,
        expectedStatus: this.testInfo?.expectedStatus || null
      },
      performance,
      consoleErrors,
      consoleWarnings,
      networkErrors,
      screenshot: this.screenshotManager ? this.screenshotManager.getFolder() : null
    };
  }

  buildFilePath(extension = "json") {
    ensureDirectory(this.outputDir);
    const title = safeName(this.testInfo?.title || "enterprise-test");
    const project = safeName(this.testInfo?.project?.name || "default");
    return path.join(this.outputDir, `${project}-${title}.${extension}`);
  }

  async writeJsonSummary(summary) {
    const filePath = this.buildFilePath("json");
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), "utf8");
    return filePath;
  }

  async writeHtmlSummary(summary) {
    const filePath = this.buildFilePath("html");
    const rows = Object.entries(summary.performance || {}).map(([key, value]) => `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`).join("");
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Enterprise QA Summary</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 24px; color: #1f2937; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #dbe3f0; padding: 10px 12px; text-align: left; }
    th { background: #f6f8fc; }
    code, pre { white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <h1>Enterprise QA Summary</h1>
  <p><strong>Test:</strong> ${summary.test?.title || "unknown"}</p>
  <p><strong>Project:</strong> ${summary.test?.project || "unknown"}</p>
  <p><strong>Status:</strong> ${summary.test?.status || "unknown"}</p>
  <h2>Performance Summary</h2>
  <table>${rows}</table>
  <h2>Console Errors</h2>
  <pre>${JSON.stringify(summary.consoleErrors || [], null, 2)}</pre>
  <h2>Console Warnings</h2>
  <pre>${JSON.stringify(summary.consoleWarnings || [], null, 2)}</pre>
  <h2>Network Errors</h2>
  <pre>${JSON.stringify(summary.networkErrors || [], null, 2)}</pre>
</body>
</html>`;
    fs.writeFileSync(filePath, html, "utf8");
    return filePath;
  }

  async generate() {
    const summary = await this.collectSummary();
    const jsonPath = await this.writeJsonSummary(summary);
    const htmlPath = await this.writeHtmlSummary(summary);
    if (this.logger) {
      this.logger.info("Enterprise summary generated", { jsonPath, htmlPath });
    }
    return { summary, jsonPath, htmlPath };
  }
}

module.exports = {
  ReportManager
};