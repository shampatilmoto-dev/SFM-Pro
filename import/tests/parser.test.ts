import { describe, expect, it } from "vitest";
import { parseCsvText } from "../src/parsers/csv.parser";
import { validateImportFile } from "../src/services/workbook-parser.service";
import { sha256Hex } from "../src/lib/hash";

describe("CSV parser", () => {
  it("parses UTF-8 fields, escaped quotes, commas, and line breaks", () => {
    const result = parseCsvText('Date,Source,Amount,Notes\r\n2026-07-01,Salary,75000,"Paid, monthly"\r\n2026-07-02,Bonus,5000,"Say ""thanks"""');
    expect(result.headers).toEqual(["Date", "Source", "Amount", "Notes"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].Notes).toBe("Paid, monthly");
    expect(result.rows[1].Notes).toBe('Say "thanks"');
  });

  it("rejects unsupported and empty files", () => {
    expect(() => validateImportFile(new File(["x"], "records.pdf"))).toThrow(/xlsx/i);
    expect(() => validateImportFile(new File([], "records.csv"))).toThrow(/empty/i);
  });

  it("generates standards-compliant SHA-256 fingerprints", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
