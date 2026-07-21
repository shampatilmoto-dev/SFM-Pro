"use strict";

const ExpenseEngine = {
    rules: {
        title: {
            minLength: 2,
            maxLength: 100
        },
        notes: {
            maxLength: 500
        },
        amount: {
            min: 0.01,
            max: (typeof APP_CONFIG !== "undefined" && APP_CONFIG?.VALIDATION?.MAX_AMOUNT)
                ? Number(APP_CONFIG.VALIDATION.MAX_AMOUNT)
                : 999999999
        },
        categories: [
            "Food",
            "Fuel",
            "Shopping",
            "Electricity",
            "Water Bill",
            "Mobile Recharge",
            "Internet",
            "Medical",
            "Travel",
            "Rent",
            "Entertainment",
            "Other"
        ],
        paymentMethods: [
            "",
            "Cash",
            "Card",
            "UPI",
            "Net Banking",
            "Other"
        ]
    },

    createValidationResult() {
        return {
            success: false,
            data: null,
            errors: [],
            warnings: [],
            message: ""
        };
    },

    sanitizeText(value) {
        return String(value || "")
            .replace(/<[^>]*>/g, "")
            .replace(/[\u0000-\u001F\u007F]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    },

    normalizeAmount(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return NaN;
        }

        return Number(number.toFixed(2));
    },

    normalizeDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toISOString().slice(0, 10);
    },

    normalizeExpense(expense) {
        const warnings = [];
        const rawTitle = String(expense?.title || "");
        const rawCategory = String(expense?.category || "");
        const rawPaymentMethod = String(expense?.paymentMethod || "");
        const rawNotes = String(expense?.notes || "");
        const normalizedAmount = this.normalizeAmount(expense?.amount);
        const normalizedDate = this.normalizeDate(expense?.date);

        let title = this.sanitizeText(rawTitle);
        let category = this.sanitizeText(rawCategory);
        let paymentMethod = this.sanitizeText(rawPaymentMethod);
        let notes = this.sanitizeText(rawNotes);

        if (title.length > this.rules.title.maxLength) {
            title = title.slice(0, this.rules.title.maxLength);
            warnings.push("Title was trimmed to the maximum allowed length.");
        }

        if (notes.length > this.rules.notes.maxLength) {
            notes = notes.slice(0, this.rules.notes.maxLength);
            warnings.push("Notes were trimmed to the maximum allowed length.");
        }

        const normalized = {
            title,
            category,
            amount: normalizedAmount,
            date: normalizedDate,
            paymentMethod,
            notes
        };

        if (
            rawTitle !== normalized.title ||
            rawCategory !== normalized.category ||
            rawPaymentMethod !== normalized.paymentMethod ||
            rawNotes !== normalized.notes
        ) {
            warnings.push("Input was sanitized.");
        }

        return {
            data: normalized,
            warnings
        };
    },

    validateExpense(expense) {
        const result = this.createValidationResult();

        if (!expense || typeof expense !== "object") {
            result.errors.push("Invalid expense data.");
            result.message = "Validation failed.";
            result.valid = false;
            result.error = result.errors[0];
            return result;
        }

        const normalized = this.normalizeExpense(expense);
        const data = normalized.data;

        result.data = data;
        result.warnings = normalized.warnings;

        if (!data.title) {
            result.errors.push("Title is required.");
        } else if (data.title.length < this.rules.title.minLength) {
            result.errors.push("Title must be at least 2 characters.");
        }

        if (!data.category) {
            result.errors.push("Category is required.");
        } else if (!this.rules.categories.includes(data.category)) {
            result.errors.push("Category is invalid.");
        }

        if (!data.date) {
            result.errors.push("Date is required.");
        }

        if (!Number.isFinite(data.amount)) {
            result.errors.push("Amount must be a valid number.");
        } else {
            if (data.amount < this.rules.amount.min) {
                result.errors.push("Amount must be greater than zero.");
            }

            if (data.amount > this.rules.amount.max) {
                result.errors.push("Amount exceeds maximum allowed value.");
            }
        }

        if (!this.rules.paymentMethods.includes(data.paymentMethod)) {
            result.errors.push("Payment method is invalid.");
        }

        result.success = result.errors.length === 0;
        result.message = result.success
            ? "Expense validation passed."
            : "Expense validation failed.";

        // Keep backward compatibility with existing service/controller checks.
        result.valid = result.success;
        result.error = result.errors[0] || null;

        if (result.success) {
            expense.title = data.title;
            expense.category = data.category;
            expense.amount = data.amount;
            expense.date = data.date;
            expense.paymentMethod = data.paymentMethod;
            expense.notes = data.notes;
        }

        return result;
    },

    searchExpenses(expenses, query) {
        if (!Array.isArray(expenses)) {
            return [];
        }

        if (!query || typeof query !== "string" || query.trim() === "") {
            return [...expenses];
        }

        const normalized = query.trim().toLowerCase();

        return expenses.filter(expense => {
            return [
                expense.title,
                expense.category,
                expense.paymentMethod,
                expense.notes
            ]
                .filter(Boolean)
                .some(value =>
                    value.toString().toLowerCase().includes(normalized)
                );
        });
    },

    filterExpenses(expenses, filters) {
        if (!Array.isArray(expenses)) {
            return [];
        }

        return expenses.filter(expense => {
            if (filters.category && filters.category !== "" && expense.category !== filters.category) {
                return false;
            }

            if (filters.paymentMethod && filters.paymentMethod !== "" && expense.paymentMethod !== filters.paymentMethod) {
                return false;
            }

            return true;
        });
    },

    sortExpenses(expenses, sortKey) {
        if (!Array.isArray(expenses)) {
            return [];
        }

        const copy = [...expenses];

        switch (sortKey) {
            case "amount_asc":
                return copy.sort((a, b) => Number(a.amount) - Number(b.amount));
            case "amount_desc":
                return copy.sort((a, b) => Number(b.amount) - Number(a.amount));
            case "date_asc":
                return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
            case "date_desc":
                return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
            case "title_asc":
                return copy.sort((a, b) => a.title.localeCompare(b.title));
            case "title_desc":
                return copy.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    },

    getSummary(expenses) {
        if (!Array.isArray(expenses)) {
            return { total: 0, count: 0 };
        }

        const total = expenses.reduce((sum, expense) => {
            return sum + Number(expense.amount || 0);
        }, 0);

        return {
            total,
            count: expenses.length
        };
    }
};

console.log("✔ Expense Engine Loaded");