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

function createElement() {
    return {
        value: '',
        textContent: '',
        innerHTML: '',
        className: '',
        listeners: {},
        addEventListener(type, callback) { this.listeners[type] = callback; },
        reset() {}
    };
}

test('Expense page invokes its controller after the module scripts load', () => {
    const source = fs.readFileSync(path.join(root, 'pages/expense.html'), 'utf8');
    const controllerIndex = source.indexOf('../js/modules/expense/expense.controller.js');
    const initializationIndex = source.indexOf('ExpenseController.initialize()');

    assert(controllerIndex >= 0, 'Expense controller script is missing');
    assert(initializationIndex > controllerIndex, 'Expense controller is not initialized after loading');
});

test('Expense controller initialization binds controls and renders the empty state', () => {
    const elements = {};
    [
        'expenseForm', 'expenseTitle', 'expenseCategory', 'expenseAmount',
        'expenseDate', 'expensePaymentMethod', 'expenseNotes', 'saveExpenseBtn',
        'expenseMessage', 'expenseSearch', 'expenseFilterCategory',
        'expenseFilterPayment', 'expenseSort', 'expenseTableBody',
        'expenseTotal', 'expenseCount'
    ].forEach(id => { elements[id] = createElement(); });

    elements.expenseSort.value = 'date_desc';
    const context = {
        console: { log() {} },
        document: { getElementById(id) { return elements[id] || null; } },
        window: { confirm() { return true; } },
        ExpenseService: {
            loadExpenses() { return []; },
            filterExpenses(records) { return records; },
            searchExpenses(records) { return records; },
            sortExpenses(records) { return records; },
            getSummary(records) { return { total: 0, count: records.length }; }
        },
        formatCurrency(value) { return '₹' + Number(value).toFixed(2); },
        formatDate(value) { return value; },
        Array,
        Number,
        String
    };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(
        fs.readFileSync(path.join(root, 'js/modules/expense/expense.controller.js'), 'utf8'),
        context
    );
    vm.runInContext('globalThis.ControllerRef = ExpenseController;', context);
    context.ControllerRef.initialize();

    assert(Boolean(elements.expenseForm.listeners.submit), 'expense form submit handler was not bound');
    assert(Boolean(elements.expenseSearch.listeners.input), 'expense search handler was not bound');
    assert(Boolean(elements.expenseSort.listeners.change), 'expense sort handler was not bound');
    assert(elements.expenseTableBody.innerHTML.includes('No expense records found.'), 'empty state did not render');
    assert(elements.expenseTotal.textContent === '₹0.00', 'expense summary did not render');
});

const failures = results.filter(result => result.status === 'failed');
process.stdout.write(JSON.stringify({
    passed: results.length - failures.length,
    failed: failures.length,
    failures
}, null, 2) + '\n');
process.exitCode = failures.length ? 1 : 0;
