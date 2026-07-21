"use strict";

const LoanStorage = {
    moduleName: "loans",

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

    add(loan) {
        if (!loan || typeof loan !== "object") {
            return null;
        }

        if (loan.id == null) {
            loan.id = typeof generateId === "function"
                ? generateId()
                : Date.now().toString();
        }

        if (typeof createRecord === "function") {
            return createRecord(this.moduleName, loan);
        }

        return null;
    },

    update(id, loan) {
        return typeof updateRecord === "function"
            ? updateRecord(this.moduleName, id, loan)
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
    },

    // Standardized aliases for unified module interfaces.
    list() {
        return this.getAll();
    },

    read(id) {
        return this.getById(id);
    },

    create(loan) {
        return this.add(loan);
    },

    replace(id, loan) {
        return this.update(id, loan);
    },

    delete(id) {
        return this.remove(id);
    }
};
