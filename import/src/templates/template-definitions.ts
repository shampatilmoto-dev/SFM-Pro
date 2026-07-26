import type { ImportModule, TemplateDefinition } from "../types/import.types";

const column = (key: string, label: string, required: boolean, description: string, example: string | number) => ({
  key,
  label,
  required,
  description,
  example,
});

export const TEMPLATE_DEFINITIONS: Record<ImportModule, TemplateDefinition> = {
  income: {
    module: "income",
    displayName: "Income",
    columns: [
      column("date", "Date", true, "Income date (YYYY-MM-DD or DD/MM/YYYY)", "2026-07-01"),
      column("source", "Source", true, "Income source", "Salary"),
      column("category", "Category", true, "Income category", "Employment"),
      column("amount", "Amount", true, "Positive amount", 75000),
      column("notes", "Notes", false, "Optional notes", "July payroll"),
    ],
  },
  expense: {
    module: "expense",
    displayName: "Expense",
    columns: [
      column("date", "Date", true, "Expense date", "2026-07-02"),
      column("title", "Title", true, "Expense description", "Groceries"),
      column("category", "Category", true, "Expense category", "Food"),
      column("amount", "Amount", true, "Positive amount", 3250),
      column("paymentMethod", "Payment Method", false, "Cash, card, bank, or UPI", "UPI"),
      column("notes", "Notes", false, "Optional notes", "Weekly shop"),
    ],
  },
  budget: {
    module: "budget",
    displayName: "Budget",
    columns: [
      column("category", "Category", true, "Budget category", "Food"),
      column("amount", "Amount", true, "Positive budget amount", 12000),
      column("month", "Month", true, "Month number 1-12", 7),
      column("year", "Year", true, "Four-digit year", 2026),
    ],
  },
  loan: {
    module: "loan",
    displayName: "Loan",
    columns: [
      column("loanName", "Loan Name", true, "Loan display name", "Home Loan"),
      column("bank", "Bank", true, "Lender name", "SFM Bank"),
      column("amount", "Amount", true, "Principal amount", 3500000),
      column("interest", "Interest", true, "Annual interest percent", 8.4),
      column("tenure", "Tenure", true, "Tenure in months", 240),
      column("startDate", "Start Date", true, "Loan start date", "2026-01-15"),
    ],
  },
  creditcard: {
    module: "creditcard",
    displayName: "Credit Card",
    columns: [
      column("bankName", "Bank Name", true, "Card issuer", "SFM Bank"),
      column("cardName", "Card Name", true, "Card display name", "Rewards Platinum"),
      column("cardType", "Card Type", true, "Network or product type", "Visa"),
      column("limit", "Limit", true, "Positive credit limit", 250000),
      column("outstanding", "Outstanding", true, "Current outstanding balance", 12500),
      column("billingDate", "Billing Date", true, "Billing date", "2026-07-10"),
      column("dueDate", "Due Date", true, "Payment due date", "2026-07-28"),
    ],
  },
  emi: {
    module: "emi",
    displayName: "EMI",
    columns: [
      column("name", "Name", true, "EMI display name", "Laptop EMI"),
      column("monthlyAmount", "Monthly Amount", true, "Positive monthly payment", 6500),
      column("totalAmount", "Total Amount", true, "Positive total obligation", 78000),
      column("paidAmount", "Paid Amount", true, "Amount already paid", 19500),
      column("dueDate", "Due Date", true, "Next due date", "2026-08-05"),
    ],
  },
  investment: {
    module: "investment",
    displayName: "Investment",
    columns: [
      column("name", "Name", true, "Investment name", "Index Fund"),
      column("type", "Type", false, "Investment type", "Mutual Fund"),
      column("investedAmount", "Invested Amount", true, "Total invested amount", 200000),
      column("currentValue", "Current Value", true, "Current market value", 224500),
      column("date", "Date", true, "Investment date", "2025-04-01"),
    ],
  },
  account: {
    module: "account",
    displayName: "Account",
    columns: [
      column("name", "Name", true, "Account name", "Salary Account"),
      column("type", "Type", true, "Account type", "Savings"),
      column("institution", "Institution", true, "Bank or institution", "SFM Bank"),
      column("balance", "Balance", true, "Opening/current balance", 125000),
      column("currency", "Currency", false, "ISO currency code", "INR"),
    ],
  },
  category: {
    module: "category",
    displayName: "Category",
    columns: [
      column("name", "Name", true, "Category name", "Healthcare"),
      column("type", "Type", true, "income or expense", "expense"),
      column("color", "Color", false, "Hex display color", "#2563eb"),
    ],
  },
  bill: {
    module: "bill",
    displayName: "Bill",
    columns: [
      column("title", "Title", true, "Bill name", "Electricity"),
      column("category", "Category", true, "Bill category", "Utilities"),
      column("amount", "Amount", true, "Positive amount", 4200),
      column("dueDate", "Due Date", true, "Bill due date", "2026-07-30"),
      column("status", "Status", false, "pending or paid", "pending"),
    ],
  },
  recurring: {
    module: "recurring",
    displayName: "Recurring",
    columns: [
      column("title", "Title", true, "Recurring item name", "House Rent"),
      column("type", "Type", true, "income or expense", "expense"),
      column("amount", "Amount", true, "Positive amount", 28000),
      column("frequency", "Frequency", true, "daily, weekly, monthly, quarterly, yearly", "monthly"),
      column("startDate", "Start Date", true, "First occurrence", "2026-01-01"),
      column("endDate", "End Date", false, "Optional final occurrence", "2026-12-31"),
    ],
  },
  asset: {
    module: "asset",
    displayName: "Asset",
    columns: [
      column("name", "Name", true, "Asset name", "Apartment"),
      column("category", "Category", true, "Asset category", "Real Estate"),
      column("purchaseValue", "Purchase Value", true, "Original value", 4500000),
      column("currentValue", "Current Value", true, "Current estimated value", 5200000),
      column("purchaseDate", "Purchase Date", true, "Purchase date", "2021-08-12"),
    ],
  },
  settings: {
    module: "settings",
    displayName: "Settings",
    columns: [
      column("key", "Key", true, "Approved setting key", "currency"),
      column("value", "Value", true, "Setting value", "INR"),
    ],
  },
};

export const DOWNLOADABLE_TEMPLATE_MODULES = (Object.keys(TEMPLATE_DEFINITIONS) as ImportModule[]).filter(
  (module) => module !== "settings",
);
