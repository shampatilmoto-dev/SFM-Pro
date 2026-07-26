import { describe, expect, it, vi } from "vitest";
import { executeImport, rollbackImport } from "../src/services/transaction.service";
import { getHistory } from "../src/persistence/history.repository";
import { validateRows } from "../src/validators/row-validator";

describe("history and rollback", () => {
  it("persists an audit record and restores the exact pre-import snapshot", async () => {
    const original = { income: [], expenses: [], budgets: [], loans: [], investments: [], creditcards: [], reminders: [], categories: [], metadata: { version: "3.0.0" } };
    localStorage.setItem("SFM_DATABASE", JSON.stringify(original));
    const rows = validateRows("income", "Income", [{ Date: "2026-07-01", Source: "Salary", Category: "Job", Amount: 100 }]);
    const result = await executeImport({ options: { module: "income", mode: "append", duplicateStrategy: "skip" }, rows, fileName: "income.xlsx", fileHash: "abc123", actor: "tester@example.com" });
    expect(JSON.parse(localStorage.getItem("SFM_DATABASE")!).income).toHaveLength(1);
    expect((await getHistory()).find((item) => item.id === result.importId)?.rollbackAvailable).toBe(true);
    await rollbackImport(result.importId);
    expect(localStorage.getItem("SFM_DATABASE")).toBe(JSON.stringify(original));
    expect((await getHistory()).find((item) => item.id === result.importId)?.status).toBe("rolled-back");
  });

  it("restores the prior state when the destination write fails", async () => {
    const original = { income: [], expenses: [], budgets: [], loans: [], investments: [], creditcards: [], reminders: [], categories: [], metadata: { version: "3.0.0" } };
    const originalJson = JSON.stringify(original);
    localStorage.setItem("SFM_DATABASE", originalJson);
    const rows = validateRows("income", "Income", [{ Date: "2026-07-01", Source: "Salary", Category: "Job", Amount: 100 }]);
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => { throw new DOMException("Quota", "QuotaExceededError"); });
    await expect(executeImport({ options: { module: "income", mode: "append", duplicateStrategy: "skip" }, rows, fileName: "income.xlsx", fileHash: "failure", actor: "tester@example.com" })).rejects.toThrow(/storage is full/i);
    setItem.mockRestore();
    expect(localStorage.getItem("SFM_DATABASE")).toBe(originalJson);
  });
});
