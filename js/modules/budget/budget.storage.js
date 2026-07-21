"use strict";

const BudgetStorage = {
    load() {
        if (typeof loadDatabase === "function") {
            loadDatabase();
        }

        return typeof getAllRecords === "function"
            ? getAllRecords("budgets")
            : [];
    },

    getById(id) {
        return typeof getRecordById === "function"
            ? getRecordById("budgets", id)
            : null;
    },

    add(budget) {
        return typeof addBudget === "function"
            ? addBudget(budget)
            : null;
    },

    update(id, budget) {
        return typeof updateBudget === "function"
            ? updateBudget(id, budget)
            : false;
    },

    remove(id) {
        return typeof removeBudget === "function"
            ? removeBudget(id)
            : false;
    }
};

console.log("✔ Budget Storage Loaded");
