export const IMPORT_MODULES = [
  "income",
  "expense",
  "budget",
  "loan",
  "creditcard",
  "emi",
  "investment",
  "account",
  "category",
  "bill",
  "recurring",
  "asset",
  "settings",
] as const;

export type ImportModule = (typeof IMPORT_MODULES)[number];
export type ImportMode = "append" | "replace-period" | "update-existing";
export type ImportStatus = "draft" | "validating" | "ready" | "importing" | "completed" | "failed" | "rolled-back";
export type RowStatus = "valid" | "error" | "duplicate-file" | "duplicate-database" | "selected-duplicate";
export type DuplicateStrategy = "skip" | "update" | "create";

export interface ImportError {
  code: string;
  row: number;
  column: string;
  value: unknown;
  message: string;
}

export interface ParsedRow {
  rowNumber: number;
  sheetName: string;
  data: Record<string, unknown>;
  normalized: Record<string, unknown>;
  hash: string;
  status: RowStatus;
  errors: ImportError[];
  duplicateOf?: string;
}

export interface ParsedWorkbook {
  fileName: string;
  fileHash: string;
  fileSize: number;
  sheets: string[];
  activeSheet: string;
  headers: string[];
  rows: Array<Record<string, unknown>>;
  sheetData: Array<{ name: string; headers: string[]; rows: Array<Record<string, unknown>> }>;
  totalRows: number;
  parseDurationMs: number;
}

export interface ImportSummary {
  total: number;
  valid: number;
  errors: number;
  duplicates: number;
  inserted: number;
  updated: number;
  skipped: number;
}

export interface ImportOptions {
  module: ImportModule;
  mode: ImportMode;
  duplicateStrategy: DuplicateStrategy;
  periodStart?: string;
  periodEnd?: string;
  sheetName?: string;
}

export interface ImportHistoryRecord {
  id: string;
  snapshotId?: string;
  fileName: string;
  fileHash: string;
  module: ImportModule;
  mode: ImportMode;
  status: ImportStatus;
  actor: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  summary: ImportSummary;
  errorMessage?: string;
  rollbackAvailable: boolean;
}

export interface ImportSnapshot {
  id: string;
  importId: string;
  createdAt: string;
  databaseJson: string | null;
  emiJson: string | null;
  extensionData: unknown[];
}

export interface TransactionResult {
  importId: string;
  snapshotId: string;
  summary: ImportSummary;
}

export interface TemplateColumn {
  key: string;
  label: string;
  required: boolean;
  description: string;
  example: string | number;
}

export interface TemplateDefinition {
  module: ImportModule;
  displayName: string;
  columns: TemplateColumn[];
}

export interface WorkerParseRequest {
  type: "parse";
  file: File;
  selectedSheet?: string;
}

export type WorkerParseResponse =
  | { type: "progress"; progress: number; message: string }
  | { type: "parsed"; workbook: ParsedWorkbook }
  | { type: "error"; code: string; message: string };

export interface SfmDatabase {
  profile?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  income?: unknown[];
  expenses?: unknown[];
  budgets?: unknown[];
  loans?: unknown[];
  investments?: unknown[];
  creditcards?: unknown[];
  transactions?: unknown[];
  reminders?: unknown[];
  goals?: unknown[];
  categories?: unknown[];
  reports?: unknown[];
  [key: string]: unknown;
}
