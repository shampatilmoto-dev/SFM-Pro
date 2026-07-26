import type { ImportHistoryRecord, ImportModule, ImportOptions, ImportSnapshot, ImportSummary, ParsedRow, TransactionResult } from "../types/import.types";
import { createId } from "../lib/utils";
import { isInPeriod } from "../lib/dates";
import { identityHash, selectImportableRows } from "../validators/duplicate-detector";
import { getHistoryById, saveHistory } from "../persistence/history.repository";
import { getSnapshot, saveSnapshot } from "../persistence/snapshot.repository";
import { DATABASE_KEY, EMI_KEY, emitDatabaseRefresh, readModuleRecords, restoreStorage, writeModuleRecords } from "./storage-adapter.service";
import { normalizeImportError } from "./error-normalizer.service";

function dateValue(record: Record<string, unknown>): unknown {
  return record.date ?? record.dueDate ?? record.startDate ?? record.billingDate ?? record.purchaseDate;
}

function withAuditFields(record: Record<string, unknown>, existing?: Record<string, unknown>): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    ...existing,
    ...record,
    id: String(existing?.id ?? record.id ?? createId("rec")),
    createdAt: String(existing?.createdAt ?? record.createdAt ?? now),
    updatedAt: now,
    importSource: "enterprise-bulk-import",
  };
}

export function mergeRecords(module: ImportModule, existing: unknown[], rows: ParsedRow[], options: ImportOptions): { records: unknown[]; inserted: number; updated: number; skipped: number } {
  const source = existing.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
  const importable = selectImportableRows(rows, options.duplicateStrategy);
  const incoming = options.mode === "update-existing" ? importable.filter((row) => row.status === "duplicate-database") : importable;
  let records = options.mode === "replace-period"
    ? source.filter((record) => !isInPeriod(dateValue(record), options.periodStart, options.periodEnd))
    : [...source];
  let inserted = 0;
  let updated = 0;

  for (const row of incoming) {
    const identity = identityHash(module, row.normalized);
    const index = records.findIndex((item) => item && typeof item === "object" && identityHash(module, item as Record<string, unknown>) === identity);
    const shouldUpdate = index >= 0 && (options.mode === "update-existing" || options.duplicateStrategy === "update");
    if (shouldUpdate) {
      records[index] = withAuditFields(row.normalized, records[index] as Record<string, unknown>);
      updated += 1;
    } else {
      records.push(withAuditFields(row.normalized));
      inserted += 1;
    }
  }
  return { records, inserted, updated, skipped: rows.length - incoming.length };
}

export async function executeImport(input: {
  options: ImportOptions;
  rows: ParsedRow[];
  fileName: string;
  fileHash: string;
  actor: string;
}): Promise<TransactionResult> {
  if (input.rows.length === 0) throw new Error("The import does not contain any data rows.");
  if (input.rows.some((row) => row.status === "error")) throw new Error("Every validation error must be resolved before the transaction can begin.");
  const started = performance.now();
  const importId = createId("import");
  const snapshotId = createId("snapshot");
  const existing = await readModuleRecords(input.options.module);
  const summary: ImportSummary = {
    total: input.rows.length,
    valid: input.rows.filter((row) => row.status === "valid").length,
    errors: input.rows.filter((row) => row.status === "error").length,
    duplicates: input.rows.filter((row) => row.status.startsWith("duplicate")).length,
    inserted: 0,
    updated: 0,
    skipped: 0,
  };
  const history: ImportHistoryRecord = {
    id: importId,
    snapshotId,
    fileName: input.fileName,
    fileHash: input.fileHash,
    module: input.options.module,
    mode: input.options.mode,
    status: "importing",
    actor: input.actor,
    startedAt: new Date().toISOString(),
    summary,
    rollbackAvailable: false,
  };
  await saveHistory(history);
  const snapshot: ImportSnapshot = {
    id: snapshotId,
    importId,
    createdAt: new Date().toISOString(),
    databaseJson: localStorage.getItem(DATABASE_KEY),
    emiJson: localStorage.getItem(EMI_KEY),
    extensionData: existing,
  };
  await saveSnapshot(snapshot);

  try {
    const result = mergeRecords(input.options.module, existing, input.rows, input.options);
    await writeModuleRecords(input.options.module, result.records);
    Object.assign(summary, { inserted: result.inserted, updated: result.updated, skipped: result.skipped });
    await saveHistory({ ...history, status: "completed", completedAt: new Date().toISOString(), durationMs: performance.now() - started, summary, rollbackAvailable: true });
    emitDatabaseRefresh(input.options.module, importId);
    return { importId, snapshotId, summary };
  } catch (error) {
    await restoreStorage(snapshot.databaseJson, snapshot.emiJson, input.options.module, snapshot.extensionData);
    const normalized = normalizeImportError(error);
    await saveHistory({ ...history, status: "failed", completedAt: new Date().toISOString(), durationMs: performance.now() - started, summary, errorMessage: normalized.message, rollbackAvailable: false });
    throw normalized;
  }
}

export async function rollbackImport(importId: string): Promise<void> {
  const history = await getHistoryById(importId);
  if (!history?.snapshotId || !history.rollbackAvailable) throw new Error("This import does not have an available rollback snapshot.");
  const snapshot = await getSnapshot(history.snapshotId);
  if (!snapshot) throw new Error("The rollback snapshot could not be found.");
  await restoreStorage(snapshot.databaseJson, snapshot.emiJson, history.module, snapshot.extensionData);
  await saveHistory({ ...history, status: "rolled-back", rollbackAvailable: false });
  emitDatabaseRefresh(history.module, history.id);
}
