const fs = require("fs");
const path = require("path");
const { artifactPaths } = require("../config/paths");

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(value) {
  return String(value || "console")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "console";
}

class ConsoleManager {
  constructor(page, logger = null, testInfo = logger?.testInfo || null, outputDir = artifactPaths.logs) {
    this.page = page;
    this.logger = logger;
    this.testInfo = testInfo;
    this.outputDir = outputDir;
    this.entries = [];
    this.attached = false;
    this.networkErrors = [];
    this.attach();
  }

  attach() {
    if (this.attached || !this.page) {
      return;
    }
    this.attached = true;
    this.page.on("console", (message) => {
      const entry = {
        type: message.type(),
        text: message.text(),
        location: message.location(),
        timestamp: new Date().toISOString()
      };
      this.entries.push(entry);
      if (message.type() === "warning" && this.logger) {
        this.logger.warning(message.text(), entry);
      }
      if (message.type() === "error" && this.logger) {
        this.logger.failure(message.text(), entry);
      }
    });
    this.page.on("pageerror", (error) => {
      const entry = {
        type: "pageerror",
        text: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      this.entries.push(entry);
      if (this.logger) {
        this.logger.failure(error.message, entry);
      }
    });
    this.page.on("requestfailed", (request) => {
      const entry = {
        type: "networkerror",
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      };
      this.networkErrors.push(entry);
      this.entries.push(entry);
      if (this.logger) {
        this.logger.warning(request.failure()?.errorText || "Network request failed", entry);
      }
    });
  }

  getConsoleErrors() {
    return this.entries.filter((entry) => entry.type === "error" || entry.type === "pageerror");
  }

  getConsoleWarnings() {
    return this.entries.filter((entry) => entry.type === "warning");
  }

  getNetworkErrors() {
    return [...this.networkErrors];
  }

  getJavaScriptExceptions() {
    return this.entries.filter((entry) => entry.type === "pageerror");
  }

  async flush(label = this.testInfo?.title || "console") {
    ensureDirectory(this.outputDir);
    const project = safeName(this.testInfo?.project?.name || "default");
    const filePath = path.join(this.outputDir, `${project}-${safeName(label)}.json`);
    const payload = {
      consoleErrors: this.getConsoleErrors(),
      consoleWarnings: this.getConsoleWarnings(),
      networkErrors: this.getNetworkErrors(),
      javascriptExceptions: this.getJavaScriptExceptions()
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
    return filePath;
  }
}

module.exports = {
  ConsoleManager
};