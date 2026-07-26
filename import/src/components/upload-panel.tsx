import { useCallback, useState } from "react";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useImportStore } from "../store/import.store";
import { formatBytes } from "../lib/utils";
import { TEMPLATE_DEFINITIONS } from "../templates/template-definitions";
import type { ImportModule } from "../types/import.types";
import { useImportWorkflow } from "../hooks/use-import-workflow";

export function UploadPanel() {
  const store = useImportStore();
  const { parseAndValidate } = useImportWorkflow();
  const [dragging, setDragging] = useState(false);
  const acceptFile = useCallback((file?: File) => { if (file) store.setFile(file); }, [store.setFile]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div><h2 className="font-semibold text-slate-900">Upload workbook</h2><p className="mt-1 text-sm text-slate-500">XLSX, XLS, or CSV · up to 250 MB</p></div>
        <label className="text-sm font-medium text-slate-700">Target module
          <select value={store.module} onChange={(event) => store.setModule(event.target.value as ImportModule)} className="field mt-1 min-w-44">
            {Object.values(TEMPLATE_DEFINITIONS).map((definition) => <option key={definition.module} value={definition.module}>{definition.displayName}</option>)}
          </select>
        </label>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]); }}
        >
          <UploadCloud className="mb-3 text-blue-600" size={34} />
          <span className="font-semibold text-slate-800">Drop a spreadsheet here or browse</span>
          <span className="mt-1 text-sm text-slate-500">The file is processed locally in your browser</span>
          <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(event) => acceptFile(event.target.files?.[0])} />
        </label>
        {store.file && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3"><FileSpreadsheet className="text-emerald-600" /><div><p className="text-sm font-semibold text-slate-800">{store.file.name}</p><p className="text-xs text-slate-500">{formatBytes(store.file.size)}</p></div></div>
          <div className="flex gap-2"><Button onClick={() => void parseAndValidate()} disabled={store.status === "validating"}>Validate file</Button><Button variant="ghost" size="sm" aria-label="Remove file" onClick={() => store.setFile(null)}><X size={16} /></Button></div>
        </div>}
      </CardContent>
    </Card>
  );
}
