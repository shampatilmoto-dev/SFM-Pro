"use strict";

const ReportsStorage = {
    sharedKey: "SFM_DATABASE",
    emiKey: "sfm_emi_records",

    isPlainObject(value) {
        return Boolean(value) && Object.prototype.toString.call(value) === "[object Object]";
    },

    hasUnsafeKeys(value, depth = 0) {
        if (depth > 20) {
            return true;
        }

        if (Array.isArray(value)) {
            return value.some(item => this.hasUnsafeKeys(item, depth + 1));
        }

        if (!value || typeof value !== "object") {
            return false;
        }

        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null) {
            return true;
        }

        return Object.keys(value).some(key => {
            if (["__proto__", "prototype", "constructor"].includes(key)) {
                return true;
            }

            return this.hasUnsafeKeys(value[key], depth + 1);
        });
    },

    safeParse(raw, options = {}) {
        const maxLength = Number.isInteger(Number(options.maxLength))
            ? Math.max(128, Number(options.maxLength))
            : 8 * 1024 * 1024;

        if (typeof raw !== "string" || raw.length === 0 || raw.length > maxLength) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw);

            if (options.expectArray === true) {
                return Array.isArray(parsed) && !this.hasUnsafeKeys(parsed) ? parsed : null;
            }

            return this.isPlainObject(parsed) && !this.hasUnsafeKeys(parsed) ? parsed : null;
        } catch (error) {
            return null;
        }
    },

    loadSharedDatabase() {
        try {
            const raw = localStorage.getItem(this.sharedKey);
            const parsed = raw ? this.safeParse(raw, { maxLength: 8 * 1024 * 1024 }) : {};

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
            const parsed = raw ? this.safeParse(raw, { expectArray: true, maxLength: 4 * 1024 * 1024 }) : [];
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
