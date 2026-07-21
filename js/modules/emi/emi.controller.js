"use strict";

const EMIController = {
    initialized: false,
    currentEMIId: null,

    elements: {},

    initialize() {
        if (this.initialized) {
            return;
        }

        if (typeof EMIService !== "object") {
            console.error("EMIService is required for EMIController.");
            return;
        }

        this.cacheElements();
        this.bindEvents();
        this.refresh();
        this.initialized = true;
    },

    cacheElements() {
        this.elements = {
            form: document.getElementById("emiForm"),
            name: document.getElementById("emiName"),
            monthlyAmount: document.getElementById("emiAmount"),
            totalAmount: document.getElementById("emiTotalAmount"),
            paidAmount: document.getElementById("emiPaidAmount"),
            dueDate: document.getElementById("emiDueDate"),
            search: document.getElementById("emiSearch"),
            tableBody: document.getElementById("emiTableBody"),
            monthlyEMI: document.getElementById("monthlyEmiTotal"),
            totalPaid: document.getElementById("paidEmiTotal"),
            pendingAmount: document.getElementById("pendingEmiTotal"),
            totalOutstanding: document.getElementById("emiOutstandingTotal")
        };
    },

    bindEvents() {
        if (this.elements.form) {
            this.elements.form.addEventListener("submit", event => {
                event.preventDefault();
                this.saveEMI();
            });
        }

        if (this.elements.search) {
            this.elements.search.addEventListener("input", () => this.renderTable());
        }

        if (this.elements.tableBody) {
            this.elements.tableBody.addEventListener("click", event => {
                const button = event.target.closest("button[data-action]");

                if (!button) {
                    return;
                }

                if (button.dataset.action === "edit") {
                    this.editEMI(button.dataset.id);
                }

                if (button.dataset.action === "delete") {
                    this.deleteEMI(button.dataset.id);
                }
            });
        }
    },

    saveEMI() {
        const emi = this.readForm();
        const result = this.currentEMIId
            ? EMIService.updateEMI(this.currentEMIId, emi)
            : EMIService.createEMI(emi);

        if (result.error) {
            this.showError(result.error);
            return;
        }

        this.resetForm();
        this.refresh();
    },

    editEMI(id) {
        const emi = EMIService.getEMIById(id);

        if (!emi) {
            return;
        }

        this.currentEMIId = id;
        this.elements.name.value = emi.name;
        this.elements.monthlyAmount.value = emi.monthlyAmount;
        this.elements.totalAmount.value = emi.totalAmount;
        this.elements.paidAmount.value = emi.paidAmount;
        this.elements.dueDate.value = emi.dueDate;
    },

    deleteEMI(id) {
        if (!window.confirm("Delete this EMI record?")) {
            return;
        }

        const result = EMIService.deleteEMI(id);

        if (result.error) {
            this.showError(result.error);
            return;
        }

        if (this.currentEMIId === id) {
            this.resetForm();
        }

        this.refresh();
    },

    refresh() {
        this.renderTable();
        this.renderSummary();
    },

    renderTable() {
        if (!this.elements.tableBody) {
            return;
        }

        const records = EMIService.searchEMIs(this.elements.search?.value || "");

        if (records.length === 0) {
            this.elements.tableBody.innerHTML = "<tr><td colspan=\"8\">No EMI records found.</td></tr>";
            return;
        }

        this.elements.tableBody.innerHTML = records.map(emi => `
            <tr>
                <td>${this.escape(emi.name)}</td>
                <td>${this.formatCurrency(emi.monthlyAmount)}</td>
                <td>${this.formatCurrency(emi.totalAmount)}</td>
                <td>${this.formatCurrency(emi.paidAmount)}</td>
                <td>${this.formatCurrency(emi.outstandingAmount)}</td>
                <td>${this.escape(emi.dueDate)}</td>
                <td>${this.escape(emi.status)}</td>
                <td>
                    <button type="button" data-action="edit" data-id="${emi.id}">Edit</button>
                    <button type="button" data-action="delete" data-id="${emi.id}">Delete</button>
                </td>
            </tr>
        `).join("");
    },

    renderSummary() {
        const summary = EMIService.getSummary();

        if (this.elements.monthlyEMI) {
            this.elements.monthlyEMI.textContent = this.formatCurrency(summary.monthlyEMI);
        }

        if (this.elements.totalPaid) {
            this.elements.totalPaid.textContent = this.formatCurrency(summary.totalPaid);
        }

        if (this.elements.pendingAmount) {
            this.elements.pendingAmount.textContent = this.formatCurrency(summary.pendingAmount);
        }

        if (this.elements.totalOutstanding) {
            this.elements.totalOutstanding.textContent = this.formatCurrency(summary.totalOutstanding);
        }
    },

    readForm() {
        return {
            name: this.elements.name?.value || "",
            monthlyAmount: this.elements.monthlyAmount?.value || 0,
            totalAmount: this.elements.totalAmount?.value || 0,
            paidAmount: this.elements.paidAmount?.value || 0,
            dueDate: this.elements.dueDate?.value || ""
        };
    },

    resetForm() {
        this.elements.form?.reset();
        this.currentEMIId = null;
    },

    formatCurrency(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(Number(value || 0));
    },

    escape(value) {
        const element = document.createElement("div");
        element.textContent = String(value || "");
        return element.innerHTML;
    },

    showError(message) {
        window.alert(message);
    }
};

function initializeEMIController() {
    EMIController.initialize();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeEMIController, { once: true });
} else {
    initializeEMIController();
}