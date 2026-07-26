# Integration checklist

## Build and deployment

- [ ] Run `npm.cmd install`, `npm.cmd test`, and `npm.cmd run build` inside `/import`.
- [ ] Serve `/import/dist` at `/import/` on the same origin as SFM PRO.
- [ ] Keep the generated app isolated; do not replace the existing root build.
- [ ] Verify Content Security Policy permits module workers and local blob downloads.

## Existing application compatibility

- [ ] Confirm `SFM_DATABASE` exists by opening the main application once.
- [ ] Confirm the current database has the established array collections documented in `ARCHITECTURE.md`.
- [ ] Confirm EMI continues to use `sfm_emi_records`.
- [ ] Do not rename or migrate existing keys, collections, routes, managers, or models.
- [ ] Host the Import Center same-origin if it must read the established browser data.

## Refresh integration

The Import Center emits two same-origin DOM events after commit and rollback:

```js
window.addEventListener("sfm-database-updated", (event) => {
  // Existing host orchestration may refresh its managers from established storage.
  // event.detail = { module, importId, source }
});
```

- [ ] Connect the event at the application's existing orchestration boundary when that change is separately approved.
- [ ] Refresh dashboards, charts, KPIs, reports, budgets, calendar, notifications, and analytics from their current public APIs.
- [ ] Do not duplicate calculations inside the Import Center.

## Module readiness

- [ ] Validate Income, Expense, Budget, Loan, Credit Card, EMI, Investment, Category, and Recurring imports against production samples.
- [ ] Approve schema adapters before promoting Account, Bill, Asset, or Settings extension records into existing application modules.
- [ ] Confirm date period semantics with the finance owner before using replace-period in production.
- [ ] Retain rollback snapshots according to the organization's privacy and retention policy.

## Acceptance checks

- [ ] Corrupt, empty, wrong-format, and oversized files fail without writes.
- [ ] One invalid row blocks the complete commit.
- [ ] Workbook and database duplicates follow the selected policy.
- [ ] A simulated storage failure restores exact prior JSON.
- [ ] Completed imports appear in history with actor, checksum, counts, duration, and rollback state.
- [ ] One-click rollback restores data and emits refresh events.
- [ ] 100,000-row test and representative multi-sheet workbook pass on target browsers.
- [ ] Keyboard focus, labels, contrast, responsive layouts, light mode, and dark mode pass accessibility review.
