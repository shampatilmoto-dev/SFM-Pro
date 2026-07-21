"use strict";

const LoanService = {

    loadLoans() {
        return LoanStorage.getAll();
    },

    getLoanById(id) {
        return LoanStorage.getById(id);
    },

    createLoan(loan) {
        const validation = LoanEngine.validateLoan(loan);

        if (!validation.valid) {
            throw new Error(validation.errors.join(" "));
        }

        const loanToSave = LoanEngine.calculateLoan({
            ...loan,
            id: loan.id || (typeof LoanStorage.generateId === "function" ? LoanStorage.generateId() : `${Date.now()}`)
        });

        return LoanStorage.add(loanToSave);
    },

    updateLoan(loan) {
        if (!loan || !loan.id) {
            throw new Error("Loan id is required.");
        }

        const validation = LoanEngine.validateLoan(loan);

        if (!validation.valid) {
            throw new Error(validation.errors.join(" "));
        }

        const loanToSave = LoanEngine.calculateLoan(loan);
        const updated = LoanStorage.update(loan.id, loanToSave);

        if (!updated) {
            throw new Error("Loan update failed.");
        }

        return this.getLoanById(loan.id);
    },

    deleteLoan(id) {
        return LoanStorage.remove(id);
    },

    calculateLoan(loan) {
        return LoanEngine.calculateLoan(loan);
    },

    getLoanSummary() {
        return LoanEngine.getLoanSummary(LoanStorage.getAll());
    },

    searchLoans(keyword) {
        const query = String(keyword || "").trim().toLowerCase();

        if (query === "") {
            return LoanStorage.getAll();
        }

        return LoanStorage.getAll().filter(loan => {
            const loanName = String(loan.loanName || "").toLowerCase();
            const bank = String(loan.bank || "").toLowerCase();
            const status = String(loan.status || LoanEngine.calculateLoan(loan).status || "").toLowerCase();

            return (
                loanName.includes(query) ||
                bank.includes(query) ||
                status.includes(query)
            );
        });
    },

    sortLoans(field, order = "asc") {
        const fieldMap = {
            "Loan Name": "loanName",
            loanName: "loanName",
            name: "loanName",
            "Bank": "bank",
            bank: "bank",
            "Amount": "amount",
            amount: "amount",
            "EMI": "emi",
            emi: "emi",
            "Outstanding": "outstanding",
            outstanding: "outstanding",
            "Start Date": "startDate",
            startDate: "startDate"
        };

        const key = fieldMap[field] || field;
        const direction = String(order).toLowerCase() === "desc" ? -1 : 1;
        const loans = [...LoanStorage.getAll()];

        loans.sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];

            if (key === "startDate") {
                const aDate = Date.parse(aValue) || 0;
                const bDate = Date.parse(bValue) || 0;
                return (aDate - bDate) * direction;
            }

            const aNumber = Number(aValue);
            const bNumber = Number(bValue);

            if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
                return (aNumber - bNumber) * direction;
            }

            return String(aValue || "").localeCompare(String(bValue || "")) * direction;
        });

        return loans;
    }

};

console.log("✔ Loan Service Loaded");
