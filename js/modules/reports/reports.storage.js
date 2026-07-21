"use strict";

const ReportsStorage = {
    sharedKey: "SFM_DATABASE",
    emiKey: "sfm_emi_records",

    loadSharedDatabase() {
        try {
            const raw = localStorage.getItem(this.sharedKey);
            const parsed = raw ? JSON.parse(raw) : {};

            return {
                income: Array.isArray(parsed.income) ? parsed.income : [],
                expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
                budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
                loans: Array.isArray(parsed.loans) ? parsed.loans : [],
                creditcards: Array.isArray(parsed.creditcards) ? parsed.creditcards : [],
                investments: Array.isArray(parsed.investments) ? parsed.investments : [],
                transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
            };
        } catch (error) {
            return {
                income: [],
                expenses: [],
                budgets: [],
                loans: [],
                creditcards: [],
                investments: [],
                transactions: []
            };
        }
    },

    loadEMIRecords() {
        try {
            const raw = localStorage.getItem(this.emiKey);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    },

    loadSnapshot() {
        return {
            ...this.loadSharedDatabase(),
            emi: this.loadEMIRecords()
        };
    }
};
