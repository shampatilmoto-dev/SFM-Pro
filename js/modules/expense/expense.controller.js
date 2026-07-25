"use strict";

const ExpenseController = {
    currentExpenseId: null,
    expenses: [],
    isInitialized: false,

    elements: {
        form: null,
        title: null,
        category: null,
        amount: null,
        date: null,
        paymentMethod: null,
        notes: null,
        saveButton: null,
        messageBox: null,
        search: null,
        filterCategory: null,
        filterPayment: null,
        sort: null,
        tableBody: null,
        total: null,
        count: null
    },

    handlers: {
        searchInput: null,
        filterCategoryChange: null,
        filterPaymentChange: null,
        sortChange: null
    },

    initialize() {
        if (this.isInitialized) {
            this.loadExpenses();
            return;
        }

        this.cacheElements();
        this.bindEvents();
        this.loadExpenses();
        this.isInitialized = true;
    },

    cacheElements() {
        this.elements.form = document.getElementById("expenseForm");
        this.elements.title = document.getElementById("expenseTitle");
        this.elements.category = document.getElementById("expenseCategory");
        this.elements.amount = document.getElementById("expenseAmount");
        this.elements.date = document.getElementById("expenseDate");
        this.elements.paymentMethod = document.getElementById("expensePaymentMethod");
        this.elements.notes = document.getElementById("expenseNotes");
        this.elements.saveButton = document.getElementById("saveExpenseBtn");
        this.elements.messageBox = document.getElementById("expenseMessage");
        this.elements.search = document.getElementById("expenseSearch");
        this.elements.filterCategory = document.getElementById("expenseFilterCategory");
        this.elements.filterPayment = document.getElementById("expenseFilterPayment");
        this.elements.sort = document.getElementById("expenseSort");
        this.elements.tableBody = document.getElementById("expenseTableBody");
        this.elements.total = document.getElementById("expenseTotal");
        this.elements.count = document.getElementById("expenseCount");
    },

    bindEvents() {
        if (this.elements.form) {
            this.elements.form.addEventListener("submit", event => {
                event.preventDefault();
                this.handleSave();
            });
        }

        if (this.elements.search) {
            this.handlers.searchInput = typeof Scheduler === "object" && typeof Scheduler.debounce === "function"
                ? Scheduler.debounce(() => this.render(), 120)
                : (() => this.render());
            this.elements.search.addEventListener("input", this.handlers.searchInput);
        }

        if (this.elements.filterCategory) {
            this.handlers.filterCategoryChange = () => this.render();
            this.elements.filterCategory.addEventListener("change", this.handlers.filterCategoryChange);
        }

        if (this.elements.filterPayment) {
            this.handlers.filterPaymentChange = () => this.render();
            this.elements.filterPayment.addEventListener("change", this.handlers.filterPaymentChange);
        }

        if (this.elements.sort) {
            this.handlers.sortChange = () => this.render();
            this.elements.sort.addEventListener("change", this.handlers.sortChange);
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
                    this.editExpense(id);
                }

                if (action === "delete") {
                    this.deleteExpense(id);
                }
            });
        }
    },

    loadExpenses() {
        const records = ExpenseService.loadExpenses();
        this.expenses = Array.isArray(records) ? records : [];
        this.render();
    },

    normalizeServiceResult(result, successMessage = "Operation completed.", failureMessage = "Operation failed.") {
        // New standardized response object.
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

        // Legacy: { error: "..." }
        if (result && typeof result === "object" && result.error) {
            return {
                success: false,
                data: null,
                errors: [result.error],
                warnings: [],
                message: failureMessage
            };
        }

        // Legacy: { success: true } or raw object record.
        if (result && typeof result === "object") {
            return {
                success: true,
                data: result,
                errors: [],
                warnings: [],
                message: successMessage
            };
        }

        // Legacy: boolean status.
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

    // Enterprise integration: route user notifications through NotificationManager with graceful fallback.
    notify(type, message) {
        if (window.NotificationManager && typeof NotificationManager[type] === "function") {
            NotificationManager[type](message);
            return;
        }

        this.showMessage(message, type);
    },

    // Enterprise integration: show loader for save/update/delete operations.
    showOperationLoader(message) {
        if (window.LoaderManager && typeof LoaderManager.show === "function") {
            LoaderManager.show(message);
        }
    },

    // Enterprise integration: hide loader when save/update/delete operation completes.
    hideOperationLoader() {
        if (window.LoaderManager && typeof LoaderManager.hide === "function") {
            LoaderManager.hide();
        }
    },

    render() {
        const filters = {
            category: this.elements.filterCategory?.value || "",
            paymentMethod: this.elements.filterPayment?.value || ""
        };

        const query = this.elements.search?.value || "";
        const sortKey = this.elements.sort?.value || "date_desc";

        let results = ExpenseService.filterExpenses(this.expenses, filters);
        results = ExpenseService.searchExpenses(results, query);
        results = ExpenseService.sortExpenses(results, sortKey);

        this.renderTable(results);
        this.updateSummary(this.expenses);
    },

    renderTable(expenses) {
        if (!this.elements.tableBody) {
            return;
        }

        if (!Array.isArray(expenses) || expenses.length === 0) {
            if (typeof TableRenderer === "object" && typeof TableRenderer.renderHTMLRows === "function") {
                TableRenderer.renderHTMLRows(this.elements.tableBody, [], {
                    emptyColspan: 7,
                    emptyMessage: "No expense records found."
                });
                return;
            }

            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No expense records found.</td>
                </tr>
            `;
            return;
        }

        const rows = expenses.map(expense => this.renderTableRow(expense));

        if (typeof TableRenderer === "object" && typeof TableRenderer.renderHTMLRows === "function") {
            TableRenderer.renderHTMLRows(this.elements.tableBody, rows, {
                emptyColspan: 7,
                emptyMessage: "No expense records found."
            });
            return;
        }

        this.elements.tableBody.innerHTML = rows.join("");
    },

    renderTableRow(expense) {
        return `
            <tr>
                <td>${this.escapeHtml(expense.title)}</td>
                <td>${this.escapeHtml(expense.category)}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>${formatDate(expense.date)}</td>
                <td>${this.escapeHtml(expense.paymentMethod)}</td>
                <td>${this.escapeHtml(expense.notes)}</td>
                <td>
                    <button type="button" data-action="edit" data-id="${expense.id}">Edit</button>
                    <button type="button" data-action="delete" data-id="${expense.id}">Delete</button>
                </td>
            </tr>
        `;
    },

    handleSave() {
        const expense = this.getFormData();

        // Enterprise integration: show loader before save/update starts.
        this.showOperationLoader(this.currentExpenseId ? "Updating expense..." : "Saving expense...");

        try {

            if (this.currentExpenseId) {
                const operation = this.normalizeServiceResult(
                    ExpenseService.updateExpense(this.currentExpenseId, expense),
                    "Expense updated successfully.",
                    "Unable to update expense."
                );

                if (!operation.success) {
                    const errorMessage = this.getDisplayMessage(operation, "Unable to update expense.");
                    this.showMessage(errorMessage, "error");
                    this.notify("error", errorMessage);
                    return;
                }

                const updateMessage = operation.warnings.length > 0
                    ? this.getDisplayMessage(operation, "Expense updated successfully.")
                    : "Expense updated successfully.";

                this.showMessage(updateMessage, operation.warnings.length > 0 ? "warning" : "success");
                this.notify(operation.warnings.length > 0 ? "warning" : "success", updateMessage);
            } else {
                const operation = this.normalizeServiceResult(
                    ExpenseService.addExpense(expense),
                    "Expense added successfully.",
                    "Unable to save expense."
                );

                if (!operation.success) {
                    const errorMessage = this.getDisplayMessage(operation, "Unable to save expense.");
                    this.showMessage(errorMessage, "error");
                    this.notify("error", errorMessage);
                    return;
                }

                const saveMessage = operation.warnings.length > 0
                    ? this.getDisplayMessage(operation, "Expense added successfully.")
                    : "Expense added successfully.";

                this.showMessage(saveMessage, operation.warnings.length > 0 ? "warning" : "success");
                this.notify(operation.warnings.length > 0 ? "warning" : "success", saveMessage);
            }

            this.clearForm();
            this.loadExpenses();
            this.refreshDashboard();
        } finally {
            // Enterprise integration: hide loader in finally to guarantee cleanup.
            this.hideOperationLoader();
        }
    },

    getFormData() {
        return {
            title: this.elements.title?.value.trim() || "",
            category: this.elements.category?.value.trim() || "",
            amount: Number(this.elements.amount?.value || 0),
            date: this.elements.date?.value || "",
            paymentMethod: this.elements.paymentMethod?.value.trim() || "",
            notes: this.elements.notes?.value.trim() || ""
        };
    },

    editExpense(id) {
        const expense = ExpenseService.getExpenseById(id);
        if (!expense) {
            this.showMessage("Expense not found.", "error");
            return;
        }

        this.currentExpenseId = id;
        this.elements.title.value = expense.title;
        this.elements.category.value = expense.category;
        this.elements.amount.value = expense.amount;
        this.elements.date.value = expense.date;
        this.elements.paymentMethod.value = expense.paymentMethod;
        this.elements.notes.value = expense.notes || "";
        this.elements.saveButton.textContent = "Update Expense";
        this.showMessage("Editing expense. Save to apply changes.", "info");
    },

    deleteExpense(id) {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }

        // Enterprise integration: show loader before delete starts.
        this.showOperationLoader("Deleting expense...");

        try {

            const operation = this.normalizeServiceResult(
                ExpenseService.deleteExpense(id),
                "Expense deleted.",
                "Unable to delete expense."
            );

            if (!operation.success) {
                const errorMessage = this.getDisplayMessage(operation, "Unable to delete expense.");
                this.showMessage(errorMessage, "error");
                this.notify("error", errorMessage);
                return;
            }

            const successMessage = this.getDisplayMessage(operation, "Expense deleted.");
            this.showMessage(successMessage, "success");
            this.notify("success", successMessage);
            this.clearForm();
            this.loadExpenses();
            this.refreshDashboard();
        } finally {
            // Enterprise integration: hide loader in finally to guarantee cleanup.
            this.hideOperationLoader();
        }
    },

    clearForm() {
        if (this.elements.form) {
            this.elements.form.reset();
        }

        this.currentExpenseId = null;

        if (this.elements.saveButton) {
            this.elements.saveButton.textContent = "Save Expense";
        }
    },

    updateSummary(expenses) {
        const summary = ExpenseService.getSummary(expenses);

        if (this.elements.total) {
            this.elements.total.textContent = formatCurrency(summary.total);
        }

        if (this.elements.count) {
            this.elements.count.textContent = summary.count;
        }
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

    showMessage(message, type = "info") {
        if (!this.elements.messageBox) {
            return;
        }

        this.elements.messageBox.textContent = message;
        this.elements.messageBox.className = `message-box ${type}`;
    },

    escapeHtml(value) {
        if (typeof value !== "string") {
            return value || "";
        }

        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

console.log("✔ Expense Controller Loaded");
