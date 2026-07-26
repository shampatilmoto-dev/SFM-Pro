import { useCallback } from "react";
import { useImportStore } from "../store/import.store";
import { parseWorkbook } from "../services/workbook-parser.service";
import { validateRows } from "../validators/row-validator";
import { detectDuplicates } from "../validators/duplicate-detector";
import { readModuleRecords } from "../services/storage-adapter.service";
import { executeImport } from "../services/transaction.service";
import { getImportActor } from "../services/auth-bridge.service";

export function useImportWorkflow() {
  const store = useImportStore();

  const parseAndValidate = useCallback(async (selectedSheet?: string) => {
    if (!store.file) return;
    store.setError(null);
    store.setStatus("validating");
    try {
      const workbook = await parseWorkbook(store.file, selectedSheet, store.setProgress);
      store.setWorkbook(workbook);
      store.setProgress(88, "Validating rows");
      const validated = workbook.sheetData.flatMap((sheet) => validateRows(store.module, sheet.name, sheet.rows));
      const existing = await readModuleRecords(store.module);
      const rows = detectDuplicates(store.module, validated, existing);
      store.setRows(rows);
      store.setProgress(100, "Validation complete");
      store.setStatus("ready");
    } catch (error) {
      store.setStatus("failed");
      store.setError(error instanceof Error ? error.message : "The file could not be validated.");
    }
  }, [store.file, store.module]);

  const commit = useCallback(async () => {
    if (!store.file || !store.workbook || store.rows.length === 0) return;
    if (store.rows.some((row) => row.status === "error")) {
      store.setError("Resolve every validation error before importing. No rows were written.");
      return;
    }
    if (store.mode === "replace-period" && (!store.periodStart || !store.periodEnd)) {
      store.setError("Choose a start and end date for replace-period mode.");
      return;
    }
    store.setError(null);
    store.setStatus("importing");
    store.setProgress(5, "Creating rollback snapshot");
    try {
      await executeImport({
        options: {
          module: store.module,
          mode: store.mode,
          duplicateStrategy: store.duplicateStrategy,
          periodStart: store.periodStart || undefined,
          periodEnd: store.periodEnd || undefined,
          sheetName: store.workbook.activeSheet,
        },
        rows: store.rows,
        fileName: store.file.name,
        fileHash: store.workbook.fileHash,
        actor: getImportActor(),
      });
      store.setProgress(100, "Import committed");
      store.setStatus("completed");
    } catch (error) {
      store.setStatus("failed");
      store.setError(error instanceof Error ? error.message : "Import failed. The previous data was restored.");
    }
  }, [store]);

  return { parseAndValidate, commit };
}
