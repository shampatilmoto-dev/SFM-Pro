# Firebase Synchronization Layer — Sprint 4.5

## Data flow

```text
Manager / Service
      |
      v
LocalStorage adapter (primary write)
      |
      | successful write only; caller returns immediately
      v
firebase-sync.js
      |
      v
Domain Repository
      |
      v
firebase-firestore.js
      |
      v
users/{uid}/{collection}
```

Managers and services continue to read and write LocalStorage through their existing storage APIs. They do not import synchronization repositories. Synchronization promises are deliberately not awaited by the storage layer, so cloud availability cannot delay or reject a local user action.

## Supported modules

| Public API | Local source | Repository collection |
| --- | --- | --- |
| `syncIncome()` | `SFM_DATABASE.income` | `users/{uid}/income` |
| `syncExpense()` | `SFM_DATABASE.expenses` | `users/{uid}/expense` |
| `syncBudget()` | `SFM_DATABASE.budgets` | `users/{uid}/budget` |
| `syncLoan()` / `syncLoans()` | `SFM_DATABASE.loans` | `users/{uid}/loans` |
| `syncInvestment()` | `SFM_DATABASE.investments` | `users/{uid}/investments` |
| `syncCreditCard()` | `SFM_DATABASE.creditcards` | `users/{uid}/creditcards` |
| `syncEMI()` | `sfm_emi_records` | `users/{uid}/emi` |
| `syncDashboard()` | Local finance, EMI, goal, reminder, transaction, profile, and metadata snapshot | `users/{uid}/dashboard` |
| `syncSettings()` | `SFM_SETTINGS` | `users/{uid}/settings` |
| `syncReports()` | `SFM_DATABASE.reports` | `users/{uid}/reports` |

`syncModule(name, { force })` performs a manual full reconciliation for one module. `syncAll({ force })` synchronizes every supported module. `syncLocalChange(name, operation, value)` is the future-ready changed-record API used by successful LocalStorage CRUD hooks.

## Synchronization result

Changed-record and module methods always resolve. They never reject the local caller.

```js
{
  module: "income",
  operation: "create", // create, update, delete, or full
  status: "synced",    // synced, skipped, pending, or failed
  success: true,
  pending: false,
  created: 1,
  updated: 0,
  deleted: 0,
  skipped: 0,
  failed: 0,
  code: null
}
```

Important codes include `sync/offline`, `sync/authentication-required`, `sync/unchanged`, `sync/already-deleted`, `sync/service-unavailable`, `sync/permission-denied`, and `sync/partial-failure`.

## Duplicate prevention and identity

Local records retain their existing `id`. Repositories create their own Firestore document identifiers, so the synchronization layer stores a private mapping in `SFM_FIREBASE_SYNC_STATE`. The mapping is scoped to the authenticated UID and contains only remote IDs, content hashes, and synchronization timestamps.

Before a write, the layer hashes a canonical representation of the complete record. An unchanged hash returns `sync/unchanged` without a Firestore write. Work for the same module is serialized in memory to prevent rapid UI operations from racing into duplicate uploads. Metadata writes merge only the affected module so simultaneous work in different modules cannot overwrite mappings. The state resets when the authenticated UID changes, preventing document mappings from crossing user boundaries.

## Offline and failure behavior

- When `navigator.onLine` is false, synchronization returns `pending` and does not access a repository.
- No pending item is persisted in Sprint 4.5; retry queues begin in Sprint 4.6.
- Missing authentication returns a normalized failure before repository access.
- Repository/Firebase errors are converted to stable sync codes and logged without raw Firebase details.
- Synchronization errors never change the successful LocalStorage result or user flow.

## Full reconciliation

LocalStorage is authoritative. Full synchronization creates missing cloud records, updates changed records, skips unchanged records, and individually deletes cloud records that no longer exist locally. It uses repository methods only; there are no Firestore batch writes or transactions.

## Explicitly excluded

Sprint 4.5 does not implement pull synchronization, real-time listeners, conflict resolution, retries, a persistent offline queue, background workers, Firestore offline cache, migrations, merge strategies, batch writes, or transactions.
