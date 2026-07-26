import { create } from "zustand";
import type { DuplicateStrategy, ImportMode, ImportModule, ImportStatus, ParsedRow, ParsedWorkbook } from "../types/import.types";

type View = "import" | "history" | "templates";

interface ImportState {
  view: View;
  module: ImportModule;
  mode: ImportMode;
  duplicateStrategy: DuplicateStrategy;
  status: ImportStatus;
  file: File | null;
  workbook: ParsedWorkbook | null;
  rows: ParsedRow[];
  progress: number;
  progressMessage: string;
  error: string | null;
  periodStart: string;
  periodEnd: string;
  setView: (view: View) => void;
  setModule: (module: ImportModule) => void;
  setMode: (mode: ImportMode) => void;
  setDuplicateStrategy: (strategy: DuplicateStrategy) => void;
  setStatus: (status: ImportStatus) => void;
  setFile: (file: File | null) => void;
  setWorkbook: (workbook: ParsedWorkbook | null) => void;
  setRows: (rows: ParsedRow[]) => void;
  setProgress: (progress: number, message?: string) => void;
  setError: (error: string | null) => void;
  setPeriod: (start: string, end: string) => void;
  reset: () => void;
}

const initial = {
  view: "import" as View,
  module: "income" as ImportModule,
  mode: "append" as ImportMode,
  duplicateStrategy: "skip" as DuplicateStrategy,
  status: "draft" as ImportStatus,
  file: null,
  workbook: null,
  rows: [] as ParsedRow[],
  progress: 0,
  progressMessage: "",
  error: null as string | null,
  periodStart: "",
  periodEnd: "",
};

export const useImportStore = create<ImportState>((set) => ({
  ...initial,
  setView: (view) => set({ view }),
  setModule: (module) => set({ module, rows: [], workbook: null, status: "draft", error: null }),
  setMode: (mode) => set({ mode }),
  setDuplicateStrategy: (duplicateStrategy) => set({ duplicateStrategy }),
  setStatus: (status) => set({ status }),
  setFile: (file) => set({ file, rows: [], workbook: null, status: "draft", error: null }),
  setWorkbook: (workbook) => set({ workbook }),
  setRows: (rows) => set({ rows }),
  setProgress: (progress, progressMessage = "") => set({ progress, progressMessage }),
  setError: (error) => set({ error }),
  setPeriod: (periodStart, periodEnd) => set({ periodStart, periodEnd }),
  reset: () => set({ ...initial }),
}));
