"use strict";

const LoanController = {

    currentLoanId: null,
    isInitialized: false,

    elements: {
        form: null,
        saveButton: null,
        tableBody: null,
        loanName: null,
        bankName: null,
        loanAmount: null,
        loanInterest: null,
        loanTenure: null,
        loanDate: null,
        loanCount: null,
        loanOutstanding: null,
        loanEMI: null
    },

    initialize() {
        if (this.isInitialized) {
            this.loadLoans();
            return;
        }

        if (typeof LoanService !== "object") {
            console.error("LoanService is required for LoanController.");
            return;
        }

        this.cacheElements();
        this.bindEvents();
        this.loadLoans();
        this.isInitialized = true;
    },

    registerEvent(target, eventName, handler) {
        if (!target || typeof handler !== "function") {
            return;
        }

        target.addEventListener(eventName, handler);
    },

    // Enterprise integration: standardized notification entry point for Loan module.
    notify(type, message) {
        const text = String(message || "").trim();
        if (!text) {
            return;
        }

        if (window.NotificationManager && typeof NotificationManager[type] === "function") {
            NotificationManager[type](text);
            return;
        }

        if (typeof showNotification === "function") {
            showNotification(text, type);
            return;
        }

        const logger = type === "error" ? console.error : console.log;
        logger(text);
    },

    // Enterprise integration: show global loader before save/update/delete operations.
    showOperationLoader(message) {
        if (window.LoaderManager && typeof LoaderManager.show === "function") {
            LoaderManager.show(message);
        }
    },

    // Enterprise integration: hide global loader when operation completes.
    hideOperationLoader() {
        if (window.LoaderManager && typeof LoaderManager.hide === "function") {
            LoaderManager.hide();
        }
    },

    normalizeServiceError(error, fallback = "Operation failed.") {
        if (error && error.response && typeof error.response === "object") {
            const response = error.response;
            const errors = Array.isArray(response.errors)
                ? response.errors.filter(Boolean)
                : (response.error ? [response.error] : []);

            return {
                message: response.message || fallback,
                errors
            };
        }

        if (error instanceof Error) {
            return {
                message: error.message || fallback,
                errors: []
            };
        }

        return {
            message: fallback,
            errors: []
        };
    },

    cacheElements() {
        this.elements.form = document.getElementById("loanForm");
        this.elements.saveButton = document.getElementById("saveLoanBtn");
        this.elements.tableBody = document.getElementById("loanTable");
        this.elements.loanName = document.getElementById("loanName");
        this.elements.bankName = document.getElementById("bankName");
        this.elements.loanAmount = document.getElementById("loanAmount");
        this.elements.loanInterest = document.getElementById("loanInterest");
        this.elements.loanTenure = document.getElementById("loanTenure");
        this.elements.loanDate = document.getElementById("loanDate");
        this.elements.loanCount = document.getElementById("loanCount");
        this.elements.loanOutstanding = document.getElementById("loanOutstanding");
        this.elements.loanEMI = document.getElementById("loanEMI");
    },

    bindEvents() {
        if (this.elements.form) {
            this.registerEvent(this.elements.form, "submit", event => {
                event.preventDefault();
                this.saveLoan();
            });
        }

        if (this.elements.saveButton) {
            this.registerEvent(this.elements.saveButton, "click", () => {
                this.saveLoan();
            });
        }

        if (this.elements.tableBody) {
            this.registerEvent(this.elements.tableBody, "click", event => {
                const button = event.target.closest("button[data-action]");

                if (!button) {
                    return;
                }

                const action = button.dataset.action;
                const id = button.dataset.id;

                if (action === "edit") {
                    this.editLoan(id);
                    return;
                }

                if (action === "delete") {
                    this.deleteLoan(id);
                }
            });
        }
    },

    loadLoans() {
        const loans = LoanService.loadLoans();
        this.renderLoanTable(loans);
        this.updateSummary();
    },

    renderLoanTable(loans) {
        if (!this.elements.tableBody) {
            return;
        }

        if (!Array.isArray(loans) || loans.length === 0) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No Loans Found</td>
                </tr>
            `;
            return;
        }

        this.elements.tableBody.innerHTML = loans.map(loan => this.renderLoanRow(loan)).join("");
    },

    renderLoanRow(loan) {
        const safeName = this.escapeHtml(loan.loanName || '');
        const safeBank = this.escapeHtml(loan.bank || '');
        const amount = typeof formatCurrency === "function" ? formatCurrency(loan.amount) : loan.amount;
        const emi = typeof formatCurrency === "function" ? formatCurrency(loan.emi) : loan.emi;
        const outstanding = typeof formatCurrency === "function" ? formatCurrency(loan.outstanding) : loan.outstanding;

        return `
            <tr>
                <td>${safeName}</td>
                <td>${safeBank}</td>
                <td>${amount}</td>
                <td>${emi}</td>
                <td>${outstanding}</td>
                <td>
                    <button type="button" data-action="edit" data-id="${loan.id}">Edit</button>
                    <button type="button" data-action="delete" data-id="${loan.id}">Delete</button>
                </td>
            </tr>
        `;
    },

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .split(String.fromCharCode(34)).join('&quot;')
            .replace(/'/g, '&#39;');
    },

    saveLoan() {
        const loan = this.readForm();

        if (!loan) {
            return;
        }

        // Enterprise integration: indicate save/update progress.
        this.showOperationLoader(this.currentLoanId ? "Updating loan..." : "Saving loan...");

        try {
            if (this.currentLoanId) {
                loan.id = this.currentLoanId;
                LoanService.updateLoan(loan);
                this.notify("success", "Loan updated successfully.");
            } else {
                LoanService.createLoan(loan);
                this.notify("success", "Loan saved successfully.");
            }

            this.loadLoans();
            this.resetForm();
        } catch (error) {
            const normalized = this.normalizeServiceError(error, "Unable to save loan.");
            console.error(error);
            this.notify("error", [normalized.message, normalized.errors.join(" ")].filter(Boolean).join(" "));
        } finally {
            // Enterprise integration: always clear loader after save/update attempt.
            this.hideOperationLoader();
        }
    },

    editLoan(id) {
        const loan = LoanService.getLoanById(id);

        if (!loan) {
            return;
        }

        this.currentLoanId = loan.id;

        if (this.elements.loanName) {
            this.elements.loanName.value = loan.loanName || "";
        }

        if (this.elements.bankName) {
            this.elements.bankName.value = loan.bank || "";
        }

        if (this.elements.loanAmount) {
            this.elements.loanAmount.value = loan.amount || "";
        }

        if (this.elements.loanInterest) {
            this.elements.loanInterest.value = loan.interest || "";
        }

        if (this.elements.loanTenure) {
            this.elements.loanTenure.value = loan.tenure || "";
        }

        if (this.elements.loanDate) {
            this.elements.loanDate.value = loan.startDate || "";
        }
    },

    deleteLoan(id) {
        if (!confirm("Delete this loan?")) {
            return;
        }

        // Enterprise integration: indicate delete progress.
        this.showOperationLoader("Deleting loan...");

        try {

            const result = LoanService.deleteLoan(id);
            if (result && result.error) {
                this.notify("error", result.error);
                return;
            }

            this.notify("success", "Loan deleted.");
            this.loadLoans();
        } finally {
            // Enterprise integration: always clear loader after delete attempt.
            this.hideOperationLoader();
        }
    },

    updateSummary() {
        const summary = LoanService.getLoanSummary();

        if (this.elements.loanCount) {
            this.elements.loanCount.textContent = summary.totalLoans || 0;
        }

        if (this.elements.loanOutstanding) {
            this.elements.loanOutstanding.textContent = typeof formatCurrency === "function"
                ? formatCurrency(summary.totalOutstanding)
                : summary.totalOutstanding;
        }

        if (this.elements.loanEMI) {
            this.elements.loanEMI.textContent = typeof formatCurrency === "function"
                ? formatCurrency(summary.totalEMI)
                : summary.totalEMI;
        }
    },

    searchLoans(keyword) {
        const loans = LoanService.searchLoans(keyword);
        this.renderLoanTable(loans);
    },

    sortLoans(field, order = "asc") {
        const loans = LoanService.sortLoans(field, order);
        this.renderLoanTable(loans);
    },

    resetForm() {
        if (this.elements.form) {
            this.elements.form.reset();
        }

        this.currentLoanId = null;
    },

    readForm() {
        if (!this.elements.loanName || !this.elements.bankName || !this.elements.loanAmount || !this.elements.loanInterest || !this.elements.loanTenure || !this.elements.loanDate) {
            return null;
        }

        return {
            loanName: this.elements.loanName.value.trim(),
            bank: this.elements.bankName.value.trim(),
            amount: Number(this.elements.loanAmount.value),
            interest: Number(this.elements.loanInterest.value),
            tenure: Number(this.elements.loanTenure.value),
            startDate: this.elements.loanDate.value
        };
    }

};

console.log("✔ Loan Controller Loaded");

document.addEventListener("DOMContentLoaded", () => {
    LoanController.initialize();
});
