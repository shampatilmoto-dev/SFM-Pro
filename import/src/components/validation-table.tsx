import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ParsedRow, RowStatus } from "../types/import.types";
import { Badge } from "./ui/badge";

const statusVariant: Record<RowStatus, "valid" | "error" | "warning" | "info"> = {
  valid: "valid", error: "error", "duplicate-file": "warning", "duplicate-database": "warning", "selected-duplicate": "info",
};

export function ValidationTable({ rows }: { rows: ParsedRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"all" | "valid" | "error" | "duplicates">("all");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 500 });
  const filtered = useMemo(() => rows.filter((row) => filter === "all" || (filter === "duplicates" ? row.status.startsWith("duplicate") : row.status === filter)), [rows, filter]);
  const dataKeys = useMemo(() => Array.from(new Set(rows.slice(0, 200).flatMap((row) => Object.keys(row.normalized)))).slice(0, 12), [rows]);
  const columns = useMemo(() => {
    const helper = createColumnHelper<ParsedRow>();
    return [
      helper.accessor("rowNumber", { header: "Row", cell: (info) => info.getValue() }),
      helper.accessor("sheetName", { header: "Sheet", cell: (info) => info.getValue() }),
      helper.accessor("status", { header: "Status", cell: (info) => <Badge variant={statusVariant[info.getValue()]}>{info.getValue().replaceAll("-", " ")}</Badge> }),
      ...dataKeys.map((key) => helper.accessor((row) => row.normalized[key], { id: key, header: key, cell: (info) => String(info.getValue() ?? "") })),
      helper.display({ id: "message", header: "Message", cell: (info) => info.row.original.errors.map((error) => error.message).join("; ") || (info.row.original.duplicateOf ? `Matches ${info.row.original.duplicateOf}` : "") }),
    ];
  }, [dataKeys]);
  const table = useReactTable({
    data: filtered,
    columns,
    state: { globalFilter: search, sorting, pagination },
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
  });
  const tableRows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({ count: tableRows.length, getScrollElement: () => parentRef.current, estimateSize: () => 43, overscan: 12 });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><div><h2 className="font-semibold text-slate-900">Validation preview</h2><p className="text-xs text-slate-500">Sortable, searchable, resizable virtual preview of {filtered.length.toLocaleString()} rows</p></div><div className="flex flex-wrap gap-2"><label className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={14} /><span className="sr-only">Search rows</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search rows" className="field w-52 pl-9" /></label><select value={filter} onChange={(event) => { setFilter(event.target.value as typeof filter); table.setPageIndex(0); }} className="field w-40"><option value="all">All rows</option><option value="valid">Valid</option><option value="error">Errors</option><option value="duplicates">Duplicates</option></select><select value={pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))} className="field w-32"><option value="100">100 / page</option><option value="500">500 / page</option><option value="1000">1,000 / page</option></select></div></div>
      <div ref={parentRef} className="h-[430px] overflow-auto">
        <table className="min-w-full table-fixed text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="relative whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-600" style={{ width: header.getSize(), minWidth: header.getSize() }}><button className={header.column.getCanSort() ? "cursor-pointer select-none" : ""} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}</button>{header.column.getCanResize() && <span onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} className="absolute right-0 top-2 h-7 w-1 cursor-col-resize rounded bg-slate-200 hover:bg-blue-500" />}</th>)}</tr>)}</thead>
          <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index];
              return <tr key={row.id} className="absolute left-0 top-0 flex w-max min-w-full border-b border-slate-100 bg-white hover:bg-slate-50" style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}>{row.getVisibleCells().map((cell) => <td key={cell.id} className="w-40 min-w-40 max-w-60 truncate px-3 py-3 text-slate-700" title={String(cell.getValue() ?? "")}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600"><span>Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())} · {table.getFilteredRowModel().rows.length.toLocaleString()} matching rows</span><div className="flex gap-2"><button className="rounded border border-slate-200 p-2 disabled:opacity-40" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft size={14} /></button><button className="rounded border border-slate-200 p-2 disabled:opacity-40" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight size={14} /></button></div></div>
    </div>
  );
}
