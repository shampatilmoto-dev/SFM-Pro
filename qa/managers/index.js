const { AssertionManager } = require("./assertion.manager");
const { ConsoleManager } = require("./console.manager");
const { EnvironmentManager } = require("./environment.manager");
const { LoggerManager } = require("./logger.manager");
const { NavigationManager } = require("./navigation.manager");
const { PerformanceManager } = require("./performance.manager");
const { ReportManager } = require("./report.manager");
const { ScreenshotManager } = require("./screenshot.manager");
const { TestDataManager } = require("./test-data.manager");
const { WaitManager } = require("./wait.manager");

module.exports = {
  AssertionManager,
  ConsoleManager,
  EnvironmentManager,
  LoggerManager,
  NavigationManager,
  PerformanceManager,
  ReportManager,
  ScreenshotManager,
  TestDataManager,
  WaitManager
};