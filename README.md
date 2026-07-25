# SFM PRO Enterprise

![SFM PRO Enterprise Logo](assets/logo/logo-placeholder.svg)

[![Version](https://img.shields.io/badge/version-v5.0.0-blue.svg)](version.json)
[![Release](https://img.shields.io/badge/release-Production%20Release-success.svg)](RELEASE_NOTES_v5.0.md)
[![JavaScript](https://img.shields.io/badge/javascript-ES6%2B-yellow.svg)](js/)
[![HTML5](https://img.shields.io/badge/html5-supported-orange.svg)](index.html)
[![CSS3](https://img.shields.io/badge/css3-responsive-blueviolet.svg)](css/)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey.svg)](docs/LICENSE.md)
[![GitHub Stars](https://img.shields.io/github/stars/shampatilmoto-dev/SFM-Pro?style=flat)](https://github.com/shampatilmoto-dev/SFM-Pro/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/shampatilmoto-dev/SFM-Pro?style=flat)](https://github.com/shampatilmoto-dev/SFM-Pro/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/shampatilmoto-dev/SFM-Pro?style=flat)](https://github.com/shampatilmoto-dev/SFM-Pro/issues)
[![Last Commit](https://img.shields.io/github/last-commit/shampatilmoto-dev/SFM-Pro?style=flat)](https://github.com/shampatilmoto-dev/SFM-Pro/commits/main)
[![Repository Size](https://img.shields.io/github/repo-size/shampatilmoto-dev/SFM-Pro?style=flat)](https://github.com/shampatilmoto-dev/SFM-Pro)
[![Code Size](https://img.shields.io/github/languages/code-size/shampatilmoto-dev/SFM-Pro?style=flat)](https://github.com/shampatilmoto-dev/SFM-Pro)
[![Maintainability](https://img.shields.io/badge/maintainability-high-success.svg)](README.md)
[![Documentation](https://img.shields.io/badge/docs-complete-informational.svg)](docs/)

> SFM PRO Enterprise is a browser-based personal finance workspace for managing income, expenses, budgets, loans, credit cards, EMI, investments, reports, settings, backups, and restores.

## Contents

- [Highlights](#highlights)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Browser Support](#browser-support)
- [Security](#security)
- [Performance](#performance)
- [Documentation](#documentation)
- [Release History](#release-history)
- [Contributors](#contributors)
- [Roadmap](#roadmap)
- [Support](#support)

## Highlights

- Dashboard-first finance overview with charts, reminders, and summary cards.
- Browser-local data storage with backup and restore workflows.
- Dedicated module entry points for income, expense, budget, loans, EMI, credit cards, investments, reports, and settings.
- Consistent routing, storage, and validation across the application.

## Architecture

The application follows a static multi-module architecture:

| Layer | Purpose |
| --- | --- |
| Entry pages | `index.html`, `login.html`, and `dashboard.html` route users into the application. |
| Core | `js/core/` provides bootstrap, configuration, router, and shared utilities. |
| Engine | `js/engine/` handles finance and storage concerns. |
| Services | `js/services/` exposes feature-level orchestration and summaries. |
| Modules | `js/modules/` contains module controllers, storage helpers, and UI behavior. |
| Presentation | `css/`, `components/`, and `assets/` hold the interface assets. |

## Repository Layout

```text
SFM-Pro/
├── assets/
├── components/
├── config/
├── css/
├── docs/
├── js/
├── pages/
├── tests/
├── .github/
├── README.md
└── version.json
```

## Screenshots

| Screen | File |
| --- | --- |
| Dashboard | `assets/screenshots/dashboard.png` |
| Income | `assets/screenshots/income.png` |
| Expense | `assets/screenshots/expense.png` |
| Budget | `assets/screenshots/budget.png` |
| Loans | `assets/screenshots/loans.png` |
| Credit Cards | `assets/screenshots/credit-cards.png` |
| Investments | `assets/screenshots/investments.png` |
| Reports | `assets/screenshots/reports.png` |
| Settings | `assets/screenshots/settings.png` |
| Backup | `assets/screenshots/backup.png` |
| Restore | `assets/screenshots/restore.png` |
| Responsive | `assets/screenshots/responsive.png` |

## Installation

1. Clone or download the repository.
2. Keep the folder structure intact.
3. Open `index.html` in a modern browser or serve the project with a static web server.
4. Use `login.html` to access the dashboard and module pages.

## Quick Start

1. Open the application.
2. Log in.
3. Add income and expense records first.
4. Review the dashboard summaries.
5. Export a backup before browser maintenance or device changes.

## Technology Stack

- HTML5
- CSS3
- JavaScript ES6+
- Browser local storage
- Static file routing
- Chart.js for visualization

## Browser Support

Supported browsers:

| Browser | Support |
| --- | --- |
| Google Chrome | Current stable release |
| Microsoft Edge | Current stable release |
| Mozilla Firefox | Current stable release |
| Apple Safari | Current stable release |

JavaScript and local storage must be enabled. External CDN assets require network access when the project is hosted without bundling.

## Security

- Local data stays in the current browser profile unless exported.
- Backups should be stored securely and shared only with trusted users.
- Import validation rejects malformed or incompatible backup data.
- The application avoids server-side credential storage.

## Performance

- Static HTML and modular JavaScript keep startup lightweight.
- Dashboard summaries are computed locally without server round-trips.
- Large backups are validated before restore operations proceed.

## Documentation

- [CHANGELOG.md](CHANGELOG.md)
- [RELEASE_NOTES_v5.0.md](RELEASE_NOTES_v5.0.md)
- [USER_GUIDE.md](USER_GUIDE.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/LICENSE.md](docs/LICENSE.md)

## Release History

| Version | Status | Notes |
| --- | --- | --- |
| v5.0.0 | Production Release | Final stabilization and repository professionalization |
| v4.0G | Enterprise UI | Enterprise UI, accessibility, and production polish |
| v4.0D | Standardization | Controller, service, storage, and API standardization |
| v4.0A-v4.0C | Foundation | Core framework, validation, and rendering hardening |

## Contributors

- Sham Patil
- Codex-assisted repository maintenance

## Roadmap

- Repository governance and release hygiene
- Documentation refinement and onboarding polish
- Expanded regression coverage
- Ongoing maintenance for module documentation and screenshots

## Support

- Review the guides in this repository first.
- Export a backup before making browser-storage changes.
- Open an issue using the templates in `.github/ISSUE_TEMPLATE/`.
- Include the browser name, version, and reproduction steps when reporting a problem.

