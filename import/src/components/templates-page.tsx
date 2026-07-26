import { Download, FileSpreadsheet } from "lucide-react";
import { DOWNLOADABLE_TEMPLATE_MODULES, TEMPLATE_DEFINITIONS } from "../templates/template-definitions";
import { downloadTemplate } from "../services/template.service";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";

export function TemplatesPage() {
  return <Card><CardHeader><h2 className="font-semibold text-slate-900">Import templates</h2><p className="mt-1 text-sm text-slate-500">Every workbook includes an example row and a field-level instructions sheet.</p></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{DOWNLOADABLE_TEMPLATE_MODULES.map((module) => { const definition = TEMPLATE_DEFINITIONS[module]; return <div key={module} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50/30"><div className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><FileSpreadsheet size={19} /></span><div className="min-w-0"><p className="font-semibold text-slate-800">{definition.displayName}</p><p className="text-xs text-slate-500">{definition.columns.length} mapped fields</p></div></div><Button variant="secondary" size="sm" aria-label={`Download ${definition.displayName} template`} onClick={() => downloadTemplate(module)}><Download size={14} /></Button></div>; })}</div><div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800"><strong>Future-ready:</strong> Settings imports are validated by the engine but intentionally have no downloadable template until the settings migration contract is approved.</div></CardContent></Card>;
}
