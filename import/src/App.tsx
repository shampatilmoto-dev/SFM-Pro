import { useState } from "react";
import { Download, History, Moon, ShieldCheck, Sun, Upload } from "lucide-react";
import { useImportStore } from "./store/import.store";
import { ImportPage } from "./components/import-page";
import { HistoryPage } from "./components/history-page";
import { TemplatesPage } from "./components/templates-page";
import { cn } from "./lib/utils";

export default function App() {
  const { view, setView } = useImportStore();
  const [darkMode, setDarkMode] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  const navigation = [{ id: "import" as const, label: "Import Center", icon: Upload }, { id: "history" as const, label: "Import History", icon: History }, { id: "templates" as const, label: "Templates", icon: Download }];
  return <div className={cn("min-h-screen bg-[#f5f7fb] text-slate-900", darkMode && "dark")}>
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm"><ShieldCheck size={22} /></span><div><p className="text-lg font-bold tracking-tight">SFM PRO Enterprise</p><p className="text-xs font-medium text-slate-500">Bulk Excel Import System</p></div></div><div className="flex items-center gap-2"><button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? "Use light mode" : "Use dark mode"}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button><div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Local-first · Atomic · Audited</div></div></div></header>
    <nav className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-5 lg:px-8">{navigation.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={cn("flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition", view === item.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800")}><item.icon size={16} />{item.label}</button>)}</div></nav>
    <main className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8"><div className="mb-5"><h1 className="text-2xl font-bold tracking-tight">{navigation.find((item) => item.id === view)?.label}</h1><p className="mt-1 text-sm text-slate-500">Validate, review, and commit high-volume financial records with complete rollback protection.</p></div>{view === "import" && <ImportPage />}{view === "history" && <HistoryPage />}{view === "templates" && <TemplatesPage />}</main>
  </div>;
}
