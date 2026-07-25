const path = require("path");
const { defineConfig } = require("@playwright/test");
const { buildBrowserProjects } = require("./config/browsers");
const { artifactPaths } = require("./config/paths");
const { DEFAULT_TIMEOUT_MS, ACTION_TIMEOUT_MS, EXPECT_TIMEOUT_MS, RETRY_COUNT, WORKERS } = require("./config/timeouts");

const baseURL = process.env.BASE_URL || "http://127.0.0.1:5500";

module.exports = defineConfig({
  testDir: path.join(__dirname, "tests"),
  testMatch: /.*\.spec\.js$/,
  outputDir: artifactPaths.testResults,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : RETRY_COUNT,
  workers: process.env.CI ? 2 : WORKERS,
  timeout: DEFAULT_TIMEOUT_MS,
  expect: {
    timeout: EXPECT_TIMEOUT_MS
  },
  reporter: [
    ["html", { outputFolder: artifactPaths.htmlReport, open: "never" }],
    ["json", { outputFile: artifactPaths.reportsJson }],
    ["list"]
  ],
  use: {
    baseURL,
    actionTimeout: ACTION_TIMEOUT_MS,
    navigationTimeout: DEFAULT_TIMEOUT_MS,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-IN",
    colorScheme: "light",
    ignoreHTTPSErrors: true
  },
  projects: buildBrowserProjects(),
  preserveOutput: "failures-only"
});