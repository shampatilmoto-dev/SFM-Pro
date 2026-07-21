# Project Structure

## Top Level

- `index.html`: root redirect into the app.
- `login.html`: login entry page.
- `dashboard.html`: main application shell.
- `css/`: shared styles and module styling.
- `js/`: application logic, services, and modules.
- `pages/`: module entry pages.
- `components/`: reusable HTML fragments.
- `config/`: metadata and configuration documents.
- `docs/`: supporting documentation.
- `tests/`: audit and regression scripts.
- `CODEX_REPORTS/`: sprint validation reports.

## JavaScript Layers

- `js/core/`: bootstrap, router, configuration, and shared helpers.
- `js/engine/`: storage and finance engines.
- `js/services/`: feature services used by modules.
- `js/modules/`: module controllers, storage helpers, and UI logic.
- `js/login.js`, `js/dashboard.js`, `js/app.js`, `js/charts.js`: page-level scripts.

## Operational Notes

- Storage is browser-local.
- Routing is static-file based.
- The project has no build step.
- Release validation is driven by the files in `tests/`.
