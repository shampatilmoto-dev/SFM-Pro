# Architecture

## Overview

SFM PRO Enterprise uses a static, browser-first architecture. The application is split into entry pages, shared core utilities, storage and finance engines, feature services, and module controllers.

## Layer Model

| Layer | Responsibility |
| --- | --- |
| Entry | `index.html`, `login.html`, `dashboard.html`, and `pages/` |
| Core | Bootstrap, routing, configuration, and shared helpers |
| Engine | Storage and finance calculations |
| Services | Feature orchestration and summaries |
| Modules | Module-specific state, controllers, and UI behavior |
| Presentation | CSS, components, icons, and screenshots |

## Runtime Flow

1. The root page redirects to login.
2. Login opens the dashboard entry.
3. The router selects the active module controller.
4. Services aggregate data from storage and engine layers.
5. The dashboard renders summaries, tables, charts, and alerts.

## Data Model

- Records are stored locally in the browser.
- Backup and restore operate on JSON snapshots.
- The storage schema and record identifiers are preserved.
- The application does not require a server-side database for normal operation.

## Documentation Relationship

- Use `README.md` for repository onboarding.
- Use `USER_GUIDE.md` for end-user workflows.
- Use `DEPLOYMENT_GUIDE.md` for static hosting preparation.
- Use `PROJECT_STRUCTURE.md` for folder and module references.
