# Architecture

## Design constraints

The Import Center is an isolated Vite application under `/import`. Existing application files remain unchanged. Stable modules continue to use their current data model and storage keys. Import history, rollback snapshots, and future module data use a dedicated IndexedDB database named `sfm-pro-import-center`.

## Import flow

```text
File picker / dropzone
        |
        v
Workbook Web Worker ----> SheetJS parser ----> every worksheet
        |                                      |
        +------ progress messages <------------+
        |
        v
Zod row validation --> duplicate fingerprints --> virtualized preview
        |                                              |
        | errors                                       | confirmed
        v                                              v
XLSX/CSV error report                    pre-import IndexedDB snapshot
                                                       |
                                                       v
                                          in-memory transaction plan
                                                       |
                                  +--------------------+------------------+
                                  |                                       |
                                  v                                       v
                         established SFM keys                  extension IDB store
                                  |                                       |
                                  +--------------------+------------------+
                                                       |
                                          success / immediate restore
                                                       |
                                                       v
                                  audit history + refresh DOM events
```

## Storage mapping

| Import module | Destination | Compatibility behavior |
| --- | --- | --- |
| Income | `SFM_DATABASE.income` | Existing schema |
| Expense | `SFM_DATABASE.expenses` | Existing schema |
| Budget | `SFM_DATABASE.budgets` | Existing schema |
| Loan | `SFM_DATABASE.loans` | Existing schema |
| Credit Card | `SFM_DATABASE.creditcards` | Existing schema |
| Investment | `SFM_DATABASE.investments` | Existing schema |
| Category | `SFM_DATABASE.categories` | Existing schema |
| Recurring | `SFM_DATABASE.reminders` | Existing compatible collection |
| EMI | `sfm_emi_records` | Existing standalone EMI key |
| Account, Bill, Asset, Settings | IndexedDB `extensions` | Does not alter the established database shape; ready for a later approved adapter |
| Audit records | IndexedDB `history` | Import Center-owned |
| Rollback data | IndexedDB `snapshots` | Import Center-owned |

## Folder structure

```text
import/
  docs/                 architecture, contracts, rules, security, integration
  src/
    components/         pages, workflow, preview and local shadcn-style UI
    hooks/              import workflow orchestration
    lib/                dates, hashing, downloads and shared utilities
    parsers/            UTF-8 CSV parsing
    persistence/        IndexedDB repositories
    services/           parser, transaction, rollback, template and reports
    store/              Zustand workflow state
    templates/          module template definitions
    types/              shared TypeScript contracts
    validators/         Zod schemas, header mapping and duplicates
    workers/            workbook worker
  tests/                unit, parser, validation, duplicate, transaction,
                        rollback, history, performance and large-file tests
```

## Atomicity and rollback

Before the first application data write, the engine persists exact JSON snapshots of both established storage keys plus the affected extension collection. The next collection state is fully built in memory. A write exception immediately restores the snapshot and records a failed audit entry. A completed import retains the snapshot for one-click rollback.

Browser APIs cannot provide a native transaction spanning LocalStorage and IndexedDB. The module therefore implements a durable snapshot-and-compensate transaction. No success is reported until every required write and the audit update completes.
