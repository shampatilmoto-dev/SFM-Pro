import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ImportHistoryRecord, ImportSnapshot } from "../types/import.types";

interface ImportCenterDatabase extends DBSchema {
  history: {
    key: string;
    value: ImportHistoryRecord;
    indexes: { "by-started-at": string; "by-status": string };
  };
  snapshots: {
    key: string;
    value: ImportSnapshot;
    indexes: { "by-import-id": string };
  };
  extensions: {
    key: string;
    value: { key: string; module: string; records: unknown[]; updatedAt: string };
    indexes: { "by-module": string };
  };
}

let databasePromise: Promise<IDBPDatabase<ImportCenterDatabase>> | null = null;

export function getImportDatabase(): Promise<IDBPDatabase<ImportCenterDatabase>> {
  if (!databasePromise) {
    databasePromise = openDB<ImportCenterDatabase>("sfm-pro-import-center", 1, {
      upgrade(database) {
        const history = database.createObjectStore("history", { keyPath: "id" });
        history.createIndex("by-started-at", "startedAt");
        history.createIndex("by-status", "status");
        const snapshots = database.createObjectStore("snapshots", { keyPath: "id" });
        snapshots.createIndex("by-import-id", "importId");
        const extensions = database.createObjectStore("extensions", { keyPath: "key" });
        extensions.createIndex("by-module", "module");
      },
    });
  }
  return databasePromise;
}

export function resetImportDatabaseConnection(): void {
  databasePromise = null;
}
