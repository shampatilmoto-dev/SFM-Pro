'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(
    path.join(__dirname, '..', 'js/modules/dashboard/dashboard.init.js'),
    'utf8'
);
const results = [];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function createRuntime() {
    const values = new Map();
    const context = {
        console: { log() {} },
        sessionStorage: {
            getItem(key) { return values.has(key) ? values.get(key) : null; },
            setItem(key, value) { values.set(String(key), String(value)); },
            removeItem(key) { values.delete(String(key)); }
        },
        window: { location: { href: 'dashboard.html' } },
        document: {},
        Map
    };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(source, context);
    return { context, values };
}

function test(name, callback) {
    try {
        callback();
        results.push({ name, status: 'passed' });
    } catch (error) {
        results.push({ name, status: 'failed', error: error.message });
    }
}

test('Recognizes an active login session', () => {
    const { context, values } = createRuntime();
    values.set('sfmLoggedIn', 'true');
    assert(context.hasActiveSession(), 'active session was not recognized');
    assert(context.window.location.href === 'dashboard.html', 'active session should not redirect');
});

test('Redirects an unauthenticated dashboard visit to login', () => {
    const { context } = createRuntime();
    assert(!context.hasActiveSession(), 'missing session should fail');
    assert(context.window.location.href === 'login.html', 'missing session did not redirect to login');
});

test('Clears the session and redirects on logout', () => {
    const { context, values } = createRuntime();
    values.set('sfmLoggedIn', 'true');
    values.set('sfmUser', 'Sham');
    context.logout();
    assert(!values.has('sfmLoggedIn') && !values.has('sfmUser'), 'logout did not clear session data');
    assert(context.window.location.href === 'login.html', 'logout did not redirect to login');
});

const failures = results.filter(result => result.status === 'failed');
process.stdout.write(JSON.stringify({
    passed: results.length - failures.length,
    failed: failures.length,
    failures
}, null, 2) + '\n');
process.exitCode = failures.length ? 1 : 0;
