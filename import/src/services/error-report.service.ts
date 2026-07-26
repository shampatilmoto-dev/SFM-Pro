import * as XLSX from "xlsx";
import type { ParsedRow } from "../types/import.types";
import { downloadBlob } from "../lib/utils";

export function errorRows(rows: ParsedRow[]): Array<Record<string, unknown>> {
  return rows.flatMap((row) => row.errors.map((error) => ({
    "Original Row": JSON.stringify(row.data),
    Sheet: row.sheetName,
    Row: error.row,
    Column: error.column,
    Value: error.value ?? "",
    Code: error.code,
    Error: error.message,
    "Suggested Fix": `Correct ${error.column} using the module template and validation rules.`,
    "Rejected Reason": error.message,
  })));
}

export function downloadErrorReport(rows: ParsedRow[], format: "xlsx" | "csv"): void {
  const report = errorRows(rows);
  if (format === "csv") {
    const worksheet = XLSX.utils.json_to_sheet(report);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "sfm-pro-import-errors.csv");
    return;
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report), "Import Errors");
  XLSX.writeFile(workbook, "sfm-pro-import-errors.xlsx", { compression: true });
}
