import { describe, expect, it } from "vitest";
import { detectDuplicates, selectImportableRows } from "../src/validators/duplicate-detector";
import { validateRows } from "../src/validators/row-validator";

describe("duplicate detection", () => {
  it("identifies workbook and database duplicates", () => {
    const rows = validateRows("income", "Income", [
      { Date: "2026-07-01", Source: "Salary", Category: "Job", Amount: 100 },
      { Date: "2026-07-01", Source: "Salary", Category: "Job", Amount: 100 },
    ]);
    const detected = detectDuplicates("income", rows, [{ id: "old", date: "2026-07-01", source: "Salary", category: "Job", amount: 100 }]);
    expect(detected[0].status).toBe("duplicate-database");
    expect(detected[1].status).toBe("duplicate-file");
    expect(selectImportableRows(detected, "skip")).toHaveLength(0);
    expect(selectImportableRows(detected, "update")).toHaveLength(1);
  });
});
