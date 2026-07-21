"use strict";

const LoanService = {

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

    toError(response, fallbackMessage = "Operation failed.") {
        const text = Array.isArray(response?.errors) && response.errors.length > 0
            ? response.errors.join(" ")
            : (response?.message || fallbackMessage);
        const error = new Error(text);
        error.response = response;
        return error;
    },

    loadLoans() {
        return LoanStorage.load();
    },

    getLoanById(id) {
        return LoanStorage.getById(id);
    },

    createLoan(loan) {
        const validation = this.fromValidation(
            LoanEngine.validateLoan(loan),
            "Loan validation failed."
        );

        if (!validation.success) {
            throw this.toError(validation, "Loan validation failed.");
        }

        const loanToSave = LoanEngine.calculateLoan({
            ...loan,
            id: loan.id || (typeof LoanStorage.generateId === "function" ? LoanStorage.generateId() : `${Date.now()}`)
        });

        const saved = LoanStorage.add(loanToSave);
        if (!saved) {
            throw this.toError(this.createResponse({
                errors: ["Unable to save loan."],
                message: "Loan save failed."
            }), "Loan save failed.");
        }

        return saved;
    },

    updateLoan(loan) {
        if (!loan || !loan.id) {
            throw this.toError(this.createResponse({
                errors: ["Loan id is required."],
                message: "Loan update failed."
            }), "Loan update failed.");
        }

        const validation = this.fromValidation(
            LoanEngine.validateLoan(loan),
            "Loan validation failed."
        );

        if (!validation.success) {
            throw this.toError(validation, "Loan validation failed.");
        }

        const loanToSave = LoanEngine.calculateLoan(loan);
        const updated = LoanStorage.update(loan.id, loanToSave);

        if (!updated) {
            throw this.toError(this.createResponse({
                errors: ["Loan update failed."],
                message: "Loan update failed."
            }), "Loan update failed.");
        }

        return this.getLoanById(loan.id);
    },

    deleteLoan(id) {
        if (!id) {
            return this.createResponse({
                errors: ["Loan id is required."],
                message: "Loan delete failed."
            });
        }

        const removed = LoanStorage.remove(id);
        if (!removed) {
            return this.createResponse({
                errors: ["Unable to delete loan."],
                message: "Loan delete failed."
            });
        }

        return this.createResponse({
            success: true,
            data: { id },
            message: "Loan deleted successfully."
        });
    },

    calculateLoan(loan) {
        return LoanEngine.calculateLoan(loan);
    },

    getLoanSummary() {
        return LoanEngine.getLoanSummary(LoanStorage.load());
    },

    searchLoans(keyword) {
        const query = String(keyword || "").trim().toLowerCase();

        if (query === "") {
            return LoanStorage.load();
        }

        return LoanStorage.load().filter(loan => {
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
        const loans = [...LoanStorage.load()];

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
