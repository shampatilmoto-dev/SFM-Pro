# SFM PRO Enterprise QA Framework

Phase 1 - Step 2 delivers the reusable enterprise test foundation for SFM PRO Enterprise.

This layer is intentionally framework-only. It does not modify application HTML, CSS, JavaScript, controllers, services, or business logic.

## What is included

- Playwright configuration for Chromium, Edge, and Firefox
- BasePage / LayoutPage / ModulePage architecture
- NavigationManager, AssertionManager, ScreenshotManager, WaitManager
- ConsoleManager, PerformanceManager, ReportManager
- TestDataManager, EnvironmentManager, LoggerManager
- Reusable fixture and base test wiring
- Enterprise page object classes for the core modules
- HTML and JSON reporting outputs
- Screenshot, video, and trace-on-failure support

## Install

From the `qa/` directory:

```bash
npm install
npx playwright install chromium firefox msedge
```

## Run tests

```bash
npm test
npm run test:headed
npm run test:debug
npm run report
```

## Environment configuration

The framework resolves the base URL through `BASE_URL`.

Default:

```text
http://127.0.0.1:5500
```

Examples:

```bash
BASE_URL=http://127.0.0.1:5500 npm test
BASE_URL=https://staging.example.com npm test
```

## Folder structure

```text
qa/
  config/
  data/
  fixtures/
  managers/
  page-objects/
  tests/
  utils/
  reports/
  screenshots/
  logs/
  playwright.config.js
  package.json
  README.md
```

## Architecture

- `BasePage` handles low-level reusable browser actions.
- `LayoutPage` layers shared shell behavior on top of `BasePage`.
- `ModulePage` adds enterprise dashboard/module helpers.
- Specific page objects inherit from `ModulePage` for future module coverage.
- Managers encapsulate navigation, assertions, waits, screenshots, logging, console capture, performance collection, reporting, test data, and environment resolution.
- The base fixture exposes the managers to future tests.

## Reporting outputs

- HTML reporter: `qa/reports/html`
- JSON summary: `qa/reports/summary.json`
- Per-test enterprise summary: `qa/reports/summary/`
- Logs: `qa/logs/`
- Screenshots: `qa/screenshots/`

## Notes

- This phase deliberately does not add module-specific tests.
- The framework is reusable for Dashboard, Income, Expense, Budget, Loans, Credit Cards, EMI, Investments, Reports, and Settings.
- Trace, video, and screenshot capture are enabled on failure paths in Playwright config.