import type { ImportError, ImportModule, ParsedRow } from "../types/import.types";
import { fastHash } from "../lib/hash";
import { TEMPLATE_DEFINITIONS } from "../templates/template-definitions";
import { getModuleSchema } from "./schemas";

function comparableHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function mapHeaders(module: ImportModule, row: Record<string, unknown>): Record<string, unknown> {
  const aliases = new Map<string, string>();
  for (const definition of TEMPLATE_DEFINITIONS[module].columns) {
    aliases.set(comparableHeader(definition.key), definition.key);
    aliases.set(comparableHeader(definition.label), definition.key);
  }
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const canonical = aliases.get(comparableHeader(key));
    if (canonical) mapped[canonical] = typeof value === "string" ? value.trim() : value;
  }
  return mapped;
}

export function validateRows(module: ImportModule, sheetName: string, rows: Record<string, unknown>[]): ParsedRow[] {
  const schema = getModuleSchema(module);
  return rows.map((data, index) => {
    const mapped = mapHeaders(module, data);
    const result = schema.safeParse(mapped);
    const errors: ImportError[] = result.success
      ? []
      : result.error.issues.map((issue) => ({
          code: "VALIDATION_FAILED",
          row: index + 2,
          column: String(issue.path[0] ?? "row"),
          value: mapped[String(issue.path[0] ?? "")],
          message: issue.message,
        }));
    const normalized = result.success ? result.data : mapped;
    return {
      rowNumber: index + 2,
      sheetName,
      data,
      normalized,
      hash: fastHash(normalized),
      status: errors.length ? "error" : "valid",
      errors,
    };
  });
}
