# SFM PRO Enterprise - Master Architecture

## 1. Project Overview

| Item | Description |
|---|---|
| Purpose | Provide a single, maintainable financial management platform for household and enterprise-style tracking of income, expenses, budgets, loans, investments, and reports. |
| Vision | Build a clean, modular, local-first finance application that can evolve into a fully connected enterprise platform without breaking existing behavior. |
| Goals | Keep the architecture simple, stable, and extensible; support incremental modernization; preserve backward compatibility; and enable safe sprint-based development. |
| Target Users | Individuals, small business operators, internal maintainers, reviewers, and future enterprise users who need reliable finance tracking and reporting. |

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Presentation | HTML5 | Page structure, semantics, forms, tables, and navigation. |
| Styling | CSS3 | Layout, theme, responsive design, and component presentation. |
| Application Logic | JavaScript (ES6 Modules) | UI behavior, data flow, business rules, and module orchestration. |
| Persistence | LocalStorage | Current client-side data storage for offline-first operation. |
| Cloud Integration | Firebase (Future) | Planned backend sync, authentication, and remote persistence. |
| Deployment Model | Progressive Web App (Future) | Planned installable, offline-capable, app-like experience. |

## 3. Project Architecture

The application follows a layered architecture designed to keep user interface concerns separate from business rules and persistence.

```text
Presentation (UI)
↓
Controller
↓
Service
↓
Engine
↓
Storage
↓
LocalStorage
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Presentation (UI) | Renders pages, collects user input, and displays results. |
| Controller | Handles user events, coordinates UI actions, and delegates to services. |
| Service | Orchestrates operations, applies application rules, and manages response objects. |
| Engine | Performs validation, normalization, sanitization, calculations, and domain logic. |
| Storage | Reads and writes records using the persistence adapter. |
| LocalStorage | Stores the live client-side database in the browser. |

## 4. Folder Structure

| Folder | Purpose |
|---|---|
| assets/ | Static assets such as icons, images, and logos. |
| css/ | Global styles, module styles, theme rules, and shared layout definitions. |
| docs/ | Architecture notes, installation guidance, roadmap documents, decisions, and release records. |
| js/ | Application logic, module controllers, services, engines, storage helpers, and shared runtime code. |
| pages/ | Feature-specific application pages that host modules and views. |
| prompts/ | Governance prompts, architecture guidance, implementation rules, and workflow documents. |

## 5. Coding Standards

- Use ES6 modules and module-scoped patterns consistently.
- Follow the Single Responsibility Principle.
- Keep functions small, focused, and easy to test.
- Use meaningful names for variables, functions, and files.
- Avoid duplicate logic; centralize shared behavior.
- Keep business logic out of the UI layer.
- Maintain consistent formatting and code style across the project.
- Preserve backward compatibility when modernizing existing behavior.

### Code Quality Rules

| Rule | Expectation |
|---|---|
| ES6 Modules | Prefer module-based organization for clarity and maintainability. |
| Single Responsibility Principle | Each unit should do one job well. |
| Small Functions | Favor short, readable functions over large procedural blocks. |
| Meaningful Names | Use names that explain intent without needing extra context. |
| No Duplicate Logic | Reuse shared helpers and avoid copy-paste implementations. |
| No Inline Business Logic | Keep logic in engines or services, not embedded in markup or event handlers. |
| Consistent Formatting | Follow existing conventions for indentation, spacing, and structure. |
| Backward Compatibility | Preserve current behavior while improving architecture. |

## 6. Layer Responsibilities

### Controller

Controllers handle user interaction and coordinate application flow.

Should do:
- Capture events from forms, buttons, search fields, and table actions.
- Call service methods and update the UI based on results.
- Normalize legacy and modern service responses when needed.

Should not do:
- Perform core validation rules.
- Contain heavy business calculations.
- Write directly to storage.

### Service

Services coordinate business operations and provide standardized outputs.

Should do:
- Orchestrate create, update, delete, and read actions.
- Convert engine results into a standard response object.
- Preserve compatibility for older controller paths.

Should not do:
- Render UI elements.
- Handle DOM events directly.
- Bypass engine validation for write operations.

### Engine

Engines own validation, normalization, sanitization, and domain calculations.

Should do:
- Validate record fields.
- Normalize text, date, and numeric values.
- Produce warnings and structured validation results.

Should not do:
- Access DOM elements.
- Call presentation code.
- Store records directly.

### Storage

Storage isolates persistence access.

Should do:
- Load, add, update, and delete records.
- Communicate with the database adapter or LocalStorage layer.
- Return stable data shapes.

Should not do:
- Make UI decisions.
- Enforce user-facing validation rules.
- Mix presentation logic with data access.

### DashboardService

DashboardService aggregates data for the dashboard and summary widgets.

Should do:
- Build summary metrics from module data.
- Aggregate records for recent activity and trend charts.
- Provide safe defaults when a module is unavailable.

Should not do:
- Mutate source records.
- Replace module-level business logic.
- Depend on UI-specific markup.

## 7. Enterprise Development Rules

- One Sprint = One Layer.
- Review Before Implementation.
- Modify Only Approved Files.
- No Breaking Changes.
- Preserve Existing Features.
- Maintain Clean Architecture.
- Run Diagnostics.
- Perform Regression Testing.
- Suggest Git Commit.

### Operating Rules

| Rule | Meaning |
|---|---|
| One Sprint = One Layer | Change only the intended architectural layer within a sprint. |
| Review Before Implementation | Analyze the gap before writing code. |
| Modify Only Approved Files | Keep edits tightly scoped to the approved files. |
| No Breaking Changes | Preserve current workflows and existing consumers. |
| Preserve Existing Features | Do not remove stable behavior unless explicitly approved. |
| Maintain Clean Architecture | Keep responsibilities separated and easy to reason about. |
| Run Diagnostics | Validate touched files after edits. |
| Perform Regression Testing | Verify nearby consumers and workflows remain stable. |
| Suggest Git Commit | Prepare a clear commit summary after successful work. |

## 8. Standard Response Object

The project uses a standardized response pattern for service and validation flows.

```json
{
	"success": true,
	"data": null,
	"errors": [],
	"warnings": [],
	"message": "",
	"valid": true,
	"error": null
}
```

| Property | Description |
|---|---|
| success | Primary modern flag that indicates whether the operation succeeded. |
| data | The returned payload, record, or transformed result. |
| errors | Array of blocking validation or operation errors. |
| warnings | Array of non-blocking notes, trims, or sanitization messages. |
| message | Human-readable summary of the result. |
| valid | Backward compatibility flag matching legacy validation checks. |
| error | Legacy single-error field, usually the first error message or null. |

## 9. Development Workflow

```text
Review
↓
Gap Analysis
↓
Implementation Plan
↓
Approval
↓
Implementation
↓
Diagnostics
↓
Regression Testing
↓
Git Commit
↓
Next Sprint
```

### Workflow Stages

| Stage | Purpose |
|---|---|
| Review | Inspect the current code, architecture, and behavior. |
| Gap Analysis | Identify what is missing compared to the target design. |
| Implementation Plan | Define the smallest safe scope for the change. |
| Approval | Wait for permission before modifying code. |
| Implementation | Apply the approved changes in the intended layer only. |
| Diagnostics | Run checks to confirm the touched files remain healthy. |
| Regression Testing | Verify nearby modules and workflows still behave correctly. |
| Git Commit | Prepare or suggest a clean commit when the work is complete. |
| Next Sprint | Move to the next approved layer or feature slice. |

## 10. Module Status

### Completed

| Module | Status |
|---|---|
| Expense | Completed |
| Dashboard | Completed |
| Income Engine | Completed |
| Income Service | Completed |

### In Progress

| Module | Status |
|---|---|
| Income Controller | In Progress |

### Planned

| Module | Status |
|---|---|
| Budget | Planned |
| Loans | Planned |
| Credit Cards | Planned |
| Investments | Planned |
| Reports | Planned |
| Firebase | Planned |
| PWA | Planned |
| AI Assistant | Planned |

## 11. Future Roadmap

| Version | Focus |
|---|---|
| v0.5 | Complete Income |
| v0.6 | Budget |
| v0.7 | Loans |
| v0.8 | Investments |
| v0.9 | Reports |
| v1.0 | Firebase + PWA |

### Roadmap Notes

- v0.5 will complete the Income module and stabilize its controller integration.
- v0.6 will expand budget planning and usage visibility.
- v0.7 will harden loan tracking and repayment workflows.
- v0.8 will support investment tracking and portfolio summaries.
- v0.9 will strengthen reporting and cross-module summaries.
- v1.0 will introduce Firebase-backed sync and PWA capabilities.
