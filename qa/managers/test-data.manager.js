const fs = require("fs");
const path = require("path");
const { artifactPaths } = require("../config/paths");
const pages = require("../data/pages.json");
const viewports = require("../data/viewports.json");

class TestDataManager {
  constructor(rootDir = artifactPaths.data) {
    this.rootDir = rootDir;
    this.pages = pages;
    this.viewports = viewports;
  }

  listPages() {
    return [...this.pages];
  }

  getPage(name) {
    const target = String(name || "").toLowerCase();
    return this.pages.find((page) => String(page.name || "").toLowerCase() === target || String(page.dataPage || "").toLowerCase() === target) || null;
  }

  getPagesByGroup(group) {
    const target = String(group || "").toLowerCase();
    return this.pages.filter((page) => String(page.group || "").toLowerCase() === target);
  }

  listViewports() {
    return Object.values(this.viewports);
  }

  getViewport(name) {
    return this.viewports[name] || null;
  }

  loadJson(fileName) {
    const targetPath = path.join(this.rootDir, fileName.endsWith(".json") ? fileName : `${fileName}.json`);
    if (!fs.existsSync(targetPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(targetPath, "utf8"));
  }
}

module.exports = {
  TestDataManager
};