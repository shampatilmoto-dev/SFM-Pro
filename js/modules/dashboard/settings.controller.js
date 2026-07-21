'use strict';

const SettingsController = {
    initialized: false,

    allowed: {
        currency: ['INR', 'USD', 'EUR', 'GBP'],
        dateFormat: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
        decimalPlaces: [0, 2, 3],
        theme: ['light', 'dark']
    },

    initialize() {
        if (this.initialized) {
            return;
        }

        this.form = document.getElementById('settingsForm');
        this.status = document.getElementById('settingsStatus');
        this.savedAt = document.getElementById('settingsSavedAt');

        if (!this.form || !window.SettingsManager) {
            this.announce('Settings could not be initialized. Please return to the dashboard and try again.', 'error');
            return;
        }

        this.fields = {
            currency: document.getElementById('settingsCurrency'),
            dateFormat: document.getElementById('settingsDateFormat'),
            decimalPlaces: document.getElementById('settingsDecimalPlaces'),
            notificationsEnabled: document.getElementById('settingsNotificationsEnabled'),
            dueDateReminders: document.getElementById('settingsDueDateReminders')
        };
        this.themeFields = Array.from(document.querySelectorAll('input[name=theme]'));

        this.form.addEventListener('submit', event => this.save(event));
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => this.reset());
        this.themeFields.forEach(field => {
            field.addEventListener('change', () => this.previewTheme());
        });

        this.populate(window.SettingsManager.load());
        this.initialized = true;
    },

    getFormSettings() {
        const theme = this.themeFields.find(field => field.checked)?.value;

        return {
            currency: this.fields.currency?.value,
            dateFormat: this.fields.dateFormat?.value,
            decimalPlaces: Number(this.fields.decimalPlaces?.value),
            theme,
            notificationsEnabled: Boolean(this.fields.notificationsEnabled?.checked),
            dueDateReminders: Boolean(this.fields.dueDateReminders?.checked)
        };
    },

    validate(settings) {
        if (!this.allowed.currency.includes(settings.currency)) {
            return 'Choose a supported currency.';
        }

        if (!this.allowed.dateFormat.includes(settings.dateFormat)) {
            return 'Choose a supported date format.';
        }

        if (!this.allowed.decimalPlaces.includes(settings.decimalPlaces)) {
            return 'Choose a supported decimal precision.';
        }

        if (!this.allowed.theme.includes(settings.theme)) {
            return 'Choose a theme preference.';
        }

        return '';
    },

    save(event) {
        event.preventDefault();

        const settings = this.getFormSettings();
        const validationMessage = this.validate(settings);

        if (validationMessage) {
            this.announce(validationMessage, 'error');
            return;
        }

        const saved = window.SettingsManager.save(settings);
        if (!saved) {
            this.announce('Settings were not saved. Review your selections and try again.', 'error');
            return;
        }

        this.populate(saved);
        this.announce('Preferences saved for this browser.', 'success');
    },

    reset() {
        const defaults = window.SettingsManager?.reset();

        if (!defaults) {
            this.announce('Settings could not be reset. Please try again.', 'error');
            return;
        }

        this.populate(defaults);
        this.announce('Default preferences restored.', 'success');
    },

    previewTheme() {
        const theme = this.themeFields.find(field => field.checked)?.value;

        if (this.allowed.theme.includes(theme)) {
            document.documentElement.setAttribute('data-theme', theme);
            document.body.classList.toggle('dark', theme === 'dark');
        }
    },

    populate(settings) {
        if (!settings || !this.fields) {
            return;
        }

        this.fields.currency.value = settings.currency;
        this.fields.dateFormat.value = settings.dateFormat;
        this.fields.decimalPlaces.value = String(settings.decimalPlaces);
        this.fields.notificationsEnabled.checked = Boolean(settings.notificationsEnabled);
        this.fields.dueDateReminders.checked = Boolean(settings.dueDateReminders);
        this.themeFields.forEach(field => {
            field.checked = field.value === settings.theme;
        });
        this.previewTheme();

        if (this.savedAt) {
            this.savedAt.textContent = 'Preferences load automatically when this page opens.';
        }
    },

    announce(message, state) {
        if (!this.status) {
            return;
        }

        this.status.textContent = message;
        this.status.dataset.state = state;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SettingsController.initialize();
});
