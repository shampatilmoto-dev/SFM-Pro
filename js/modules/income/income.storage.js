"use strict";

const IncomeStorage = {
    moduleName: "income",

    load() {
        return this.getAll();
    },

    getAll() {
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

    add(income) {
        if (!income || typeof income !== "object") {
            return null;
        }

        if (income.id == null || income.id === "") {
            income.id = typeof generateId === "function"
                ? generateId()
                : Date.now().toString();
        }

        return typeof createRecord === "function"
            ? createRecord(this.moduleName, income)
            : null;
    },

    update(id, income) {
        return typeof updateRecord === "function"
            ? updateRecord(this.moduleName, id, income)
            : false;
    },

    remove(id) {
        return typeof deleteRecord === "function"
            ? deleteRecord(this.moduleName, id)
            : false;
    },

    generateId() {
        return typeof generateId === "function"
            ? generateId()
            : Date.now().toString();
    }
};

console.log("✔ Income Storage Loaded");