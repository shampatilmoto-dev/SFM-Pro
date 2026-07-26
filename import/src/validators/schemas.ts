import { z } from "zod";
import type { ImportModule } from "../types/import.types";
import { normalizeDate } from "../lib/dates";

const text = (label: string) => z.string().trim().min(1, `${label} is required`).max(200, `${label} is too long`);
const optionalText = z.string().trim().max(1000).optional().default("");
const positive = (label: string) => z.coerce.number({ error: `${label} must be a number` }).finite().positive(`${label} must be greater than zero`);
const nonNegative = (label: string) => z.coerce.number({ error: `${label} must be a number` }).finite().nonnegative(`${label} cannot be negative`);
const date = (label: string) => z.unknown().transform((value, context) => {
  const normalized = normalizeDate(value);
  if (!normalized) context.addIssue({ code: "custom", message: `${label} must be a valid date` });
  return normalized ?? "";
});

const schemas: Record<ImportModule, z.ZodType<Record<string, unknown>>> = {
  income: z.object({ date: date("Date"), source: text("Source"), category: text("Category"), amount: positive("Amount"), notes: optionalText }),
  expense: z.object({ date: date("Date"), title: text("Title"), category: text("Category"), amount: positive("Amount"), paymentMethod: optionalText, notes: optionalText }),
  budget: z.object({ category: text("Category"), amount: positive("Amount"), month: z.coerce.number().int().min(1).max(12), year: z.coerce.number().int().min(1900).max(3000) }),
  loan: z.object({ loanName: text("Loan name"), bank: text("Bank"), amount: positive("Amount"), interest: positive("Interest"), tenure: positive("Tenure"), startDate: date("Start date") }),
  creditcard: z.object({ bankName: text("Bank name"), cardName: text("Card name"), cardType: text("Card type"), limit: positive("Limit"), outstanding: nonNegative("Outstanding"), billingDate: date("Billing date"), dueDate: date("Due date") }),
  emi: z.object({ name: text("Name"), monthlyAmount: positive("Monthly amount"), totalAmount: positive("Total amount"), paidAmount: nonNegative("Paid amount"), dueDate: date("Due date") }).refine((row) => Number(row.paidAmount) <= Number(row.totalAmount), { path: ["paidAmount"], message: "Paid amount cannot exceed total amount" }),
  investment: z.object({ name: text("Name"), type: optionalText, investedAmount: positive("Invested amount"), currentValue: nonNegative("Current value"), date: date("Date") }),
  account: z.object({ name: text("Name"), type: text("Type"), institution: text("Institution"), balance: z.coerce.number().finite(), currency: z.string().trim().length(3).default("INR") }),
  category: z.object({ name: text("Name"), type: z.enum(["income", "expense"]), color: z.string().trim().regex(/^#[0-9a-f]{6}$/i, "Color must be a six-digit hex value").optional().default("#2563eb") }),
  bill: z.object({ title: text("Title"), category: text("Category"), amount: positive("Amount"), dueDate: date("Due date"), status: z.enum(["pending", "paid"]).optional().default("pending") }),
  recurring: z.object({ title: text("Title"), type: z.enum(["income", "expense"]), amount: positive("Amount"), frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]), startDate: date("Start date"), endDate: z.union([date("End date"), z.literal("")]).optional().default("") }),
  asset: z.object({ name: text("Name"), category: text("Category"), purchaseValue: nonNegative("Purchase value"), currentValue: nonNegative("Current value"), purchaseDate: date("Purchase date") }),
  settings: z.object({ key: z.enum(["currency", "language"]), value: text("Value") }),
};

export function getModuleSchema(module: ImportModule): z.ZodType<Record<string, unknown>> {
  return schemas[module];
}
