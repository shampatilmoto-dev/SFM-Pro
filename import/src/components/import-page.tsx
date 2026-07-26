import { useState } from "react";
import { AlertCircle, CheckCircle2, Download, RefreshCw, ShieldCheck } from "lucide-react";
import { useImportStore } from "../store/import.store";
import { useImportWorkflow } from "../hooks/use-import-workflow";
import { WorkflowStepper } from "./workflow-stepper";
import { UploadPanel } from "./upload-panel";
import { SummaryCards } from "./summary-cards";
import { ValidationTable } from "./validation-table";
import { ImportOptions } from "./import-options";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Progress } from "./ui/progress";
import { Modal } from "./ui/modal";
import { downloadErrorReport } from "../services/error-report.service";

function activeStep(status: string, hasRows: boolean): number {
  if (status === "completed") return 4;
  if (status === "importing") return 3;
  if (hasRows) return 2;
  if (status === "validating") return 1;
  return 0;
}

export function ImportPage() {
  const store = useImportStore();
  const { parseAndValidate, commit } = useImportWorkflow();
  const [confirming, setConfirming] = useState(false);
  const errorCount = store.rows.filter((row) => row.status === "error").length;
  const importable = store.rows.length - errorCount - store.rows.filter((row) => row.status === "duplicate-file" || (row.status === "duplicate-database" && store.duplicateStrategy === "skip")).length;

  return (
    <div className="space-y-5">
      <Card><CardContent><WorkflowStepper active={activeStep(store.status, store.rows.length > 0)} /></CardContent></Card>
      <UploadPanel />
      {(store.status === "validating" || store.status === "importing") && <Card><CardContent className="space-y-3"><div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{store.progressMessage}</span><span className="text-slate-500">{store.progress}%</span></div><Progress value={store.progress} /></CardContent></Card>}
      {store.error && <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={18} /><span>{store.error}</span></div>}
      {store.status === "completed" && <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><div><p className="font-semibold">Import completed atomically</p><p>The application was notified to refresh its data. A rollback snapshot is available in Import History.</p></div></div>}
      {store.rows.length > 0 && <>
        <SummaryCards rows={store.rows} />
        {store.workbook && store.workbook.sheets.length > 1 && <Card><CardContent><p className="text-sm font-semibold text-slate-800">Worksheets processed</p><div className="mt-2 flex flex-wrap gap-2">{store.workbook.sheetData.map((sheet) => <span key={sheet.name} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{sheet.name} · {sheet.rows.length.toLocaleString()} rows</span>)}</div></CardContent></Card>}
        <ValidationTable rows={store.rows} />
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900">Commit controls</h2><p className="mt-1 text-sm text-slate-500">All rows are committed together. Any write failure restores the snapshot.</p></CardHeader>
          <CardContent className="space-y-5"><ImportOptions /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div className="flex flex-wrap gap-2">{errorCount > 0 && <><Button variant="secondary" size="sm" onClick={() => downloadErrorReport(store.rows, "xlsx")}><Download size={15} />Errors XLSX</Button><Button variant="secondary" size="sm" onClick={() => downloadErrorReport(store.rows, "csv")}><Download size={15} />Errors CSV</Button></>}</div><div className="flex gap-2"><Button variant="secondary" onClick={() => store.reset()}><RefreshCw size={16} />Start over</Button><Button onClick={() => setConfirming(true)} disabled={errorCount > 0 || importable <= 0 || store.status === "importing"}><ShieldCheck size={16} />Review and import {Math.max(0, importable).toLocaleString()} rows</Button></div></div></CardContent>
        </Card>
      </>}
      <Modal open={confirming} onClose={() => setConfirming(false)} title="Confirm atomic import" description="This action will create a rollback snapshot before changing data.">
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm"><dt className="text-slate-500">Module</dt><dd className="font-semibold capitalize text-slate-800">{store.module}</dd><dt className="text-slate-500">Mode</dt><dd className="font-semibold text-slate-800">{store.mode}</dd><dt className="text-slate-500">Rows</dt><dd className="font-semibold text-slate-800">{importable.toLocaleString()}</dd><dt className="text-slate-500">Duplicates</dt><dd className="font-semibold text-slate-800">{store.duplicateStrategy}</dd></dl>
        <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button><Button onClick={() => { setConfirming(false); void commit(); }}>Confirm import</Button></div>
      </Modal>
    </div>
  );
}
