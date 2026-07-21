"use strict";

const BudgetStorage = {
    moduleName: "budgets",

    load() {
        if (typeof loadDatabase === "function") {
            loadDatabase();
        }

        return typeof getAllRecords === "function"
            ? getAllRecords(this.moduleName)
            : [];
    },

    getById(id) {
        return typeof getRecordById === "function"
            ? getRecordById(this.moduleName, id)
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
    },

    // Standardized aliases for unified module interfaces.
    list() {
        return this.load();
    },

    read(id) {
        return this.getById(id);
    },

    create(budget) {
        return this.add(budget);
    },

    replace(id, budget) {
        return this.update(id, budget);
    },

    delete(id) {
        return this.remove(id);
    }
};

console.log("✔ Budget Storage Loaded");
