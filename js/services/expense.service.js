"use strict";

const ExpenseService = {
    createResponse(overrides = {}) {
        const base = {
            success: false,
            data: null,
            errors: [],
            warnings: [],
            message: "",
            // Backward compatibility fields.
            valid: false,
            error: null
        };

        const response = {
            ...base,
            ...overrides
        };

        response.valid = response.success;
        response.error = response.errors[0] || null;

        return response;
    },

    fromValidation(validation, fallbackMessage = "Validation failed.") {
        return this.createResponse({
            success: Boolean(validation?.success),
            data: validation?.data || null,
            errors: Array.isArray(validation?.errors)
                ? validation.errors
                : (validation?.error ? [validation.error] : []),
            warnings: Array.isArray(validation?.warnings)
                ? validation.warnings
                : [],
            message: validation?.message || fallbackMessage
        });
    },

    loadExpenses() {
        return ExpenseStorage.load() || [];
    },

    getExpenseById(id) {
        if (!id) {
            return null;
        }

        return ExpenseStorage.getById(id);
    },

    addExpense(expense) {
        const validation = ExpenseEngine.validateExpense(expense);
        const validationResult = this.fromValidation(validation, "Expense validation failed.");

        if (!validationResult.success) {
            return validationResult;
        }

        const payload = validationResult.data;
        const result = ExpenseStorage.add(payload);

        if (!result) {
            return this.createResponse({
                data: payload,
                errors: ["Unable to save expense."],
                warnings: validationResult.warnings,
                message: "Expense save failed."
            });
        }

        return this.createResponse({
            success: true,
            data: result,
            warnings: validationResult.warnings,
            message: "Expense saved successfully."
        });
    },

    updateExpense(id, expense) {
        if (!id) {
            return this.createResponse({
                errors: ["Expense ID is required for update."],
                message: "Expense update failed."
            });
        }

        const validation = ExpenseEngine.validateExpense(expense);
        const validationResult = this.fromValidation(validation, "Expense validation failed.");

        if (!validationResult.success) {
            return validationResult;
        }

        const updated = ExpenseStorage.update(id, validationResult.data);

        if (!updated) {
            return this.createResponse({
                data: validationResult.data,
                errors: ["Unable to update expense."],
                warnings: validationResult.warnings,
                message: "Expense update failed."
            });
        }

        const refreshed = ExpenseStorage.getById(id);

        return this.createResponse({
            success: true,
            data: refreshed || validationResult.data,
            warnings: validationResult.warnings,
            message: "Expense updated successfully."
        });
    },

    deleteExpense(id) {
        if (!id) {
            return this.createResponse({
                errors: ["Expense ID is required for delete."],
                message: "Expense delete failed."
            });
        }

        const deleted = ExpenseStorage.remove(id);

        if (!deleted) {
            return this.createResponse({
                errors: ["Unable to delete expense."],
                message: "Expense delete failed."
            });
        }

        return this.createResponse({
            success: true,
            data: { id },
            message: "Expense deleted successfully."
        });
    },

    searchExpenses(expenses, query) {
        return ExpenseEngine.searchExpenses(expenses, query);
    },

    filterExpenses(expenses, filters) {
        return ExpenseEngine.filterExpenses(expenses, filters);
    },

    sortExpenses(expenses, sortKey) {
        return ExpenseEngine.sortExpenses(expenses, sortKey);
    },

    getSummary(expenses) {
        return ExpenseEngine.getSummary(expenses);
    }
};

console.log("✔ Expense Service Loaded");