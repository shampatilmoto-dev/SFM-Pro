"use strict";

const BudgetEngine = {
    validateBudget(budget) {
        if (!budget || typeof budget !== "object") {
            return { valid: false, error: "Invalid budget data." };
        }

        if (!budget.category || budget.category.trim() === "") {
            return { valid: false, error: "Category is required." };
        }

        if (isNaN(budget.amount) || Number(budget.amount) <= 0) {
            return { valid: false, error: "Budget amount must be greater than zero." };
        }

        if (!budget.month || budget.month.trim() === "") {
            return { valid: false, error: "Month is required." };
        }

        if (isNaN(budget.year) || Number(budget.year) <= 0) {
            return { valid: false, error: "Year is required." };
        }

        return { valid: true };
    },

    calculateBudgetUsed(budget) {
        if (!budget || typeof budget !== "object") {
            return 0;
        }

        const expenses = typeof getExpenseRecords === "function"
            ? getExpenseRecords()
            : [];

        return expenses
            .filter(expense => {
                if (!expense.date || !expense.category) {
                    return false;
                }

                const date = new Date(expense.date);
                const expenseMonth = String(date.getMonth() + 1).padStart(2, "0");
                const expenseYear = date.getFullYear();

                return (
                    expense.category === budget.category &&
                    expenseMonth === budget.month &&
                    expenseYear === Number(budget.year)
                );
            })
            .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    },

    enhanceBudget(budget) {
        const used = this.calculateBudgetUsed(budget);
        const remaining = Math.max(Number(budget.amount || 0) - used, 0);
        const percentage = Number(budget.amount) > 0
            ? Number(((used / Number(budget.amount)) * 100).toFixed(2))
            : 0;

        return {
            ...budget,
            used,
            remaining,
            percentage
        };
    },

    getBudgetSummary(budgets) {
        if (!Array.isArray(budgets)) {
            return { totalBudget: 0, totalUsed: 0, remaining: 0, utilization: 0 };
        }

        const enhanced = budgets.map(budget => this.enhanceBudget(budget));
        const totalBudget = enhanced.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const totalUsed = enhanced.reduce((sum, item) => sum + Number(item.used || 0), 0);
        const remaining = Math.max(totalBudget - totalUsed, 0);
        const utilization = totalBudget > 0 ? Number(((totalUsed / totalBudget) * 100).toFixed(2)) : 0;

        return { totalBudget, totalUsed, remaining, utilization };
    },

    searchBudgets(budgets, query) {
        if (!Array.isArray(budgets)) {
            return [];
        }

        if (!query || typeof query !== "string" || query.trim() === "") {
            return budgets.map(budget => this.enhanceBudget(budget));
        }

        const normalized = query.trim().toLowerCase();

        return budgets
            .filter(budget => {
                return [
                    budget.category,
                    budget.month,
                    String(budget.year),
                    budget.notes
                ]
                    .filter(Boolean)
                    .some(value => value.toString().toLowerCase().includes(normalized));
            })
            .map(budget => this.enhanceBudget(budget));
    },

    filterBudgets(budgets, filters) {
        if (!Array.isArray(budgets)) {
            return [];
        }

        let results = [...budgets];

        if (filters.category && filters.category !== "") {
            results = results.filter(budget => budget.category === filters.category);
        }

        return results.map(budget => this.enhanceBudget(budget));
    },

    sortBudgets(budgets, sortKey) {
        if (!Array.isArray(budgets)) {
            return [];
        }

        const copy = [...budgets];

        switch (sortKey) {
            case "amount_asc":
                return copy.sort((a, b) => Number(a.amount) - Number(b.amount));
            case "amount_desc":
                return copy.sort((a, b) => Number(b.amount) - Number(a.amount));
            case "usage_asc":
                return copy.sort((a, b) => Number(a.percentage || 0) - Number(b.percentage || 0));
            case "usage_desc":
                return copy.sort((a, b) => Number(b.percentage || 0) - Number(a.percentage || 0));
            case "month_asc":
                return copy.sort((a, b) => {
                    const aKey = `${a.year}-${a.month}`;
                    const bKey = `${b.year}-${b.month}`;
                    return aKey.localeCompare(bKey);
                });
            case "month_desc":
            default:
                return copy.sort((a, b) => {
                    const aKey = `${a.year}-${a.month}`;
                    const bKey = `${b.year}-${b.month}`;
                    return bKey.localeCompare(aKey);
                });
        }
    },

    getBudgetStatusClass(percentage) {
        if (percentage > 90) {
            return "budget-overlimit";
        }

        if (percentage > 70) {
            return "budget-warning";
        }

        return "budget-safe";
    }
};

console.log("✔ Budget Engine Loaded");
