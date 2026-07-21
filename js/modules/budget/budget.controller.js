"use strict";

const BudgetController = {
    currentBudgetId: null,
    budgets: [],
    isInitialized: false,

    elements: {
        form: null,
        category: null,
        amount: null,
        month: null,
        year: null,
        notes: null,
        saveButton: null,
        messageBox: null,
        search: null,
        filterCategory: null,
        sort: null,
        tableBody: null,
        total: null,
        used: null,
        remaining: null,
        utilization: null
    },

    initialize() {
        if (this.isInitialized) {
            this.loadBudgets();
            return;
        }

        this.cacheElements();
        this.bindEvents();
        this.loadBudgets();
        this.isInitialized = true;
    },

    registerEvent(target, eventName, handler) {
        if (!target || typeof handler !== "function") {
            return;
        }

        target.addEventListener(eventName, handler);
    },

    cacheElements() {
        this.elements.form = document.getElementById("budgetForm");
        this.elements.category = document.getElementById("budgetCategory");
        this.elements.amount = document.getElementById("budgetAmount");
        this.elements.month = document.getElementById("budgetMonth");
        this.elements.year = document.getElementById("budgetYear");
        this.elements.notes = document.getElementById("budgetNotes");
        this.elements.saveButton = document.getElementById("saveBudgetBtn");
        this.elements.messageBox = document.getElementById("budgetMessage");
        this.elements.search = document.getElementById("budgetSearch");
        this.elements.filterCategory = document.getElementById("budgetFilterCategory");
        this.elements.sort = document.getElementById("budgetSort");
        this.elements.tableBody = document.getElementById("budgetTableBody");
        this.elements.total = document.getElementById("budgetTotal");
        this.elements.used = document.getElementById("budgetUsed");
        this.elements.remaining = document.getElementById("budgetRemaining");
        this.elements.utilization = document.getElementById("budgetUtilization");
    },

    bindEvents() {
        if (this.elements.form) {
            this.registerEvent(this.elements.form, "submit", event => {
                event.preventDefault();
                this.handleSave();
            });
        }

        if (this.elements.search) {
            this.registerEvent(this.elements.search, "input", () => this.render());
        }

        if (this.elements.filterCategory) {
            this.registerEvent(this.elements.filterCategory, "change", () => this.render());
        }

        if (this.elements.sort) {
            this.registerEvent(this.elements.sort, "change", () => this.render());
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
                    this.editBudget(id);
                }

                if (action === "delete") {
                    this.deleteBudget(id);
                }
            });
        }
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

    loadBudgets() {
        this.budgets = BudgetService.loadBudgets();
        this.render();
    },

    render() {
        const filters = {
            category: this.elements.filterCategory?.value || ""
        };

        const query = this.elements.search?.value || "";
        const sortKey = this.elements.sort?.value || "month_desc";

        let results = BudgetService.filterBudgets(this.budgets, filters);
        results = BudgetService.searchBudgets(results, query);
        results = BudgetService.sortBudgets(results, sortKey);

        this.renderTable(results);
        this.renderSummary(this.budgets);
        this.updateAlerts(this.budgets);
    },

    renderTable(budgets) {
        if (!this.elements.tableBody) {
            return;
        }

        if (!Array.isArray(budgets) || budgets.length === 0) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No Budget Available</td>
                </tr>
            `;
            return;
        }

        this.elements.tableBody.innerHTML = budgets
            .map(budget => this.renderTableRow(budget))
            .join("");
    },

    renderTableRow(budget) {
        const usageLabel = `${Number(budget.percentage || 0).toFixed(2)}%`;
        const statusClass = BudgetEngine.getBudgetStatusClass(budget.percentage);

        return `
            <tr class="${statusClass}">
                <td>${this.formatMonthYear(budget.month, budget.year)}</td>
                <td>${this.escapeHtml(budget.category)}</td>
                <td>${formatCurrency(budget.amount)}</td>
                <td>${formatCurrency(budget.used)}</td>
                <td>${formatCurrency(budget.remaining)}</td>
                <td>${usageLabel}</td>
                <td>
                    <button type="button" data-action="edit" data-id="${budget.id}">Edit</button>
                    <button type="button" data-action="delete" data-id="${budget.id}">Delete</button>
                </td>
            </tr>
        `;
    },

    handleSave() {
        const budget = this.getFormData();
        let operation;

        if (this.currentBudgetId) {
            operation = this.normalizeServiceResult(
                BudgetService.updateBudget(this.currentBudgetId, budget),
                "Budget updated successfully.",
                "Unable to update budget."
            );
        } else {
            operation = this.normalizeServiceResult(
                BudgetService.addBudget(budget),
                "Budget added successfully.",
                "Unable to save budget."
            );
        }

        if (!operation.success) {
            const fallback = this.currentBudgetId
                ? "Unable to update budget."
                : "Unable to save budget.";
            this.showMessage(this.getDisplayMessage(operation, fallback), "error");
            return;
        }

        const successFallback = this.currentBudgetId
            ? "Budget updated successfully."
            : "Budget added successfully.";
        const successMessage = operation.warnings.length > 0
            ? this.getDisplayMessage(operation, successFallback)
            : successFallback;

        this.showMessage(successMessage, operation.warnings.length > 0 ? "warning" : "success");
        this.clearForm();
        this.loadBudgets();
        this.refreshDashboard();
    },

    getFormData() {
        return {
            category: this.elements.category?.value.trim() || "",
            amount: Number(this.elements.amount?.value || 0),
            month: this.elements.month?.value || "",
            year: Number(this.elements.year?.value || 0),
            notes: this.elements.notes?.value.trim() || ""
        };
    },

    editBudget(id) {
        const budget = BudgetService.getBudgetById(id);
        if (!budget) {
            this.showMessage("Budget not found.", "error");
            return;
        }

        this.currentBudgetId = id;
        this.elements.category.value = budget.category;
        this.elements.amount.value = budget.amount;
        this.elements.month.value = budget.month;
        this.elements.year.value = budget.year;
        this.elements.notes.value = budget.notes || "";
        this.elements.saveButton.textContent = "Update Budget";
        this.showMessage("Editing budget. Save to apply changes.", "info");
    },

    deleteBudget(id) {
        if (!window.confirm("Are you sure you want to delete this budget?")) {
            return;
        }

        const operation = this.normalizeServiceResult(
            BudgetService.deleteBudget(id),
            "Budget deleted.",
            "Unable to delete budget."
        );

        if (!operation.success) {
            this.showMessage(this.getDisplayMessage(operation, "Unable to delete budget."), "error");
            return;
        }

        this.showMessage(this.getDisplayMessage(operation, "Budget deleted."), "success");
        this.clearForm();
        this.loadBudgets();
        this.refreshDashboard();
    },

    clearForm() {
        if (this.elements.form) {
            this.elements.form.reset();
        }

        this.currentBudgetId = null;
        if (this.elements.saveButton) {
            this.elements.saveButton.textContent = "Save Budget";
        }
    },

    renderSummary(budgets) {
        const summary = BudgetService.getSummary(budgets);

        if (this.elements.total) {
            this.elements.total.textContent = formatCurrency(summary.totalBudget);
        }

        if (this.elements.used) {
            this.elements.used.textContent = formatCurrency(summary.totalUsed);
        }

        if (this.elements.remaining) {
            this.elements.remaining.textContent = formatCurrency(summary.remaining);
        }

        if (this.elements.utilization) {
            this.elements.utilization.textContent = `${summary.utilization.toFixed(2)}%`;
        }
    },

    updateAlerts(budgets) {
        const exceeded = budgets.some(budget => Number(budget.percentage) > 100);
        if (exceeded) {
            this.showMessage("Warning: One or more budgets have exceeded the planned amount.", "warning");
        } else {
            this.clearMessage();
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

    clearMessage() {
        if (!this.elements.messageBox) {
            return;
        }

        this.elements.messageBox.textContent = "";
        this.elements.messageBox.className = "message-box";
    },

    formatMonthYear(month, year) {
        if (!month || !year) {
            return "-";
        }

        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        const index = Number(month) - 1;
        return `${monthNames[index] || "Unknown"} ${year}`;
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

console.log("✔ Budget Controller Loaded");
