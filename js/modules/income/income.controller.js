"use strict";

const IncomeController = {

    currentIncomeId: null,
    initialized: false,

    elements: {
        form: null,
        saveButton: null,
        tableBody: null,
        incomeSource: null,
        incomeCategory: null,
        incomeAmount: null,
        incomeDate: null,
        incomeNotes: null,
        incomeSearch: null,
        incomeSort: null,
        incomeCount: null,
        incomeTotal: null
    },

    initialize() {
        if (this.initialized) {
            return;
        }

        if (typeof IncomeService !== "object") {
            console.error("IncomeService is required for IncomeController.");
            return;
        }

        this.cacheElements();
        this.bindEvents();
        this.loadIncomes();
        this.initialized = true;
    },

    cacheElements() {
        this.elements.form = document.getElementById("incomeForm");
        this.elements.saveButton = document.getElementById("saveIncomeBtn");
        this.elements.tableBody = document.getElementById("incomeTableBody");
        this.elements.incomeSource = document.getElementById("incomeSource");
        this.elements.incomeCategory = document.getElementById("incomeCategory");
        this.elements.incomeAmount = document.getElementById("incomeAmount");
        this.elements.incomeDate = document.getElementById("incomeDate");
        this.elements.incomeNotes = document.getElementById("incomeNotes");
        this.elements.incomeSearch = document.getElementById("incomeSearch");
        this.elements.incomeSort = document.getElementById("incomeSort");
        this.elements.incomeCount = document.getElementById("incomeCount");
        this.elements.incomeTotal = document.getElementById("incomeTotal");
    },

    bindEvents() {
        if (this.elements.form) {
            this.elements.form.addEventListener("submit", event => {
                event.preventDefault();
                this.saveIncome();
            });
        }

        if (this.elements.saveButton) {
            this.elements.saveButton.addEventListener("click", () => {
                this.saveIncome();
            });
        }

        if (this.elements.tableBody) {
            this.elements.tableBody.addEventListener("click", event => {
                const button = event.target.closest("button[data-action]");

                if (!button) {
                    return;
                }

                const action = button.dataset.action;
                const id = button.dataset.id;

                if (action === "edit") {
                    this.editIncome(id);
                    return;
                }

                if (action === "delete") {
                    this.deleteIncome(id);
                }
            });
        }

        if (this.elements.incomeSearch) {
            this.elements.incomeSearch.addEventListener("input", () => {
                this.searchAndRender();
            });
        }

        if (this.elements.incomeSort) {
            this.elements.incomeSort.addEventListener("change", () => {
                this.sortAndRender();
            });
        }
    },

    loadIncomes() {
        const incomes = IncomeService.loadIncomes();
        this.renderIncomeTable(incomes);
        this.updateSummary(incomes);
    },

    normalizeServiceResult(result, successMessage = "Operation completed.", failureMessage = "Operation failed.") {
        if (result && typeof result === "object" && (
            Object.prototype.hasOwnProperty.call(result, "success") ||
            Object.prototype.hasOwnProperty.call(result, "errors") ||
            Object.prototype.hasOwnProperty.call(result, "warnings") ||
            Object.prototype.hasOwnProperty.call(result, "message")
        )) {
            const errors = Array.isArray(result.errors)
                ? result.errors.filter(Boolean)
                : (result.error ? [result.error] : []);

            const warnings = Array.isArray(result.warnings)
                ? result.warnings.filter(Boolean)
                : [];

            const success = typeof result.success === "boolean"
                ? result.success
                : (result.valid === true && errors.length === 0);

            return {
                success,
                data: result.data ?? null,
                errors,
                warnings,
                message: result.message || (success ? successMessage : failureMessage)
            };
        }

        if (result && typeof result === "object" && result.error) {
            return {
                success: false,
                data: null,
                errors: [result.error],
                warnings: [],
                message: failureMessage
            };
        }

        if (result && typeof result === "object") {
            return {
                success: true,
                data: result,
                errors: [],
                warnings: [],
                message: successMessage
            };
        }

        if (typeof result === "boolean") {
            return {
                success: result,
                data: null,
                errors: result ? [] : [failureMessage],
                warnings: [],
                message: result ? successMessage : failureMessage
            };
        }

        return {
            success: false,
            data: null,
            errors: [failureMessage],
            warnings: [],
            message: failureMessage
        };
    },

    getDisplayMessage(result, fallback) {
        const parts = [];

        if (result.message) {
            parts.push(result.message);
        }

        if (Array.isArray(result.errors) && result.errors.length > 0) {
            parts.push(result.errors.join(" "));
        }

        if (Array.isArray(result.warnings) && result.warnings.length > 0) {
            parts.push(result.warnings.join(" "));
        }

        return parts.join(" ").trim() || fallback;
    },

    renderIncomeTable(incomes) {
        if (!this.elements.tableBody) {
            return;
        }

        if (!Array.isArray(incomes) || incomes.length === 0) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No Income Records</td>
                </tr>
            `;
            return;
        }

        this.elements.tableBody.innerHTML = incomes.map(income => this.renderIncomeRow(income)).join("");
    },

    renderIncomeRow(income) {
        const safeSource = this.escapeHtml(income.source || '');
        const safeCategory = this.escapeHtml(income.category || '');
        const safeNotes = this.escapeHtml(income.notes || '-');
        const amount = typeof formatCurrency === "function" ? formatCurrency(income.amount) : income.amount;
        const date = typeof formatDate === "function" ? formatDate(income.date) : income.date;

        return `
            <tr>
                <td>${date}</td>
                <td>${safeSource}</td>
                <td>${safeCategory}</td>
                <td>${amount}</td>
                <td>${safeNotes}</td>
                <td>
                    <button type="button" data-action="edit" data-id="${income.id}">Edit</button>
                    <button type="button" data-action="delete" data-id="${income.id}">Delete</button>
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

    saveIncome() {
        const income = this.readForm();

        if (!income) {
            return;
        }

        try {
            if (this.currentIncomeId) {
                income.id = this.currentIncomeId;

                const operation = this.normalizeServiceResult(
                    IncomeService.updateIncome(income),
                    "Income updated successfully.",
                    "Unable to update income."
                );

                if (!operation.success) {
                    alert(this.getDisplayMessage(operation, "Unable to update income."));
                    return;
                }

                const updateMessage = operation.warnings.length > 0
                    ? this.getDisplayMessage(operation, "Income updated successfully.")
                    : "Income updated successfully.";

                alert(updateMessage);
            } else {
                const operation = this.normalizeServiceResult(
                    IncomeService.createIncome(income),
                    "Income saved successfully.",
                    "Unable to save income."
                );

                if (!operation.success) {
                    alert(this.getDisplayMessage(operation, "Unable to save income."));
                    return;
                }

                const saveMessage = operation.warnings.length > 0
                    ? this.getDisplayMessage(operation, "Income saved successfully.")
                    : "Income saved successfully.";

                alert(saveMessage);
            }

            this.loadIncomes();
            this.resetForm();
            this.refreshDashboard();
        } catch (error) {
            const normalizedError = error && error.response
                ? this.normalizeServiceResult(error.response, "Unable to save income.", "Unable to save income.")
                : this.normalizeServiceResult({ error: error?.message || "Unable to save income." }, "Unable to save income.", "Unable to save income.");

            console.error(error);
            alert(this.getDisplayMessage(normalizedError, "Unable to save income."));
        }
    },

    editIncome(id) {
        const income = IncomeService.getIncomeById(id);

        if (!income) {
            return;
        }

        this.currentIncomeId = income.id;

        if (this.elements.incomeSource) {
            this.elements.incomeSource.value = income.source || "";
        }

        if (this.elements.incomeCategory) {
            this.elements.incomeCategory.value = income.category || "";
        }

        if (this.elements.incomeAmount) {
            this.elements.incomeAmount.value = income.amount || "";
        }

        if (this.elements.incomeDate) {
            this.elements.incomeDate.value = income.date || "";
        }

        if (this.elements.incomeNotes) {
            this.elements.incomeNotes.value = income.notes || "";
        }
    },

    deleteIncome(id) {
        if (!confirm("Delete this income?")) {
            return;
        }

        try {
            const operation = this.normalizeServiceResult(
                IncomeService.deleteIncome(id),
                "Income deleted successfully.",
                "Unable to delete income."
            );

            if (!operation.success) {
                alert(this.getDisplayMessage(operation, "Unable to delete income."));
                return;
            }

            const deleteMessage = operation.warnings.length > 0
                ? this.getDisplayMessage(operation, "Income deleted successfully.")
                : "Income deleted successfully.";

            alert(deleteMessage);
            this.loadIncomes();
            this.resetForm();
            this.refreshDashboard();
        } catch (error) {
            const normalizedError = error && error.response
                ? this.normalizeServiceResult(error.response, "Unable to delete income.", "Unable to delete income.")
                : this.normalizeServiceResult({ error: error?.message || "Unable to delete income." }, "Unable to delete income.", "Unable to delete income.");

            console.error(error);
            alert(this.getDisplayMessage(normalizedError, "Unable to delete income."));
        }
    },

    updateSummary(incomes) {
        const summary = IncomeService.getIncomeSummary();
        const count = summary.totalEntries || 0;
        const totalIncome = summary.totalIncome || 0;

        if (this.elements.incomeCount) {
            this.elements.incomeCount.textContent = count;
        }

        if (this.elements.incomeTotal) {
            this.elements.incomeTotal.textContent = typeof formatCurrency === "function"
                ? formatCurrency(totalIncome)
                : totalIncome;
        }
    },

    searchAndRender() {
        const keyword = this.elements.incomeSearch?.value || "";
        const incomes = IncomeService.searchIncomes(keyword);
        this.renderIncomeTable(incomes);
        this.updateSummary(incomes);
    },

    sortAndRender() {
        const field = this.elements.incomeSort?.value || "date";
        const incomes = IncomeService.sortIncomes(field, "asc");
        this.renderIncomeTable(incomes);
        this.updateSummary(incomes);
    },

    resetForm() {
        if (this.elements.form) {
            this.elements.form.reset();
        }

        this.currentIncomeId = null;
    },

    refreshDashboard() {
        if (typeof DashboardController !== "undefined" && typeof DashboardController.refresh === "function") {
            DashboardController.refresh();
            return;
        }

        if (typeof refreshDashboard === "function") {
            refreshDashboard();
        }
    },

    readForm() {
        if (!this.elements.incomeSource || !this.elements.incomeCategory || !this.elements.incomeAmount || !this.elements.incomeDate) {
            return null;
        }

        const source = this.elements.incomeSource.value.trim();
        const category = this.elements.incomeCategory.value;
        const amount = Number(this.elements.incomeAmount.value);
        const date = this.elements.incomeDate.value;
        const notes = this.elements.incomeNotes?.value.trim() || "";

        if (!source || !category || !date || amount <= 0) {
            alert("Please fill all required fields.");
            return null;
        }

        return {
            source,
            category,
            amount,
            date,
            notes
        };
    }

};

function initializeIncomeController() {
    IncomeController.initialize();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeIncomeController, { once: true });
} else {
    initializeIncomeController();
}
