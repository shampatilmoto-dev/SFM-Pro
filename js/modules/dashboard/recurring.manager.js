"use strict";

const RecurringManager = {
    moduleName: "reminders",
    recordType: "recurring-template",

    load() {
        const records = typeof getAllRecords === "function"
            ? getAllRecords(this.moduleName)
            : [];

        return records.filter(record => record.recordType === this.recordType);
    },

    getById(id) {
        const record = typeof getRecordById === "function"
            ? getRecordById(this.moduleName, id)
            : null;

        return record?.recordType === this.recordType ? record : null;
    },

    validate(template) {
        if (!String(template?.name || "").trim()) {
            return "Template name is required.";
        }

        if (!Number.isFinite(Number(template?.amount)) || Number(template.amount) <= 0) {
            return "Amount must be greater than zero.";
        }

        if (!["Income", "Expense", "EMI Reminder", "Credit Card Reminder", "Savings Goal Contribution"].includes(template?.type)) {
            return "Select a valid transaction type.";
        }

        if (!["Daily", "Weekly", "Monthly", "Yearly"].includes(template?.frequency)) {
            return "Select a valid frequency.";
        }

        if (!template?.startDate) {
            return "Start date is required.";
        }

        return "";
    },

    save(id, template) {
        const error = this.validate(template);

        if (error) {
            return { error };
        }

        const normalized = {
            recordType: this.recordType,
            name: String(template.name).trim(),
            type: template.type,
            amount: Number(template.amount),
            frequency: template.frequency,
            startDate: template.startDate,
            nextRunDate: DashboardService.calculateRecurringNextRunDate(template.startDate, template.frequency),
            status: template.status === "Paused" ? "Paused" : "Active"
        };

        if (id) {
            return typeof updateRecord === "function" && updateRecord(this.moduleName, id, normalized)
                ? { success: true }
                : { error: "Unable to update recurring template." };
        }

        const saved = typeof createRecord === "function"
            ? createRecord(this.moduleName, normalized)
            : null;

        return saved ? { success: true, template: saved } : { error: "Unable to save recurring template." };
    },

    toggleStatus(id) {
        const template = this.getById(id);

        if (!template) {
            return { error: "Recurring template not found." };
        }

        const status = template.status === "Paused" ? "Active" : "Paused";

        return typeof updateRecord === "function" && updateRecord(this.moduleName, id, { status })
            ? { success: true, status }
            : { error: "Unable to update recurring template." };
    },

    remove(id) {
        const template = this.getById(id);

        if (!template) {
            return { error: "Recurring template not found." };
        }

        return typeof deleteRecord === "function" && deleteRecord(this.moduleName, id)
            ? { success: true }
            : { error: "Unable to delete recurring template." };
    }
};