"use strict";

const GoalsPlanner = {
    moduleName: "goals",

    load() {
        return typeof getAllRecords === "function"
            ? getAllRecords(this.moduleName)
            : [];
    },

    getById(id) {
        return typeof getRecordById === "function"
            ? getRecordById(this.moduleName, id)
            : null;
    },

    validate(goal) {
        if (!goal || !String(goal.name || "").trim()) {
            return "Goal name is required.";
        }

        if (!Number.isFinite(Number(goal.targetAmount)) || Number(goal.targetAmount) <= 0) {
            return "Target amount must be greater than zero.";
        }

        if (Number(goal.currentSavedAmount || 0) < 0) {
            return "Current saved amount cannot be negative.";
        }

        if (Number(goal.monthlyContribution || 0) < 0) {
            return "Monthly contribution cannot be negative.";
        }

        if (!goal.targetDate) {
            return "Target date is required.";
        }

        return "";
    },

    save(id, goal) {
        const error = this.validate(goal);

        if (error) {
            return { error };
        }

        const normalized = {
            name: String(goal.name).trim(),
            type: String(goal.type || "Custom"),
            targetAmount: Number(goal.targetAmount),
            currentSavedAmount: Number(goal.currentSavedAmount || 0),
            monthlyContribution: Number(goal.monthlyContribution || 0),
            targetDate: goal.targetDate
        };

        if (id) {
            return typeof updateRecord === "function" && updateRecord(this.moduleName, id, normalized)
                ? { success: true }
                : { error: "Unable to update goal." };
        }

        const saved = typeof createRecord === "function"
            ? createRecord(this.moduleName, normalized)
            : null;

        return saved ? { success: true, goal: saved } : { error: "Unable to save goal." };
    },

    remove(id) {
        return typeof deleteRecord === "function" && deleteRecord(this.moduleName, id)
            ? { success: true }
            : { error: "Unable to delete goal." };
    }
};
