import { describe, expect, it } from "vitest";
import { createTemplateWorkbook } from "../src/services/template.service";
import { errorRows } from "../src/services/error-report.service";
import { validateRows } from "../src/validators/row-validator";

describe("templates and error reports", () => {
  it("generates data and instruction worksheets", () => {
    expect(createTemplateWorkbook("creditcard").SheetNames).toEqual(["Credit Card", "Instructions"]);
  });

  it("flattens rejected cells with their original values", () => {
    const rows = validateRows("budget", "Budget", [{ Category: "Food", Amount: -1, Month: 14, Year: 2026 }]);
    const report = errorRows(rows);
    expect(report.length).toBeGreaterThanOrEqual(2);
    expect(report[0]).toHaveProperty("Sheet", "Budget");
    expect(report[0]).toHaveProperty("Code", "VALIDATION_FAILED");
  });
});
