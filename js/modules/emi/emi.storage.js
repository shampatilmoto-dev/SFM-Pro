"use strict";

const EMIStorage = {
    storageKey: "sfm_emi_records",

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

    safeParse(raw) {
        if (typeof raw !== "string" || raw.length === 0 || raw.length > 4 * 1024 * 1024) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw);

            if (!Array.isArray(parsed) || this.hasUnsafeKeys(parsed)) {
                return null;
            }

            return parsed;
        } catch (error) {
            return null;
        }
    },

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const records = data ? this.safeParse(data) : [];

            return Array.isArray(records) ? records : [];
        } catch (error) {
            return [];
        }
    },

    save(records) {
        if (!Array.isArray(records)) {
            return false;
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(records));
            return true;
        } catch (error) {
            return false;
        }
    },

    getById(id) {
        return this.load().find(record => record.id === id) || null;
    },

    add(record) {
        const records = this.load();
        records.push(record);

        return this.save(records) ? record : null;
    },

    update(id, updatedRecord) {
        const records = this.load();
        const index = records.findIndex(record => record.id === id);

        if (index === -1) {
            return false;
        }

        records[index] = updatedRecord;
        return this.save(records);
    },

    remove(id) {
        const records = this.load();
        const filteredRecords = records.filter(record => record.id !== id);

        if (filteredRecords.length === records.length) {
            return false;
        }

        return this.save(filteredRecords);
    }
};