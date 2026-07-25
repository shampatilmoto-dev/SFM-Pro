const { test: base, expect } = require('@playwright/test');
const {
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
} = require('../managers');
const { BasePage, LayoutPage, ModulePage, LoginPage } = require('../page-objects');

const test = base.extend({
  environmentManager: async ({}, use) => {
    await use(new EnvironmentManager());
  },
  testDataManager: async ({}, use) => {
    await use(new TestDataManager());
  },
  loggerManager: async ({}, use, testInfo) => {
    await use(new LoggerManager(testInfo));
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  layoutPage: async ({ page }, use) => {
    await use(new LayoutPage(page));
  },
  modulePage: async ({ page }, use) => {
    await use(new ModulePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  waitManager: async ({ page }, use) => {
    await use(new WaitManager(page));
  },
  performanceManager: async ({ page }, use) => {
    await use(new PerformanceManager(page));
  },
  screenshotManager: async ({ page }, use, testInfo) => {
    await use(new ScreenshotManager(page, testInfo));
  },
  consoleManager: async ({ page, loggerManager }, use, testInfo) => {
    const manager = new ConsoleManager(page, loggerManager, testInfo);
    await use(manager);
  },
  navigationManager: async ({ page, environmentManager }, use) => {
    await use(new NavigationManager(page, environmentManager));
  },
  assertionManager: async ({ page }, use) => {
    await use(new AssertionManager(page));
  },
  reportManager: async ({ performanceManager, screenshotManager, consoleManager, loggerManager }, use, testInfo) => {
    await use(new ReportManager({
      testInfo,
      logger: loggerManager,
      performanceManager,
      screenshotManager,
      consoleManager
    }));
  }
});

test.beforeEach(async ({ loggerManager }) => {
  loggerManager.start();
});

test.afterEach(async ({ loggerManager, consoleManager, reportManager, screenshotManager }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await screenshotManager.takeFailure(testInfo.title);
    loggerManager.failure('Test failed', { status: testInfo.status, expectedStatus: testInfo.expectedStatus });
  }

  await consoleManager.flush(testInfo.title);
  await reportManager.generate();
  loggerManager.end();
});

module.exports = {
  test,
  expect
};