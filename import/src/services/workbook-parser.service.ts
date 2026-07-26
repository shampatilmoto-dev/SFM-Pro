import type { ParsedWorkbook, WorkerParseResponse } from "../types/import.types";

const ALLOWED_EXTENSIONS = new Set(["xlsx", "xls", "csv"]);
export const MAX_FILE_SIZE = 250 * 1024 * 1024;

export function validateImportFile(file: File): void {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) throw new Error("Select an .xlsx, .xls, or .csv file.");
  if (file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_FILE_SIZE) throw new Error("The file exceeds the 250 MB browser import limit.");
}

export function parseWorkbook(file: File, selectedSheet?: string, onProgress?: (progress: number, message: string) => void): Promise<ParsedWorkbook> {
  validateImportFile(file);
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/workbook.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerParseResponse>) => {
      if (event.data.type === "progress") onProgress?.(event.data.progress, event.data.message);
      if (event.data.type === "parsed") {
        worker.terminate();
        resolve(event.data.workbook);
      }
      if (event.data.type === "error") {
        worker.terminate();
        reject(new Error(event.data.message));
      }
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || "The workbook worker stopped unexpectedly."));
    };
    worker.postMessage({ type: "parse", file, selectedSheet });
  });
}
