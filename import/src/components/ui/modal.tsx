import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export function Modal({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5"><div><h2 id="modal-title" className="text-lg font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div><Button variant="ghost" size="sm" aria-label="Close dialog" onClick={onClose}><X size={16} /></Button></div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
