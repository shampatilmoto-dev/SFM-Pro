import { useCallback, useEffect, useState } from "react";
import { ArchiveRestore, Clock3, RefreshCw } from "lucide-react";
import type { ImportHistoryRecord } from "../types/import.types";
import { getHistory } from "../persistence/history.repository";
import { rollbackImport } from "../services/transaction.service";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Modal } from "./ui/modal";
import { formatDuration } from "../lib/utils";

export function HistoryPage() {
  const [records, setRecords] = useState<ImportHistoryRecord[]>([]);
  const [selected, setSelected] = useState<ImportHistoryRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => setRecords(await getHistory()), []);
  useEffect(() => { void load(); }, [load]);
  const rollback = async () => {
    if (!selected) return;
    try { await rollbackImport(selected.id); setSelected(null); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Rollback failed."); }
  };

  return <div className="space-y-5">
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <Card><CardHeader className="flex flex-row items-center justify-between"><div><h2 className="font-semibold text-slate-900">Import audit history</h2><p className="mt-1 text-sm text-slate-500">File hashes, actors, results, durations, and rollback availability.</p></div><Button variant="secondary" size="sm" onClick={() => void load()}><RefreshCw size={15} />Refresh</Button></CardHeader><CardContent className="p-0">
      {records.length === 0 ? <div className="py-20 text-center"><Clock3 className="mx-auto text-slate-300" size={36} /><p className="mt-3 font-medium text-slate-600">No imports recorded yet</p></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Date / file</th><th className="px-4 py-3">Module</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{records.map((record) => <tr key={record.id} className="hover:bg-slate-50"><td className="px-4 py-3"><p className="font-medium text-slate-800">{record.fileName}</p><p className="text-xs text-slate-500">{new Date(record.startedAt).toLocaleString()} · {record.fileHash.slice(0, 12)}</p></td><td className="px-4 py-3 capitalize">{record.module}</td><td className="px-4 py-3"><Badge variant={record.status === "completed" ? "valid" : record.status === "failed" ? "error" : "warning"}>{record.status}</Badge></td><td className="px-4 py-3 text-xs text-slate-600">+{record.summary.inserted} / ~{record.summary.updated} / {record.summary.skipped} skipped</td><td className="px-4 py-3 text-slate-600">{record.actor}</td><td className="px-4 py-3 text-slate-600">{formatDuration(record.durationMs)}</td><td className="px-4 py-3 text-right"><Button variant="secondary" size="sm" disabled={!record.rollbackAvailable} onClick={() => setSelected(record)}><ArchiveRestore size={14} />Rollback</Button></td></tr>)}</tbody></table></div>}
    </CardContent></Card>
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Restore pre-import snapshot" description="This replaces the affected data with its exact state before the selected import."><p className="text-sm text-slate-600">Rollback <strong>{selected?.fileName}</strong>? The current post-import records for this module will be replaced.</p><div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button><Button variant="danger" onClick={() => void rollback()}>Restore snapshot</Button></div></Modal>
  </div>;
}
