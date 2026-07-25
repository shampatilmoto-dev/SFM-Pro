const fs = require("fs");
const path = require("path");
const { artifactPaths } = require("../config/paths");

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(value) {
  return String(value || "test")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "test";
}

class LoggerManager {
  constructor(testInfo = null, outputDir = artifactPaths.logs) {
    this.testInfo = testInfo;
    this.outputDir = outputDir;
    this.entries = [];
    this.filePath = this.buildFilePath();
  }

  buildFilePath() {
    const title = this.testInfo?.title || "enterprise-test";
    const project = this.testInfo?.project?.name || "default";
    const fileName = `${safeName(project)}-${safeName(title)}.log`;
    return path.join(this.outputDir, fileName);
  }

  log(level, message, meta = {}) {
    ensureDirectory(this.outputDir);
    const entry = {
      timestamp: new Date().toISOString(),
      level: String(level || "info").toUpperCase(),
      test: this.testInfo?.title || "unknown",
      message,
      meta
    };
    this.entries.push(entry);
    fs.appendFileSync(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
    return entry;
  }

  start(message = "Test started", meta = {}) {
    return this.log("start", message, meta);
  }

  end(message = "Test ended", meta = {}) {
    return this.log("end", message, meta);
  }

  pageLoad(message = "Page loaded", meta = {}) {
    return this.log("page-load", message, meta);
  }

  warning(message = "Warning", meta = {}) {
    return this.log("warning", message, meta);
  }

  failure(message = "Failure", meta = {}) {
    return this.log("failure", message, meta);
  }

  info(message = "Info", meta = {}) {
    return this.log("info", message, meta);
  }
}

module.exports = {
  LoggerManager
};