"use strict";

const BudgetService = {
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
            success: Boolean(validation?.success || validation?.valid),
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

    loadBudgets() {
        return BudgetStorage.load() || [];
    },

    getBudgetById(id) {
        if (!id) {
            return null;
        }

        return BudgetStorage.getById(id);
    },

    addBudget(budget) {
        const validation = BudgetEngine.validateBudget(budget);
        const validationResult = this.fromValidation(validation, "Budget validation failed.");

        if (!validationResult.success) {
            return validationResult;
        }

        const result = BudgetStorage.add(validationResult.data || budget);
        if (!result) {
            return this.createResponse({
                errors: ["Unable to save budget."],
                warnings: validationResult.warnings,
                message: "Budget save failed."
            });
        }

        return this.createResponse({
            success: true,
            data: result,
            warnings: validationResult.warnings,
            message: "Budget saved successfully."
        });
    },

    updateBudget(id, budget) {
        if (!id) {
            return this.createResponse({
                errors: ["Budget ID is required for update."],
                message: "Budget update failed."
            });
        }

        const validation = BudgetEngine.validateBudget(budget);
        const validationResult = this.fromValidation(validation, "Budget validation failed.");

        if (!validationResult.success) {
            return validationResult;
        }

        const updated = BudgetStorage.update(id, validationResult.data || budget);
        if (!updated) {
            return this.createResponse({
                errors: ["Unable to update budget."],
                warnings: validationResult.warnings,
                message: "Budget update failed."
            });
        }

        const refreshed = BudgetStorage.getById(id);

        return this.createResponse({
            success: true,
            data: refreshed || (validationResult.data || budget),
            warnings: validationResult.warnings,
            message: "Budget updated successfully."
        });
    },

    deleteBudget(id) {
        if (!id) {
            return this.createResponse({
                errors: ["Budget ID is required for delete."],
                message: "Budget delete failed."
            });
        }

        const deleted = BudgetStorage.remove(id);
        if (!deleted) {
            return this.createResponse({
                errors: ["Unable to delete budget."],
                message: "Budget delete failed."
            });
        }

        return this.createResponse({
            success: true,
            data: { id },
            message: "Budget deleted successfully."
        });
    },

    searchBudgets(budgets, query) {
        return BudgetEngine.searchBudgets(budgets, query);
    },

    filterBudgets(budgets, filters) {
        return BudgetEngine.filterBudgets(budgets, filters);
    },

    sortBudgets(budgets, sortKey) {
        return BudgetEngine.sortBudgets(budgets, sortKey);
    },

    getSummary(budgets) {
        return BudgetEngine.getBudgetSummary(budgets);
    }
};

console.log("✔ Budget Service Loaded");
