import * as XLSX from "xlsx";
import type { ImportModule } from "../types/import.types";
import { TEMPLATE_DEFINITIONS } from "../templates/template-definitions";

const VALID_VALUES: Partial<Record<ImportModule, Record<string, string[]>>> = {
  category: { Type: ["income", "expense"] },
  bill: { Status: ["pending", "paid"] },
  recurring: { Type: ["income", "expense"], Frequency: ["daily", "weekly", "monthly", "quarterly", "yearly"] },
  account: { Currency: ["INR", "USD", "EUR", "GBP"] },
};

export function createTemplateWorkbook(module: ImportModule): XLSX.WorkBook {
  const definition = TEMPLATE_DEFINITIONS[module];
  const example = Object.fromEntries(definition.columns.map((item) => [item.label, item.example]));
  const worksheet = XLSX.utils.json_to_sheet([example], { header: definition.columns.map((item) => item.label) });
  worksheet["!cols"] = definition.columns.map((item) => ({ wch: Math.max(item.label.length, item.description.length, 16) }));
  const instructions = XLSX.utils.json_to_sheet(
    definition.columns.map((item) => ({
      Column: item.label,
      Required: item.required ? "Yes" : "No",
      Description: item.description,
      Example: item.example,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, definition.displayName.slice(0, 31));
  XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");
  const validValues = VALID_VALUES[module];
  if (validValues) {
    const columns = Object.entries(validValues);
    const maximum = Math.max(...columns.map(([, values]) => values.length));
    const rows = Array.from({ length: maximum }, (_, index) => Object.fromEntries(columns.map(([key, values]) => [key, values[index] ?? ""])));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Valid Values");
  }
  workbook.Props = { Title: `SFM PRO ${definition.displayName} Import Template`, Company: "SFM PRO Enterprise" };
  return workbook;
}

export function downloadTemplate(module: ImportModule): void {
  XLSX.writeFile(createTemplateWorkbook(module), `sfm-pro-${module}-import-template.xlsx`, { compression: true });
}
