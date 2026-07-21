"use strict";

const IncomeService = {
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

    createOperationError(message, response) {
        const error = new Error(message);
        error.response = response;
        return error;
    },

    loadIncomes() {
        return IncomeStorage.getAll();
    },

    getIncomeById(id) {
        return IncomeStorage.getById(id);
    },

    createIncome(income) {
        const validation = IncomeEngine.validateIncome(income);
        const validationResult = this.fromValidation(validation, "Income validation failed.");

        if (!validationResult.success) {
            throw this.createOperationError(
                validationResult.errors.join(" ") || validationResult.message,
                validationResult
            );
        }

        const incomeToSave = IncomeEngine.calculateIncome({
            ...validationResult.data,
            id: income.id || IncomeStorage.generateId()
        });

        const created = IncomeStorage.add(incomeToSave);

        if (!created) {
            const failure = this.createResponse({
                data: incomeToSave,
                errors: ["Income save failed."],
                warnings: validationResult.warnings,
                message: "Income save failed."
            });

            throw this.createOperationError(failure.message, failure);
        }

        return this.createResponse({
            success: true,
            data: this.getIncomeById(incomeToSave.id) || created || incomeToSave,
            warnings: validationResult.warnings,
            message: "Income saved successfully."
        });
    },

    updateIncome(income) {
        if (!income || !income.id) {
            const failure = this.createResponse({
                errors: ["Income id is required."],
                message: "Income update failed."
            });

            throw this.createOperationError(failure.message, failure);
        }

        const validation = IncomeEngine.validateIncome(income);
        const validationResult = this.fromValidation(validation, "Income validation failed.");

        if (!validationResult.success) {
            throw this.createOperationError(
                validationResult.errors.join(" ") || validationResult.message,
                validationResult
            );
        }

        const incomeToSave = IncomeEngine.calculateIncome(validationResult.data);
        const updated = IncomeStorage.update(income.id, incomeToSave);

        if (!updated) {
            const failure = this.createResponse({
                data: incomeToSave,
                errors: ["Income update failed."],
                warnings: validationResult.warnings,
                message: "Income update failed."
            });

            throw this.createOperationError(failure.message, failure);
        }

        return this.createResponse({
            success: true,
            data: this.getIncomeById(income.id) || incomeToSave,
            warnings: validationResult.warnings,
            message: "Income updated successfully."
        });
    },

    deleteIncome(id) {
        if (!id) {
            return this.createResponse({
                errors: ["Income id is required."],
                message: "Income delete failed."
            });
        }

        const deleted = IncomeStorage.remove(id);

        if (!deleted) {
            return this.createResponse({
                errors: ["Income delete failed."],
                message: "Income delete failed."
            });
        }

        return this.createResponse({
            success: true,
            data: { id },
            message: "Income deleted successfully."
        });
    },

    getIncomeSummary() {
        return IncomeEngine.getIncomeSummary(IncomeStorage.getAll());
    },

    searchIncomes(keyword) {
        const query = String(keyword || "").trim().toLowerCase();

        if (query === "") {
            return IncomeStorage.getAll();
        }

        return IncomeStorage.getAll().filter(income => {
            const source = String(income.source || "").toLowerCase();
            const category = String(income.category || "").toLowerCase();
            const notes = String(income.notes || "").toLowerCase();
            return source.includes(query) || category.includes(query) || notes.includes(query);
        });
    },

    sortIncomes(field, order = "asc") {
        const key = field || "date";
        const direction = String(order).toLowerCase() === "desc" ? -1 : 1;
        const incomes = [...IncomeStorage.getAll()];

        incomes.sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];

            if (key === "date") {
                return (Date.parse(aValue) - Date.parse(bValue)) * direction;
            }

            const aNumber = Number(aValue);
            const bNumber = Number(bValue);

            if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
                return (aNumber - bNumber) * direction;
            }

            return String(aValue || "").localeCompare(String(bValue || "")) * direction;
        });

        return incomes;
    }
};
