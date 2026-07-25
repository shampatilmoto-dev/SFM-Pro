const path = require("path");

const qaRoot = path.resolve(__dirname, "..");

const artifactPaths = {
  root: qaRoot,
  config: path.join(qaRoot, "config"),
  data: path.join(qaRoot, "data"),
  fixtures: path.join(qaRoot, "fixtures"),
  logs: path.join(qaRoot, "logs"),
  managers: path.join(qaRoot, "managers"),
  pageObjects: path.join(qaRoot, "page-objects"),
  reports: path.join(qaRoot, "reports"),
  reportsHtml: path.join(qaRoot, "reports", "html"),
  reportsJson: path.join(qaRoot, "reports", "summary.json"),
  reportsSummaryDir: path.join(qaRoot, "reports", "summary"),
  screenshots: path.join(qaRoot, "screenshots"),
  testResults: path.join(qaRoot, "reports", "test-results"),
  htmlReport: path.join(qaRoot, "reports", "html")
};

module.exports = {
  qaRoot,
  artifactPaths
};