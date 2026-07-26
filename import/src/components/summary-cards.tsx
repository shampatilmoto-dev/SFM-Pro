import { AlertTriangle, CheckCircle2, Clock3, Copy, Pencil, Plus, Rows3, SkipForward } from "lucide-react";
import type { ParsedRow } from "../types/import.types";
import { useImportStore } from "../store/import.store";

export function SummaryCards({ rows }: { rows: ParsedRow[] }) {
  const { duplicateStrategy, mode, workbook } = useImportStore();
  const fileDuplicates = rows.filter((row) => row.status === "duplicate-file").length;
  const databaseDuplicates = rows.filter((row) => row.status === "duplicate-database").length;
  const errors = rows.filter((row) => row.status === "error").length;
  const updates = duplicateStrategy === "update" || mode === "update-existing" ? databaseDuplicates : 0;
  const newRows = rows.filter((row) => row.status === "valid").length + (duplicateStrategy === "create" && mode !== "update-existing" ? databaseDuplicates : 0);
  const skipped = errors + fileDuplicates + (duplicateStrategy === "skip" ? databaseDuplicates : 0);
  const estimatedMs = Math.max(150, (workbook?.parseDurationMs ?? 0) + rows.length / 25);
  const items = [
    { label: "Total rows", value: rows.length, icon: Rows3, color: "text-slate-600", background: "bg-slate-100" },
    { label: "Valid", value: rows.filter((row) => row.status === "valid").length, icon: CheckCircle2, color: "text-emerald-600", background: "bg-emerald-50" },
    { label: "Errors", value: errors, icon: AlertTriangle, color: "text-red-600", background: "bg-red-50" },
    { label: "Duplicates", value: fileDuplicates + databaseDuplicates, icon: Copy, color: "text-amber-600", background: "bg-amber-50" },
    { label: "New rows", value: newRows, icon: Plus, color: "text-blue-600", background: "bg-blue-50" },
    { label: "Updated rows", value: updates, icon: Pencil, color: "text-violet-600", background: "bg-violet-50" },
    { label: "Skipped rows", value: skipped, icon: SkipForward, color: "text-slate-600", background: "bg-slate-100" },
    { label: "Estimated time", value: `${Math.max(1, Math.ceil(estimatedMs / 1000))}s`, icon: Clock3, color: "text-cyan-600", background: "bg-cyan-50" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className={`rounded-lg p-2 ${item.background} ${item.color}`}><item.icon size={19} /></span>
          <div><p className="text-xs font-medium text-slate-500">{item.label}</p><p className="text-xl font-bold text-slate-900">{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</p></div>
        </div>
      ))}
    </div>
  );
}
