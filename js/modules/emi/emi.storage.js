"use strict";

const EMIStorage = {
    storageKey: "sfm_emi_records",

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const records = data ? JSON.parse(data) : [];

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