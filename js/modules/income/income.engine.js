"use strict";

const IncomeEngine = {
    rules: {
        source: {
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
            "Salary",
            "Bonus",
            "Freelance",
            "Business",
            "Interest",
            "Rental",
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

    normalizeIncome(income) {
        const warnings = [];
        const rawSource = String(income?.source || "");
        const rawCategory = String(income?.category || "");
        const rawNotes = String(income?.notes || "");
        const normalizedAmount = this.normalizeAmount(income?.amount);
        const normalizedDate = this.normalizeDate(income?.date);

        let source = this.sanitizeText(rawSource);
        let category = this.sanitizeText(rawCategory);
        let notes = this.sanitizeText(rawNotes);

        if (source.length > this.rules.source.maxLength) {
            source = source.slice(0, this.rules.source.maxLength);
            warnings.push("Income title was trimmed to the maximum allowed length.");
        }

        if (notes.length > this.rules.notes.maxLength) {
            notes = notes.slice(0, this.rules.notes.maxLength);
            warnings.push("Notes were trimmed to the maximum allowed length.");
        }

        const normalized = {
            source,
            category,
            amount: normalizedAmount,
            date: normalizedDate,
            notes
        };

        if (
            rawSource !== normalized.source ||
            rawCategory !== normalized.category ||
            rawNotes !== normalized.notes
        ) {
            warnings.push("Input was sanitized.");
        }

        return {
            data: normalized,
            warnings
        };
    },

    validateIncome(income) {
        const result = this.createValidationResult();

        if (!income || typeof income !== "object") {
            result.errors.push("Income data is invalid.");
            result.message = "Income validation failed.";
            result.valid = false;
            result.error = result.errors[0];
            return result;
        }

        const normalized = this.normalizeIncome(income);
        const data = normalized.data;

        result.data = data;
        result.warnings = normalized.warnings;

        if (!data.source) {
            result.errors.push("Income title is required.");
        } else if (data.source.length < this.rules.source.minLength) {
            result.errors.push("Income title must be at least 2 characters.");
        }

        if (!data.category) {
            result.errors.push("Income category is required.");
        } else if (!this.rules.categories.includes(data.category)) {
            result.errors.push("Income category is invalid.");
        }

        if (!data.date) {
            result.errors.push("Income date is required.");
        }

        if (!Number.isFinite(data.amount)) {
            result.errors.push("Income amount must be a valid number.");
        } else {
            if (data.amount < this.rules.amount.min) {
                result.errors.push("Income amount must be greater than zero.");
            }

            if (data.amount > this.rules.amount.max) {
                result.errors.push("Income amount exceeds maximum allowed value.");
            }
        }

        result.success = result.errors.length === 0;
        result.message = result.success
            ? "Income validation passed."
            : "Income validation failed.";

        // Keep backward compatibility with legacy service/controller checks.
        result.valid = result.success;
        result.error = result.errors[0] || null;

        if (result.success) {
            income.source = data.source;
            income.category = data.category;
            income.amount = data.amount;
            income.date = data.date;
            income.notes = data.notes;
        }

        return result;
    },

    calculateIncome(income) {
        const normalized = this.normalizeIncome(income || {});
        const data = normalized.data;

        return {
            ...income,
            source: data.source,
            category: data.category,
            amount: Number.isFinite(data.amount) ? data.amount : 0,
            date: data.date,
            notes: data.notes,
            updatedAt: new Date().toISOString()
        };
    },

    getIncomeSummary(incomes) {
        if (!Array.isArray(incomes)) {
            return {
                totalEntries: 0,
                totalIncome: 0
            };
        }

        const totalIncome = typeof calculateTotal === "function"
            ? calculateTotal(incomes, "amount")
            : incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        return {
            totalEntries: incomes.length,
            totalIncome
        };
    }
};
