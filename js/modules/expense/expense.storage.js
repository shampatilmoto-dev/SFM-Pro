"use strict";

const ExpenseStorage = {
    load() {
        if (typeof loadDatabase === "function") {
            loadDatabase();
        }

        return typeof getAllRecords === "function"
            ? getAllRecords("expenses")
            : (Array.isArray(database.expenses) ? [...database.expenses] : []);
    },

    getById(id) {
        return typeof getRecordById === "function"
            ? getRecordById("expenses", id)
            : (Array.isArray(database.expenses)
                ? database.expenses.find(expense => expense.id === id)
                : null);
    },

    add(expense) {
        return typeof addExpense === "function"
            ? addExpense(expense)
            : null;
    },

    update(id, expense) {
        return typeof updateExpense === "function"
            ? updateExpense(id, expense)
            : false;
    },

    remove(id) {
        return typeof deleteExpense === "function"
            ? deleteExpense(id)
            : false;
    }
};

console.log("✔ Expense Storage Loaded");
