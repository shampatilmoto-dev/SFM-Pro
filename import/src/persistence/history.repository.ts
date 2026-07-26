import type { ImportHistoryRecord } from "../types/import.types";
import { getImportDatabase } from "./import-db";

export async function saveHistory(record: ImportHistoryRecord): Promise<void> {
  const database = await getImportDatabase();
  await database.put("history", record);
}

export async function getHistory(): Promise<ImportHistoryRecord[]> {
  const database = await getImportDatabase();
  const records = await database.getAllFromIndex("history", "by-started-at");
  return records.reverse();
}

export async function getHistoryById(id: string): Promise<ImportHistoryRecord | undefined> {
  const database = await getImportDatabase();
  return database.get("history", id);
}

export async function clearHistory(): Promise<void> {
  const database = await getImportDatabase();
  const transaction = database.transaction(["history", "snapshots"], "readwrite");
  await Promise.all([transaction.objectStore("history").clear(), transaction.objectStore("snapshots").clear(), transaction.done]);
}
