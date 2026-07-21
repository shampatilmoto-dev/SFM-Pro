class SettingsManager {
    constructor() {
        this.storageKey = typeof APP_CONFIG !== 'undefined'
            ? APP_CONFIG.STORAGE.SETTINGS
            : 'SFM_SETTINGS';
        this.defaults = Object.freeze({
            currency: 'INR',
            theme: 'light',
            dateFormat: 'DD/MM/YYYY',
            decimalPlaces: 2,
            notificationsEnabled: true,
            dueDateReminders: true
        });
        this.settings = this.readStoredSettings();
        this.applyTheme();
    }

    isPlainObject(value) {
        return Boolean(value) && Object.prototype.toString.call(value) === '[object Object]';
    }

    hasUnsafeKeys(value, depth = 0) {
        if (depth > 20) {
            return true;
        }

        if (Array.isArray(value)) {
            return value.some(item => this.hasUnsafeKeys(item, depth + 1));
        }

        if (!this.isPlainObject(value)) {
            return false;
        }

        return Object.keys(value).some(key => {
            if (['__proto__', 'prototype', 'constructor'].includes(key)) {
                return true;
            }

            const child = value[key];
            return (Array.isArray(child) || this.isPlainObject(child)) && this.hasUnsafeKeys(child, depth + 1);
        });
    }

    safeParseJson(raw) {
        if (typeof raw !== 'string' || raw.length === 0 || raw.length > 65535) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw);

            if (!this.isPlainObject(parsed) || this.hasUnsafeKeys(parsed)) {
                return null;
            }

            return parsed;
        } catch (error) {
            return null;
        }
    }

    normalize(settings, base = this.defaults) {
        if (!this.isPlainObject(settings)) {
            return null;
        }

        const allowedKeys = [
            'currency',
            'theme',
            'dateFormat',
            'decimalPlaces',
            'notificationsEnabled',
            'dueDateReminders'
        ];
        if (!Object.keys(settings).every(key => allowedKeys.includes(key))) {
            return null;
        }

        const allowed = {
            currency: ['INR', 'USD', 'EUR', 'GBP'],
            theme: ['light', 'dark'],
            dateFormat: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
            decimalPlaces: [0, 2, 3]
        };
        const next = { ...base };

        if (Object.prototype.hasOwnProperty.call(settings, 'currency')) {
            if (!allowed.currency.includes(settings.currency)) return null;
            next.currency = settings.currency;
        }

        if (Object.prototype.hasOwnProperty.call(settings, 'theme')) {
            if (!allowed.theme.includes(settings.theme)) return null;
            next.theme = settings.theme;
        }

        if (Object.prototype.hasOwnProperty.call(settings, 'dateFormat')) {
            if (!allowed.dateFormat.includes(settings.dateFormat)) return null;
            next.dateFormat = settings.dateFormat;
        }

        if (Object.prototype.hasOwnProperty.call(settings, 'decimalPlaces')) {
            if (!allowed.decimalPlaces.includes(Number(settings.decimalPlaces))) return null;
            next.decimalPlaces = Number(settings.decimalPlaces);
        }

        ['notificationsEnabled', 'dueDateReminders'].forEach(key => {
            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                if (typeof settings[key] !== 'boolean') {
                    next.invalid = true;
                    return;
                }
                next[key] = settings[key];
            }
        });

        if (next.invalid) {
            delete next.invalid;
            return null;
        }

        return next;
    }

    readStoredSettings() {
        try {
            if (typeof localStorage === 'undefined') {
                return { ...this.defaults };
            }

            const raw = localStorage.getItem(this.storageKey);
            if (!raw) {
                return { ...this.defaults };
            }

            const parsed = this.safeParseJson(raw);

            if (!parsed) {
                return { ...this.defaults };
            }

            return this.normalize(parsed) || { ...this.defaults };
        } catch (error) {
            return { ...this.defaults };
        }
    }

    persist() {
        try {
            if (typeof localStorage === 'undefined') {
                return false;
            }

            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            return true;
        } catch (error) {
            return false;
        }
    }

    applyTheme() {
        const darkMode = this.settings.theme === 'dark';

        if (typeof document !== 'undefined') {
            document.documentElement?.setAttribute('data-theme', this.settings.theme);
            document.body?.classList.toggle('dark', darkMode);
        }

        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sfm_dark_mode', String(darkMode));
            }
        } catch (error) {
            return false;
        }

        return true;
    }

    load() {
        return { ...this.settings };
    }

    save(settings) {
        if (!this.isPlainObject(settings)) {
            return null;
        }

        const next = this.normalize(settings, this.settings);
        if (!next) {
            return null;
        }

        this.settings = next;
        this.persist();
        this.applyTheme();
        return this.load();
    }

    reset() {
        this.settings = { ...this.defaults };
        this.persist();
        this.applyTheme();
        return this.load();
    }
}

window.SettingsManager = new SettingsManager();
