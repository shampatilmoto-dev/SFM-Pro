# Performance and security

## Performance strategy

- Workbook decoding runs in a dedicated Web Worker, so SheetJS work does not block UI interactions.
- CSV and spreadsheet bytes are loaded once in the worker; structured data is returned once.
- The validation table uses TanStack Table with TanStack Virtual and overscan, rendering only visible rows.
- Duplicate lookup uses indexed in-memory maps rather than nested record comparisons.
- The destination collection is written once per successful import rather than once per row.
- Preview columns are discovered from a bounded sample, avoiding full-dataset header rescans.
- A 100,000-row parse-and-validation test is included. Browser limits for 250,000-500,000 rows depend on workbook density, strings, extensions, available memory, and per-origin storage quota.

XLSX is a ZIP/container format and browser SheetJS parsing requires workbook bytes in memory. CSV is less memory intensive. For data beyond browser capacity, split files by period or run a future server-side/SQLite importer using the same type contracts.

## Security controls

- Files are processed locally and are not uploaded by this module.
- File extensions, empty input, and a 250 MB size ceiling are checked before parsing.
- Sheet text is rendered as React text nodes; no workbook value is injected as HTML.
- Formula cells are read as values and never evaluated by application code.
- Template and error downloads use generated local blobs/workbooks.
- The current actor comes from the existing `AuthenticationManager` when available; no user identity is hardcoded.
- IDs use browser cryptographic randomness.
- Every import has a file checksum and immutable audit identifier.
- Settings keys are allow-listed; arbitrary configuration injection is rejected.
- No network request, automatic synchronization, listener, migration, batch write, or cloud write is introduced.

## Operational limits

LocalStorage and IndexedDB quotas vary by browser and device. The importer normalizes quota/security exceptions and restores the prior state on a failed write. Organizations requiring guaranteed 500,000-row capacity should use a managed SQLite/server transaction target rather than depending on browser quotas.
