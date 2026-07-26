import type { ImportSnapshot } from "../types/import.types";
import { getImportDatabase } from "./import-db";

export async function saveSnapshot(snapshot: ImportSnapshot): Promise<void> {
  const database = await getImportDatabase();
  await database.put("snapshots", snapshot);
}

export async function getSnapshot(id: string): Promise<ImportSnapshot | undefined> {
  const database = await getImportDatabase();
  return database.get("snapshots", id);
}

export async function deleteSnapshot(id: string): Promise<void> {
  const database = await getImportDatabase();
  await database.delete("snapshots", id);
}
