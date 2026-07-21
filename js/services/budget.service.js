"use strict";

const BudgetService = {
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
        if (!validation.valid) {
            return { error: validation.error };
        }

        const result = BudgetStorage.add(budget);
        return result || { success: true };
    },

    updateBudget(id, budget) {
        if (!id) {
            return { error: "Budget ID is required for update." };
        }

        const validation = BudgetEngine.validateBudget(budget);
        if (!validation.valid) {
            return { error: validation.error };
        }

        const updated = BudgetStorage.update(id, budget);
        if (!updated) {
            return { error: "Unable to update budget." };
        }

        return { success: true };
    },

    deleteBudget(id) {
        if (!id) {
            return { error: "Budget ID is required for delete." };
        }

        const deleted = BudgetStorage.remove(id);
        if (!deleted) {
            return { error: "Unable to delete budget." };
        }

        return { success: true };
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
