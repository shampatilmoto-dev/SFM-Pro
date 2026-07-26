import { describe, expect, it } from "vitest";
import { mergeRecords } from "../src/services/transaction.service";
import { detectDuplicates } from "../src/validators/duplicate-detector";
import { validateRows } from "../src/validators/row-validator";

describe("transaction merge", () => {
  const existing = [{ id: "one", date: "2026-07-01", source: "Salary", category: "Job", amount: 100, notes: "old" }];
  const validated = validateRows("income", "Income", [{ Date: "2026-07-01", Source: "Salary", Category: "Job", Amount: 100, Notes: "new" }]);
  const rows = detectDuplicates("income", validated, existing);

  it("updates matches without changing their identifiers", () => {
    const result = mergeRecords("income", existing, rows, { module: "income", mode: "update-existing", duplicateStrategy: "update" });
    expect(result.updated).toBe(1);
    expect(result.records[0]).toMatchObject({ id: "one", notes: "new" });
  });

  it("replaces only records inside the chosen period", () => {
    const valid = validateRows("income", "Income", [{ Date: "2026-07-15", Source: "Bonus", Category: "Job", Amount: 200 }]);
    const result = mergeRecords("income", [...existing, { id: "two", date: "2026-08-01", source: "Other", category: "Other", amount: 50 }], valid, { module: "income", mode: "replace-period", duplicateStrategy: "skip", periodStart: "2026-07-01", periodEnd: "2026-07-31" });
    expect(result.records).toHaveLength(2);
    expect(result.records).toEqual(expect.arrayContaining([expect.objectContaining({ id: "two" }), expect.objectContaining({ source: "Bonus" })]));
  });
});
