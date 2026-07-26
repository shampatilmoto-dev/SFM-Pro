import { describe, expect, it } from "vitest";
import { parseCsvText } from "../src/parsers/csv.parser";
import { validateRows } from "../src/validators/row-validator";

describe("large-file performance", () => {
  it("parses and validates 100,000 CSV rows", { timeout: 30000 }, () => {
    const count = 100_000;
    const csv = ["Date,Source,Category,Amount", ...Array.from({ length: count }, (_, index) => `2026-07-01,Source ${index},Salary,${index + 1}`)].join("\n");
    const started = performance.now();
    const parsed = parseCsvText(csv);
    const validated = validateRows("income", "CSV Data", parsed.rows);
    expect(validated).toHaveLength(count);
    expect(validated.every((row) => row.status === "valid")).toBe(true);
    expect(performance.now() - started).toBeLessThan(30_000);
  });
});
