import type { ImportModule, SfmDatabase } from "../types/import.types";
import { getImportDatabase } from "../persistence/import-db";

export const DATABASE_KEY = "SFM_DATABASE";
export const EMI_KEY = "sfm_emi_records";

const MODULE_KEYS: Partial<Record<ImportModule, keyof SfmDatabase>> = {
  income: "income",
  expense: "expenses",
  budget: "budgets",
  loan: "loans",
  investment: "investments",
  creditcard: "creditcards",
  category: "categories",
  recurring: "reminders",
};

export const EXTENSION_MODULES = new Set<ImportModule>(["account", "bill", "asset", "settings"]);

function parseArray(value: string | null): unknown[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Stored data has an invalid array shape.");
  return parsed;
}

export function readSfmDatabase(): SfmDatabase {
  const raw = localStorage.getItem(DATABASE_KEY);
  if (!raw) throw new Error("SFM PRO database is not initialized. Open the main application once before importing.");
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("SFM PRO database has an invalid shape.");
  return parsed as SfmDatabase;
}

export async function readModuleRecords(module: ImportModule): Promise<unknown[]> {
  if (module === "emi") return parseArray(localStorage.getItem(EMI_KEY));
  if (EXTENSION_MODULES.has(module)) {
    const database = await getImportDatabase();
    return (await database.get("extensions", module))?.records ?? [];
  }
  const database = readSfmDatabase();
  const key = MODULE_KEYS[module];
  const value = key ? database[key] : undefined;
  if (!Array.isArray(value)) throw new Error(`The ${module} collection is not available in the current database.`);
  return value;
}

export async function writeModuleRecords(module: ImportModule, records: unknown[]): Promise<void> {
  if (module === "emi") {
    localStorage.setItem(EMI_KEY, JSON.stringify(records));
    return;
  }
  if (EXTENSION_MODULES.has(module)) {
    const database = await getImportDatabase();
    await database.put("extensions", { key: module, module, records, updatedAt: new Date().toISOString() });
    return;
  }
  const database = readSfmDatabase();
  const key = MODULE_KEYS[module];
  if (!key) throw new Error(`No storage mapping exists for ${module}.`);
  database[key] = records;
  database.metadata = { ...(database.metadata ?? {}), updatedAt: new Date().toISOString() };
  localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
}

export async function restoreStorage(databaseJson: string | null, emiJson: string | null, module: ImportModule, extensionData: unknown[]): Promise<void> {
  if (databaseJson === null) localStorage.removeItem(DATABASE_KEY);
  else localStorage.setItem(DATABASE_KEY, databaseJson);
  if (emiJson === null) localStorage.removeItem(EMI_KEY);
  else localStorage.setItem(EMI_KEY, emiJson);
  if (EXTENSION_MODULES.has(module)) {
    const database = await getImportDatabase();
    await database.put("extensions", { key: module, module, records: extensionData, updatedAt: new Date().toISOString() });
  }
}

export function emitDatabaseRefresh(module: ImportModule, importId: string): void {
  const detail = { module, importId, source: "enterprise-import-center" };
  window.dispatchEvent(new CustomEvent("sfm-database-updated", { detail }));
  window.dispatchEvent(new CustomEvent("sfm-import-completed", { detail }));
  try {
    window.parent?.dispatchEvent(new CustomEvent("sfm-database-updated", { detail }));
  } catch {
    // Cross-origin embedding is intentionally ignored; same-origin hosting is expected.
  }
}
