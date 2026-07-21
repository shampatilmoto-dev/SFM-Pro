'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const timestamp = '2026-07-20T10:00:00.000Z';
const testResults = [];

function readSource(relativePath) {
    return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function runTest(name, callback) {
    try {
        callback();
        testResults.push({ name, status: 'passed' });
    } catch (error) {
        testResults.push({ name, status: 'failed', error: error.message });
    }
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function makeRecord(id, fields) {
    return {
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...fields
    };
}

function createRuntime() {
    const store = new Map();
    const localStorage = {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(String(key), String(value));
        },
        removeItem(key) {
            store.delete(String(key));
        },
        clear() {
            store.clear();
        }
    };
    const context = {
        console: { log() {}, warn() {}, error() {} },
        localStorage,
        structuredClone,
        TextEncoder,
        Date,
        JSON,
        Set,
        Map,
        Object,
        Array,
        Number,
        String,
        RegExp,
        Error,
        encodeURIComponent,
        unescape,
        window: {},
        document: {}
    };

    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(readSource('js/engine/storage.js'), context, { filename: 'storage.js' });
    vm.runInContext(readSource('js/modules/emi/emi.storage.js'), context, { filename: 'emi.storage.js' });
    vm.runInContext(readSource('js/services/dashboard.service.js'), context, { filename: 'dashboard.service.js' });
    vm.runInContext(readSource('js/modules/dashboard/backup.manager.js'), context, { filename: 'backup.manager.js' });
    vm.runInContext('globalThis.ServiceRef = DashboardService; globalThis.BackupRef = BackupManager; globalThis.EmiRef = EMIStorage;', context);

    return context;
}

function createSampleData() {
    return {
        income: [makeRecord('income-1', {
            source: 'Salary',
            category: 'Salary',
            amount: 125000,
            date: '2026-07-01'
        })],
        expenses: [makeRecord('expense-1', {
            title: 'Rent',
            category: 'Housing',
            amount: 25000,
            date: '2026-07-02',
            paymentMethod: 'Bank'
        })],
        budgets: [makeRecord('budget-1', {
            category: 'Housing',
            amount: 40000,
            month: '07',
            year: 2026
        })],
        loans: [makeRecord('loan-1', {
            loanName: 'Home Loan',
            bank: 'SFM Bank',
            amount: 2500000,
            interest: 8.5,
            tenure: 240,
            startDate: '2025-01-01',
            outstanding: 2400000
        })],
        creditcards: [makeRecord('card-1', {
            bankName: 'SFM Bank',
            cardName: 'Enterprise Card',
            cardType: 'Visa',
            limit: 200000,
            outstanding: 25000,
            billingDate: '2026-07-10',
            dueDate: '2026-07-25'
        })],
        emi: [makeRecord('emi-1', {
            name: 'Car EMI',
            monthlyAmount: 15000,
            totalAmount: 600000,
            paidAmount: 150000,
            dueDate: '2026-07-23'
        })],
        investments: [makeRecord('investment-1', {
            name: 'Index Fund',
            type: 'Mutual Fund',
            investedAmount: 100000,
            currentValue: 120000,
            amount: 100000,
            current: 120000,
            date: '2026-06-15'
        })],
        goals: [makeRecord('goal-1', {
            name: 'Emergency Fund',
            type: 'Emergency Fund',
            targetAmount: 300000,
            currentSavedAmount: 120000,
            monthlyContribution: 15000,
            targetDate: '2027-07-01'
        })],
        recurring: [makeRecord('recurring-1', {
            recordType: 'recurring-template',
            name: 'Monthly SIP',
            type: 'Savings Goal Contribution',
            amount: 15000,
            frequency: 'Monthly',
            startDate: '2026-07-01',
            nextRunDate: '2026-08-01',
            status: 'Active'
        })]
    };
}

function configureServices(context, sampleData) {
    context.IncomeService = {
        loadIncomes: () => sampleData.income,
        getIncomeSummary: () => ({ totalIncome: sampleData.income.reduce((sum, item) => sum + Number(item.amount), 0) })
    };
    context.ExpenseService = {
        loadExpenses: () => sampleData.expenses,
        getSummary: () => ({ total: sampleData.expenses.reduce((sum, item) => sum + Number(item.amount), 0) })
    };
    context.BudgetService = {
        loadBudgets: () => sampleData.budgets,
        getSummary: () => ({ totalBudget: sampleData.budgets.reduce((sum, item) => sum + Number(item.amount), 0) })
    };
    context.LoanService = {
        loadLoans: () => sampleData.loans,
        getLoanSummary: () => ({ totalOutstanding: sampleData.loans.reduce((sum, item) => sum + Number(item.outstanding), 0) })
    };
    context.CreditCardService = {
        loadCards: () => sampleData.creditcards,
        getSummary: () => ({ totalOutstanding: sampleData.creditcards.reduce((sum, item) => sum + Number(item.outstanding), 0) })
    };
    context.EMIService = {
        loadEMIs: () => sampleData.emi,
        getSummary: () => ({ totalOutstanding: sampleData.emi.reduce((sum, item) => sum + Number(item.totalAmount - item.paidAmount), 0) })
    };
    context.GoalsPlanner = { load: () => sampleData.goals };
    context.RecurringManager = { load: () => sampleData.recurring };
    context.window.getInvestmentRecords = () => sampleData.investments;
}

function buildPayload(context, sampleData) {
    configureServices(context, sampleData);
    return context.ServiceRef.getBackupSnapshot();
}

function setRestoredServiceSources(context) {
    context.IncomeService.loadIncomes = () => context.getAllRecords('income');
    context.ExpenseService.loadExpenses = () => context.getAllRecords('expenses');
    context.BudgetService.loadBudgets = () => context.getAllRecords('budgets');
    context.LoanService.loadLoans = () => context.getAllRecords('loans');
    context.CreditCardService.loadCards = () => context.getAllRecords('creditcards');
    context.EMIService.loadEMIs = () => context.EmiRef.load();
    context.GoalsPlanner.load = () => context.getAllRecords('goals');
    context.RecurringManager.load = () => context.getAllRecords('reminders')
        .filter(item => item.recordType === 'recurring-template');
    context.window.getInvestmentRecords = () => context.getAllRecords('investments');
}

function prepare() {
    const context = createRuntime();
    const sampleData = createSampleData();
    const payload = buildPayload(context, sampleData);
    return { context, sampleData, payload };
}

runTest('Exports a valid v3.5 JSON payload with every persisted backup module', () => {
    const { context, payload } = prepare();
    assert(context.ServiceRef.validateBackupData(payload).valid, 'v3.5 payload should validate');
    assert(Object.keys(payload.data).length === 9, 'payload should contain nine persisted modules');
    assert(JSON.parse(JSON.stringify(payload)).version === 'v3.5', 'export should be JSON serializable');
});

runTest('Restores all persisted modules after local storage is cleared', () => {
    const { context, sampleData, payload } = prepare();
    context.localStorage.clear();
    context.initializeStorage();
    context.EmiRef.save([]);
    context.replaceModule('reminders', [makeRecord('reminder-1', { recordType: 'other-reminder', name: 'Keep me' })]);

    const result = context.BackupRef.restore(payload);
    assert(result.success, result.error || 'restore should succeed');

    ['income', 'expenses', 'budgets', 'loans', 'creditcards', 'investments', 'goals'].forEach(module => {
        assert(context.getAllRecords(module).length === sampleData[module].length, module + ' did not restore');
    });

    assert(context.EmiRef.load().length === sampleData.emi.length, 'EMI records did not restore');
    assert(context.getAllRecords('reminders').filter(item => item.recordType === 'recurring-template').length === 1, 'recurring records did not restore');
    assert(context.getAllRecords('reminders').some(item => item.recordType === 'other-reminder'), 'non-recurring reminders should be preserved');

    setRestoredServiceSources(context);
    assert(Array.isArray(context.ServiceRef.getNotifications()), 'notifications should recalculate after restore');
    assert(Array.isArray(context.ServiceRef.getFinancialCalendarEvents()), 'calendar should recalculate after restore');
});

runTest('Rejects a duplicate restore in the same session', () => {
    const { context, payload } = prepare();
    assert(context.BackupRef.restore(payload).success, 'first restore should succeed');
    assert(Boolean(context.BackupRef.restore(payload).error), 'duplicate restore should be rejected');
});

runTest('Supports v3.3 and v3.4 payloads without recurring templates', () => {
    ['v3.3', 'v3.4'].forEach(version => {
        const { context, payload } = prepare();
        const legacyPayload = clone(payload);
        legacyPayload.version = version;
        delete legacyPayload.data.recurring;
        assert(context.ServiceRef.validateBackupData(legacyPayload).valid, version + ' should validate');
        assert(context.BackupRef.restore(legacyPayload).success, version + ' should restore');
    });
});

runTest('Rejects empty, invalid JSON, random text, and oversized files safely', () => {
    const { context } = prepare();
    assert(Boolean(context.BackupRef.parseBackupFile('').error), 'empty file should be rejected');
    assert(Boolean(context.BackupRef.parseBackupFile('{bad').error), 'invalid JSON should be rejected');
    assert(Boolean(context.BackupRef.parseBackupFile('not a backup').error), 'random text should be rejected');
    assert(Boolean(context.BackupRef.parseBackupFile('x'.repeat(context.BackupRef.maxBackupBytes + 1)).error), 'oversized file should be rejected');
});

runTest('Rejects missing data, unsupported versions, and malformed arrays', () => {
    const { context, payload } = prepare();
    const missingData = clone(payload);
    delete missingData.data;
    assert(!context.ServiceRef.validateBackupData(missingData).valid, 'missing data should fail');

    const unsupported = clone(payload);
    unsupported.version = 'v9.9';
    assert(!context.ServiceRef.validateBackupData(unsupported).valid, 'unsupported version should fail');

    const malformed = clone(payload);
    malformed.data.income = {};
    assert(!context.ServiceRef.validateBackupData(malformed).valid, 'wrong module type should fail');

    const nullRecord = clone(payload);
    nullRecord.data.expenses = [null];
    assert(!context.ServiceRef.validateBackupData(nullRecord).valid, 'null records should fail');
});

runTest('Rejects unsafe keys, unexpected structures, duplicate identifiers, and corrupted timestamps', () => {
    const { context, payload } = prepare();
    const unsafe = clone(payload);
    Object.defineProperty(unsafe.data, '__proto__', { value: [], enumerable: true });
    assert(!context.ServiceRef.validateBackupData(unsafe).valid, 'prototype pollution should fail');

    const unexpected = clone(payload);
    unexpected.data.unknownModule = [];
    assert(!context.ServiceRef.validateBackupData(unexpected).valid, 'unexpected modules should fail');

    const duplicated = clone(payload);
    duplicated.data.income.push(clone(duplicated.data.income[0]));
    assert(!context.ServiceRef.validateBackupData(duplicated).valid, 'duplicate identifiers should fail');

    const unsafeIdentifier = clone(payload);
    unsafeIdentifier.data.income[0].id = 'unsafe identifier!';
    assert(!context.ServiceRef.validateBackupData(unsafeIdentifier).valid, 'unsafe identifiers should fail');

    const badTimestamp = clone(payload);
    badTimestamp.generatedAt = 'not-a-timestamp';
    assert(!context.ServiceRef.validateBackupData(badTimestamp).valid, 'corrupted generated timestamp should fail');
});

runTest('Rejects invalid module values without mutating storage', () => {
    const { context, payload } = prepare();
    const invalidIncome = clone(payload);
    invalidIncome.data.income[0].amount = 0;
    assert(!context.ServiceRef.validateBackupData(invalidIncome).valid, 'invalid income should fail');

    const invalidEmi = clone(payload);
    invalidEmi.data.emi[0].paidAmount = 999999;
    assert(!context.ServiceRef.validateBackupData(invalidEmi).valid, 'invalid EMI should fail');

    const invalidGoal = clone(payload);
    invalidGoal.data.goals[0].targetDate = '2026-02-31';
    assert(!context.ServiceRef.validateBackupData(invalidGoal).valid, 'invalid goal date should fail');

    const originalIncome = context.getAllRecords('income');
    assert(Boolean(context.BackupRef.restore(invalidIncome).error), 'invalid restore should return an error');
    assert(JSON.stringify(context.getAllRecords('income')) === JSON.stringify(originalIncome), 'invalid restore must not change storage');
});

runTest('Rolls back every written module when a restore write fails', () => {
    const { context, payload } = prepare();
    const originalIncome = [makeRecord('original-income', {
        source: 'Original Salary',
        category: 'Salary',
        amount: 1,
        date: '2026-01-01'
    })];
    context.replaceModule('income', originalIncome);
    const originalReplaceModule = context.replaceModule;
    let writeCount = 0;

    context.replaceModule = (module, records) => {
        writeCount += 1;
        return writeCount === 3 ? false : originalReplaceModule(module, records);
    };

    const result = context.BackupRef.restore(payload);
    context.replaceModule = originalReplaceModule;

    assert(Boolean(result.error), 'failed write should produce a friendly error');
    assert(JSON.stringify(context.getAllRecords('income')) === JSON.stringify(originalIncome), 'income should roll back');
    assert(context.getAllRecords('expenses').length === 0, 'expenses should roll back');
    assert(context.getAllRecords('budgets').length === 0, 'budgets should roll back');
});

runTest('Measures export, import validation, and restore performance for a large valid payload', () => {
    const { context, payload } = prepare();
    const largePayload = clone(payload);
    largePayload.data.income = Array.from({ length: 25000 }, (_, index) => ({
        ...clone(payload.data.income[0]),
        id: 'large-income-' + index
    }));

    const memoryBefore = process.memoryUsage().heapUsed;
    const exportStarted = process.hrtime.bigint();
    const serialized = JSON.stringify(largePayload);
    const exportMs = Number(process.hrtime.bigint() - exportStarted) / 1000000;
    const importStarted = process.hrtime.bigint();
    const parsed = context.BackupRef.parseBackupFile(serialized);
    const validation = context.ServiceRef.validateBackupData(parsed.payload);
    const importMs = Number(process.hrtime.bigint() - importStarted) / 1000000;
    const restoreStarted = process.hrtime.bigint();
    const restore = context.BackupRef.restore(parsed.payload);
    const restoreMs = Number(process.hrtime.bigint() - restoreStarted) / 1000000;
    const memoryAfter = process.memoryUsage().heapUsed;

    assert(validation.valid, validation.error || 'large payload should validate');
    assert(restore.success, restore.error || 'large payload should restore');
    testResults.push({
        name: 'Large payload performance summary',
        status: 'metric',
        exportMs: Number(exportMs.toFixed(2)),
        importMs: Number(importMs.toFixed(2)),
        restoreMs: Number(restoreMs.toFixed(2)),
        serializedBytes: Buffer.byteLength(serialized),
        heapDeltaBytes: memoryAfter - memoryBefore
    });
});

const passed = testResults.filter(result => result.status === 'passed').length;
const failed = testResults.filter(result => result.status === 'failed');
const output = {
    passed,
    failed: failed.length,
    failures: failed,
    metrics: testResults.filter(result => result.status === 'metric')
};

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
process.exitCode = failed.length > 0 ? 1 : 0;
