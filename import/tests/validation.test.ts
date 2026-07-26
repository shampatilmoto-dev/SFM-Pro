import { describe, expect, it } from "vitest";
import { mapHeaders, validateRows } from "../src/validators/row-validator";

describe("row validation", () => {
  it("maps human-readable template headers to canonical fields", () => {
    expect(mapHeaders("income", { Date: "2026-07-01", Source: "Salary", Category: "Job", Amount: "90000" })).toEqual({ date: "2026-07-01", source: "Salary", category: "Job", amount: "90000" });
  });

  it("normalizes dates and numeric amounts", () => {
    const [row] = validateRows("income", "Income", [{ Date: "01/07/2026", Source: "Salary", Category: "Job", Amount: "90000" }]);
    expect(row.status).toBe("valid");
    expect(row.normalized).toMatchObject({ date: "2026-07-01", amount: 90000 });
  });

  it("reports row and column for invalid records", () => {
    const [row] = validateRows("expense", "Expenses", [{ Date: "bad", Title: "", Category: "Food", Amount: -4 }]);
    expect(row.status).toBe("error");
    expect(row.errors.some((error) => error.column === "date" && error.row === 2)).toBe(true);
    expect(row.errors.some((error) => error.column === "amount")).toBe(true);
  });
});
