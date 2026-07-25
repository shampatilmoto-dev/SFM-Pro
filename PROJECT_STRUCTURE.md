# Project Structure

## Top Level

| Path | Purpose |
| --- | --- |
| `index.html` | Root entry point that redirects to the login page |
| `login.html` | Authentication screen |
| `dashboard.html` | Main application shell |
| `pages/` | Module entry pages |
| `js/` | Application logic, services, and modules |
| `css/` | Shared and module styles |
| `components/` | Reusable HTML fragments |
| `config/` | Metadata and configuration documents |
| `docs/` | Detailed product documentation |
| `tests/` | Validation and regression scripts |
| `assets/` | Images, icons, logos, and screenshots |

## JavaScript Layers

| Layer | Role |
| --- | --- |
| `js/core/` | Bootstrap, router, configuration, and shared helpers |
| `js/engine/` | Storage and finance engines |
| `js/services/` | Module-facing service APIs |
| `js/modules/` | Feature controllers and UI logic |
| `js/*.js` | Page-level scripts and shared charts |

## Documentation Layer

| Path | Purpose |
| --- | --- |
| `README.md` | Repository overview and quick start |
| `CHANGELOG.md` | Release history |
| `USER_GUIDE.md` | User onboarding and usage guide |
| `DEPLOYMENT_GUIDE.md` | Static deployment guidance |
| `RELEASE_NOTES_v5.0.md` | Release summary |
| `CONTRIBUTING.md` | Contribution workflow |
| `SECURITY.md` | Vulnerability reporting guidance |

## Repository Notes

- The project uses static-file routing.
- The browser storage schema is preserved.
- No build step is required for normal use.
- Documentation should keep relative links aligned with this structure.
