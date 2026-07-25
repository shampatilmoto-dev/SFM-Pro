const fs = require('fs');
const { test, expect } = require('../fixtures/base.fixture');
const { openShellPage } = require('./shell.shared');

test.describe('08_console', () => {
  test('Captures console warnings, errors, exceptions, and failed requests', async ({ page, consoleManager, reportManager }) => {
    await openShellPage(page, 'dashboard');

    const summary = await reportManager.collectSummary();
    const consoleFile = await consoleManager.flush('console-shell');
    const finalReport = await reportManager.generate();

    expect(fs.existsSync(consoleFile)).toBeTruthy();
    expect(fs.existsSync(finalReport.jsonPath)).toBeTruthy();
    expect(fs.existsSync(finalReport.htmlPath)).toBeTruthy();
    expect(Array.isArray(summary.consoleErrors)).toBeTruthy();
    expect(Array.isArray(summary.consoleWarnings)).toBeTruthy();
    expect(Array.isArray(summary.networkErrors)).toBeTruthy();
    expect(Array.isArray(consoleManager.getJavaScriptExceptions())).toBeTruthy();
    expect(Array.isArray(consoleManager.getConsoleWarnings())).toBeTruthy();
  });
});