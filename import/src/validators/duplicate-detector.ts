import type { DuplicateStrategy, ImportModule, ParsedRow } from "../types/import.types";
import { fastHash } from "../lib/hash";

export function identityHash(module: ImportModule, row: Record<string, unknown>): string {
  return fastHash({
    module,
    date: row.date ?? row.dueDate ?? row.startDate ?? row.billingDate ?? row.purchaseDate ?? `${row.year ?? ""}-${row.month ?? ""}`,
    amount: row.amount ?? row.monthlyAmount ?? row.investedAmount ?? row.balance ?? row.limit ?? row.purchaseValue ?? "",
    category: row.category ?? row.type ?? "",
    account: row.account ?? row.institution ?? row.bank ?? row.bankName ?? "",
    reference: row.reference ?? row.cardType ?? row.frequency ?? row.key ?? "",
    description: row.description ?? row.title ?? row.name ?? row.source ?? row.cardName ?? row.loanName ?? "",
  });
}

export function detectDuplicates(module: ImportModule, rows: ParsedRow[], existing: unknown[]): ParsedRow[] {
  const existingMap = new Map<string, string>();
  for (const item of existing) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    existingMap.set(identityHash(module, record), String(record.id ?? "database"));
  }
  const seen = new Map<string, number>();
  return rows.map((row) => {
    if (row.status === "error") return row;
    const identity = identityHash(module, row.normalized);
    if (seen.has(identity)) return { ...row, status: "duplicate-file", duplicateOf: `row ${seen.get(identity)}` };
    seen.set(identity, row.rowNumber);
    if (existingMap.has(identity)) return { ...row, status: "duplicate-database", duplicateOf: existingMap.get(identity) };
    return row;
  });
}

export function selectImportableRows(rows: ParsedRow[], strategy: DuplicateStrategy): ParsedRow[] {
  return rows.filter((row) => {
    if (row.status === "error" || row.status === "duplicate-file") return false;
    if (row.status === "duplicate-database") return strategy !== "skip";
    return true;
  });
}
