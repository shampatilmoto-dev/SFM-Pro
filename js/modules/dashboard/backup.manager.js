'use strict';

const BackupManager = {
    version: 'v3.5',
    maxBackupBytes: 5 * 1024 * 1024,
    lastRestoredSignature: '',

    createExportPayload() {
        return typeof DashboardService === 'object'
            ? DashboardService.getBackupSnapshot()
            : { version: this.version, generatedAt: new Date().toISOString(), data: {} };
    },

    getByteLength(value) {
        const text = String(value || '');

        if (typeof TextEncoder === 'function') {
            return new TextEncoder().encode(text).length;
        }

        return unescape(encodeURIComponent(text)).length;
    },

    isFileSizeAllowed(size) {
        const bytes = Number(size);
        return Number.isFinite(bytes) && bytes >= 0 && bytes <= this.maxBackupBytes;
    },

    parseBackupFile(text) {
        if (typeof text !== 'string' || text.trim() === '') {
            return { error: 'Select a non-empty JSON backup file.' };
        }

        if (!this.isFileSizeAllowed(this.getByteLength(text))) {
            return { error: 'Backup file is too large. The maximum supported size is 5 MB.' };
        }

        try {
            const payload = JSON.parse(text);
            return { payload };
        } catch (error) {
            return { error: 'Selected file is not valid JSON.' };
        }
    },

    validate(payload) {
        return typeof DashboardService === 'object'
            ? DashboardService.validateBackupData(payload)
            : { valid: false, error: 'Unable to validate backup file.' };
    },

    copyRecords(records) {
        return (Array.isArray(records) ? records : []).map(record => ({ ...record }));
    },

    normalizePayload(payload) {
        const source = payload.data;

        return {
            version: this.version,
            generatedAt: payload.generatedAt,
            data: {
                income: this.copyRecords(source.income),
                expenses: this.copyRecords(source.expenses),
                budgets: this.copyRecords(source.budgets),
                loans: this.copyRecords(source.loans),
                creditcards: this.copyRecords(source.creditcards),
                investments: this.copyRecords(source.investments),
                emi: this.copyRecords(source.emi),
                goals: this.copyRecords(source.goals),
                recurring: this.copyRecords(source.recurring)
            }
        };
    },

    createRestoreSignature(payload) {
        return JSON.stringify(payload.data);
    },

    restore(payload) {
        const validation = this.validate(payload);

        if (!validation.valid) {
            return { error: validation.error };
        }

        if (typeof replaceModule !== 'function' || typeof getAllRecords !== 'function') {
            return { error: 'Storage engine is unavailable.' };
        }

        if (typeof EMIStorage !== 'object' || typeof EMIStorage.save !== 'function' || typeof EMIStorage.load !== 'function') {
            return { error: 'EMI storage is unavailable.' };
        }

        const normalized = this.normalizePayload(payload);
        const signature = this.createRestoreSignature(normalized);

        if (signature === this.lastRestoredSignature) {
            return { error: 'This backup has already been restored during the current session.' };
        }

        const modules = ['income', 'expenses', 'budgets', 'loans', 'creditcards', 'investments', 'goals', 'reminders'];
        const previousModules = {};

        modules.forEach(module => {
            previousModules[module] = getAllRecords(module);
        });

        const previousEmi = EMIStorage.load();
        const preservedReminders = previousModules.reminders
            .filter(reminder => reminder && reminder.recordType !== 'recurring-template');
        const writeModule = (module, records) => {
            if (replaceModule(module, records) !== true) {
                throw new Error('Unable to write ' + module + '.');
            }
        };
        const rollBack = () => {
            modules.forEach(module => {
                try {
                    replaceModule(module, previousModules[module]);
                } catch (error) {
                    // Best effort rollback keeps the original error path safe.
                }
            });

            try {
                EMIStorage.save(previousEmi);
            } catch (error) {
                // Best effort rollback keeps the original error path safe.
            }
        };

        try {
            writeModule('income', normalized.data.income);
            writeModule('expenses', normalized.data.expenses);
            writeModule('budgets', normalized.data.budgets);
            writeModule('loans', normalized.data.loans);
            writeModule('creditcards', normalized.data.creditcards);
            writeModule('investments', normalized.data.investments);
            writeModule('goals', normalized.data.goals);
            writeModule('reminders', [...preservedReminders, ...normalized.data.recurring]);

            if (EMIStorage.save(normalized.data.emi) !== true) {
                throw new Error('Unable to write EMI records.');
            }
        } catch (error) {
            rollBack();
            return { error: 'Restore failed and existing data was kept unchanged.' };
        }

        this.lastRestoredSignature = signature;
        return { success: true, restoredVersion: payload.version };
    }
};
