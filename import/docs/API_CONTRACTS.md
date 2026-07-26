# API contracts

## Workbook parser

`parseWorkbook(file, selectedSheet?, onProgress?) -> Promise<ParsedWorkbook>`

- Accepts `.xlsx`, `.xls`, and UTF-8 `.csv` files up to 250 MB.
- Executes workbook parsing in a module Web Worker.
- Returns filename, checksum, sheet names, headers, rows, size, and duration.
- Throws a friendly error for unsupported, empty, oversized, unreadable, or corrupt files.

## Validation

`validateRows(module, sheetName, rows) -> ParsedRow[]`

- Maps case- and punctuation-insensitive template headers to canonical keys.
- Applies the selected module's Zod schema to every row.
- Returns normalized values, row/sheet positions, fingerprint, status, and cell-level errors.

`detectDuplicates(module, rows, existing) -> ParsedRow[]`

- Detects duplicates within the workbook/session and the destination collection.
- Annotates rows without mutating the source arrays.

## Transactions

`executeImport({ options, rows, fileName, fileHash, actor }) -> Promise<TransactionResult>`

- Creates an audit record and pre-import snapshot.
- Plans append, replace-period, or update-existing behavior in memory.
- Writes the entire destination collection once.
- Restores the previous snapshot if any step fails.
- Emits `sfm-database-updated` and `sfm-import-completed` after success.

`rollbackImport(importId) -> Promise<void>`

- Requires a completed audit entry with an available snapshot.
- Restores exact established-key JSON and extension data.
- Marks the audit record `rolled-back` and emits the refresh events.

## History repositories

- `saveHistory(record) -> Promise<void>`
- `getHistory() -> Promise<ImportHistoryRecord[]>`
- `getHistoryById(id) -> Promise<ImportHistoryRecord | undefined>`
- `clearHistory() -> Promise<void>`
- `saveSnapshot(snapshot) -> Promise<void>`
- `getSnapshot(id) -> Promise<ImportSnapshot | undefined>`
- `deleteSnapshot(id) -> Promise<void>`

## Templates and reports

- `createTemplateWorkbook(module) -> WorkBook`
- `downloadTemplate(module) -> void`
- `errorRows(rows) -> ErrorReportRow[]`
- `downloadErrorReport(rows, "xlsx" | "csv") -> void`

## Refresh event detail

```ts
interface ImportRefreshDetail {
  module: ImportModule;
  importId: string;
  source: "enterprise-import-center";
}
```

The event is dispatched on the Import Center window and, when same-origin, its parent window. A host may handle either event without a browser reload.
