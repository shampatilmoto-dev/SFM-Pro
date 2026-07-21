'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const results = [];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function test(name, callback) {
    try {
        callback();
        results.push({ name, status: 'passed' });
    } catch (error) {
        results.push({ name, status: 'failed', error: error.message });
    }
}

function runtime() {
    const values = new Map();
    const classNames = new Set();
    const context = {
        APP_CONFIG: { STORAGE: { SETTINGS: 'SFM_SETTINGS' } },
        localStorage: {
            getItem(key) { return values.has(key) ? values.get(key) : null; },
            setItem(key, value) { values.set(String(key), String(value)); },
            removeItem(key) { values.delete(String(key)); }
        },
        document: {
            documentElement: { setAttribute() {} },
            body: { classList: { toggle(name, enabled) { enabled ? classNames.add(name) : classNames.delete(name); } } },
            addEventListener() {}
        },
        Object,
        JSON,
        String,
        Number,
        Boolean,
        Array,
        Set
    };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(root, 'js/modules/dashboard/settings.manager.js'), 'utf8'), context);
    vm.runInContext(fs.readFileSync(path.join(root, 'js/modules/dashboard/settings.controller.js'), 'utf8'), context);
    vm.runInContext('globalThis.ManagerRef = SettingsManager; globalThis.ControllerRef = SettingsController;', context);
    return { context, values, classNames };
}

test('Loads safe defaults and persists valid preferences', () => {
    const { context, values, classNames } = runtime();
    const saved = context.SettingsManager.save({
        currency: 'USD',
        theme: 'dark',
        dateFormat: 'YYYY-MM-DD',
        decimalPlaces: 3,
        notificationsEnabled: false,
        dueDateReminders: true
    });

    assert(saved.currency === 'USD', 'currency was not saved');
    assert(saved.decimalPlaces === 3, 'decimal precision was not saved');
    assert(JSON.parse(values.get('SFM_SETTINGS')).theme === 'dark', 'settings were not persisted');
    assert(values.get('sfm_dark_mode') === 'true', 'dashboard theme synchronization was not persisted');
    assert(classNames.has('dark'), 'dark theme was not applied');

    const reloaded = new context.ManagerRef();
    assert(reloaded.load().currency === 'USD', 'persisted settings did not reload');
});

test('Rejects malformed values and unexpected keys without changing saved preferences', () => {
    const { context } = runtime();
    const initial = context.SettingsManager.load();

    assert(context.SettingsManager.save({ currency: 'INVALID' }) === null, 'invalid currency should be rejected');
    assert(context.SettingsManager.save({ decimalPlaces: 9 }) === null, 'invalid precision should be rejected');
    assert(context.SettingsManager.save({ extraSetting: true }) === null, 'unexpected key should be rejected');

    const pollution = JSON.parse('{"__proto__": {"polluted": true}}');
    assert(context.SettingsManager.save(pollution) === null, 'prototype pollution payload should be rejected');
    assert(context.SettingsManager.load().currency === initial.currency, 'rejected input changed settings');
});

test('Resets preferences and validates controller form values', () => {
    const { context, values } = runtime();
    context.SettingsManager.save({ theme: 'dark' });
    const reset = context.SettingsManager.reset();

    assert(reset.currency === 'INR' && reset.theme === 'light', 'reset did not restore defaults');
    assert(values.get('sfm_dark_mode') === 'false', 'reset did not synchronize dashboard theme');
    assert(context.ControllerRef.validate({
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        decimalPlaces: 2,
        theme: 'light'
    }) === '', 'valid controller form data should pass');
    assert(Boolean(context.ControllerRef.validate({
        currency: 'INR',
        dateFormat: 'invalid',
        decimalPlaces: 2,
        theme: 'light'
    })), 'invalid controller form data should fail');
});

const failures = results.filter(result => result.status === 'failed');
process.stdout.write(JSON.stringify({
    passed: results.length - failures.length,
    failed: failures.length,
    failures
}, null, 2) + '\n');
process.exitCode = failures.length ? 1 : 0;
