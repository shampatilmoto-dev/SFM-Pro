/// <reference lib="webworker" />

import { read, utils } from "xlsx";
import { parseCsvText } from "../parsers/csv.parser";
import type { ParsedWorkbook, WorkerParseRequest, WorkerParseResponse } from "../types/import.types";

const workerScope: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerParseResponse): void {
  workerScope.postMessage(message);
}

function binaryHash(bytes: Uint8Array): string {
  let first = 2166136261;
  let second = 2246822519;
  for (let index = 0; index < bytes.length; index += 1) {
    first = Math.imul(first ^ bytes[index], 16777619);
    second = Math.imul(second ^ bytes[index], 3266489917);
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
}

function headersFromRows(rows: Array<Record<string, unknown>>): string[] {
  const headers = new Set<string>();
  for (const row of rows.slice(0, 200)) Object.keys(row).forEach((key) => headers.add(key));
  return Array.from(headers);
}

async function parseFile(file: File, selectedSheet?: string): Promise<ParsedWorkbook> {
  const started = performance.now();
  post({ type: "progress", progress: 10, message: "Reading file" });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileHash = binaryHash(bytes);
  post({ type: "progress", progress: 35, message: "Parsing workbook" });

  if (file.name.toLowerCase().endsWith(".csv")) {
    const result = parseCsvText(new TextDecoder("utf-8").decode(bytes));
    return {
      fileName: file.name,
      fileHash,
      fileSize: file.size,
      sheets: ["CSV Data"],
      activeSheet: "CSV Data",
      headers: result.headers,
      rows: result.rows,
      sheetData: [{ name: "CSV Data", headers: result.headers, rows: result.rows }],
      totalRows: result.rows.length,
      parseDurationMs: performance.now() - started,
    };
  }

  const workbook = read(bytes, { type: "array", cellDates: true, dense: true });
  const activeSheet = selectedSheet && workbook.SheetNames.includes(selectedSheet) ? selectedSheet : workbook.SheetNames[0];
  if (!activeSheet) throw new Error("The workbook does not contain a readable worksheet.");
  const sheetData = workbook.SheetNames.map((name, index) => {
    post({ type: "progress", progress: 40 + Math.round(((index + 1) / workbook.SheetNames.length) * 50), message: `Reading ${name}` });
    const rows = utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name], { defval: "", raw: true, blankrows: false });
    return { name, headers: headersFromRows(rows), rows };
  });
  const rows = sheetData.flatMap((sheet) => sheet.rows);
  return {
    fileName: file.name,
    fileHash,
    fileSize: file.size,
    sheets: workbook.SheetNames,
    activeSheet,
    headers: Array.from(new Set(sheetData.flatMap((sheet) => sheet.headers))),
    rows,
    sheetData,
    totalRows: rows.length,
    parseDurationMs: performance.now() - started,
  };
}

workerScope.addEventListener("message", async (event: MessageEvent<WorkerParseRequest>) => {
  if (event.data.type !== "parse") return;
  try {
    const workbook = await parseFile(event.data.file, event.data.selectedSheet);
    post({ type: "progress", progress: 100, message: "Workbook ready" });
    post({ type: "parsed", workbook });
  } catch (error) {
    post({ type: "error", code: "WORKBOOK_PARSE_FAILED", message: error instanceof Error ? error.message : "The workbook could not be parsed." });
  }
});
