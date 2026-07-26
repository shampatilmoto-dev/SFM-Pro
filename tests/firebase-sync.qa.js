'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const syncPath = path.join(root, 'js', 'firebase', 'firebase-sync.js');
const syncSource = fs.readFileSync(syncPath, 'utf8');
const singletonMarker = 'const FirebaseSync = createFirebaseSyncManager();';
const singletonIndex = syncSource.indexOf(singletonMarker);

if (singletonIndex < 0) {
    throw new Error('FirebaseSync singleton marker was not found.');
}

const defaultRepositories = Object.fromEntries([
    'income', 'expense', 'budget', 'loan', 'investment',
    'creditcard', 'emi', 'dashboard', 'settings', 'reports'
].map(moduleName => [moduleName, {}]));

const testableSource = syncSource
    .slice(0, singletonIndex)
    .replace(/import\s*\{[^}]+\}\s*from\s*"[^"]+";\s*/g, '')
    .replace(
        /const DEFAULT_REPOSITORIES = Object\.freeze\(\{[\s\S]*?\n\}\);/,
        'const DEFAULT_REPOSITORIES = globalThis.__defaultRepositories;'
    )
    .replace(
        'const DATABASE_KEY = "SFM_DATABASE";',
        'const AuthenticationManager = globalThis.__authenticationManager;\nconst DATABASE_KEY = "SFM_DATABASE";'
    ) +
    '\nglobalThis.__syncExports = {' +
    'FirebaseSyncError, createDefaultStorageAdapter, createFirebaseSyncManager, ' +
    'hashPayload, normalizeModuleName};';

const context = {
    __authenticationManager: { async initialize() {}, getCurrentUser() { return { uid: 'default' }; } },
    __defaultRepositories: defaultRepositories,
    console: { error() {} },
    TextEncoder,
    Uint8Array,
    Date,
    Array,
    Map,
    Set,
    Promise,
    Math
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(testableSource, context, { filename: syncPath });

const { createDefaultStorageAdapter, createFirebaseSyncManager, normalizeModuleName } = context.__syncExports;
const tests = [];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function test(name, callback) {
    tests.push({ name, callback });
}

function payload(values) {
    return Object.assign(Object.create(null), values);
}

function createAuthentication(user = { uid: 'user-42' }) {
    return {
        initializeCalls: 0,
        async initialize() { this.initializeCalls += 1; },
        getCurrentUser() { return user; }
    };
}

function createRepository(seed = [], failureMethod = '') {
    const calls = [];
    const documents = new Map(seed.map(document => [document.id, document.data]));
    let nextId = seed.length;

    function fail(method) {
        if (failureMethod === method) {
            throw { code: 'repository/unavailable', message: 'raw Firebase details' };
        }
    }

    return {
        calls,
        documents,
        async save(data) {
            fail('save');
            const id = `remote-${++nextId}`;
            calls.push({ method: 'save', id, data });
            documents.set(id, data);
            return id;
        },
        async update(id, data) {
            fail('update');
            calls.push({ method: 'update', id, data });
            documents.set(id, data);
        },
        async delete(id) {
            fail('delete');
            calls.push({ method: 'delete', id });
            documents.delete(id);
        },
        async getAll() {
            fail('getAll');
            calls.push({ method: 'getAll' });
            return [...documents].map(([id, data]) => ({ id, data }));
        }
    };
}

function createStorage(modules = {}) {
    let state = { version: 1, modules: {} };
    return {
        readModule(moduleName) { return modules[moduleName] ?? []; },
        readSyncState() { return state; },
        writeSyncState(next) { state = next; },
        getState() { return state; }
    };
}

function createManager(options = {}) {
    const repository = options.repository ?? createRepository();
    const storageAdapter = options.storageAdapter ?? createStorage();
    const logs = [];
    const repositories = Object.fromEntries(
        Object.keys(defaultRepositories).map(moduleName => [moduleName, repository])
    );
    const manager = createFirebaseSyncManager({
        repositories,
        storageAdapter,
        authenticationManager: options.authenticationManager ?? createAuthentication(),
        isOnline: options.isOnline ?? (() => true),
        logFailure: result => logs.push(result),
        cryptoApi: {}
    });
    return { manager, repository, storageAdapter, logs };
}

test('Synchronizes create, changed update, and delete through a repository', async () => {
    const { manager, repository } = createManager();
    const created = await manager.syncChange('income', 'create', payload({ id: 'local-1', amount: 100 }));
    assert(created.success && created.created === 1, `create did not synchronize: ${JSON.stringify(created)}`);
    const updated = await manager.syncChange('income', 'update', payload({ id: 'local-1', amount: 125 }));
    assert(updated.success && updated.updated === 1, 'update did not use the mapped remote document');
    const removed = await manager.syncChange('income', 'delete', 'local-1');
    assert(removed.success && removed.deleted === 1, 'delete did not synchronize');
    assert(repository.calls.some(call => call.method === 'save'), 'repository save was not called');
    assert(repository.calls.some(call => call.method === 'update'), 'repository update was not called');
    assert(repository.calls.some(call => call.method === 'delete'), 'repository delete was not called');
});

test('Prevents duplicate uploads for unchanged records', async () => {
    const { manager, repository } = createManager();
    const record = payload({ id: 'same', amount: 100, category: 'Salary' });
    await manager.syncChange('income', 'create', record);
    const writesBefore = repository.calls.filter(call => ['save', 'update'].includes(call.method)).length;
    const result = await manager.syncChange('income', 'update', record);
    const writesAfter = repository.calls.filter(call => ['save', 'update'].includes(call.method)).length;
    assert(result.status === 'skipped' && result.code === 'sync/unchanged', `unchanged record was not skipped: ${JSON.stringify(result)}`);
    assert(writesAfter === writesBefore, 'unchanged record caused a duplicate write');
});

test('Detects remote divergence and records deterministic local-wins resolution', async () => {
    const { manager, repository, storageAdapter } = createManager();
    await manager.syncChange('income', 'create', payload({ id: 'conflict-1', amount: 100 }));
    const remoteId = storageAdapter.getState().modules.income['conflict-1'].remoteId;
    repository.documents.set(remoteId, payload({ id: 'conflict-1', amount: 90 }));
    const result = await manager.syncChange('income', 'update', payload({ id: 'conflict-1', amount: 125 }));
    const state = storageAdapter.getState().modules.income['conflict-1'];
    assert(result.success && result.conflicts === 1 && result.code === 'sync/conflict-local-wins',
        `conflict was not normalized: ${JSON.stringify(result)}`);
    assert(state.lastConflict?.strategy === 'local-wins', 'conflict resolution metadata was not retained');
    assert(repository.documents.get(remoteId).amount === 125, 'local authoritative value was not applied');
});

test('Serializes concurrent changes and prevents racing duplicate uploads', async () => {
    const { manager, repository } = createManager();
    const record = payload({ id: 'rapid', amount: 100 });
    const [first, second] = await Promise.all([
        manager.syncChange('income', 'create', record),
        manager.syncChange('income', 'create', record)
    ]);
    const writes = repository.calls.filter(call => ['save', 'update'].includes(call.method));
    assert(first.created === 1 && second.status === 'skipped', 'concurrent duplicate was not serialized');
    assert(writes.length === 1, 'concurrent duplicate caused multiple repository writes');
});

test('Merges synchronization metadata from concurrent different modules', async () => {
    const { manager, storageAdapter } = createManager();
    await Promise.all([
        manager.syncChange('income', 'create', payload({ id: 'income-fast', amount: 1 })),
        manager.syncChange('expense', 'create', payload({ id: 'expense-fast', amount: 2 }))
    ]);
    const state = storageAdapter.getState();
    assert(state.modules.income['income-fast'], 'income mapping was lost');
    assert(state.modules.expense['expense-fast'], 'expense mapping was lost');
});

test('Resets document mappings when the authenticated user changes', async () => {
    let user = { uid: 'first-user' };
    const authenticationManager = {
        async initialize() {},
        getCurrentUser() { return user; }
    };
    const { manager, repository, storageAdapter } = createManager({ authenticationManager });
    await manager.syncChange('income', 'create', payload({ id: 'shared-id', amount: 10 }));
    const firstRemoteId = storageAdapter.getState().modules.income['shared-id'].remoteId;
    user = { uid: 'second-user' };
    repository.documents.clear(); // Repositories are user-scoped in production.
    await manager.syncChange('income', 'create', payload({ id: 'shared-id', amount: 10 }));
    const secondRemoteId = storageAdapter.getState().modules.income['shared-id'].remoteId;
    assert(firstRemoteId !== secondRemoteId, 'a remote mapping leaked across authenticated users');
    assert(storageAdapter.getState().userUid === 'second-user', 'sync state was not scoped to the new user');
    assert(repository.calls.filter(call => call.method === 'save').length === 2, 'new user did not receive an isolated document');
});

test('Returns pending without repository access while offline', async () => {
    const { manager, repository } = createManager({ isOnline: () => false });
    const result = await manager.syncChange('expense', 'create', payload({ id: 'offline-1', amount: 20 }));
    assert(result.pending && result.code === 'sync/offline', 'offline result is not pending');
    assert(repository.calls.length === 0, 'offline synchronization accessed a repository');
});

test('Requires authentication without exposing repository errors', async () => {
    const { manager, repository, logs } = createManager({ authenticationManager: createAuthentication(null) });
    const result = await manager.syncModule('budget');
    assert(result.code === 'sync/authentication-required', 'unauthenticated result was not normalized');
    assert(repository.calls.length === 0, 'repository ran without authentication');
    assert(logs.length === 1, 'authentication failure was not logged');
});

test('Normalizes repository failure and keeps the promise resolved', async () => {
    const repository = createRepository([], 'save');
    const { manager, logs } = createManager({ repository });
    const result = await manager.syncChange('loan', 'create', payload({ id: 'loan-1', amount: 1000 }));
    assert(result.status === 'failed' && result.code === 'sync/service-unavailable', `repository error was not normalized: ${JSON.stringify(result)}`);
    assert(logs.length === 1 && !JSON.stringify(logs).includes('raw Firebase'), 'raw error leaked to logging');
});

test('Full synchronization reconciles new, changed, unchanged, and deleted records', async () => {
    const repository = createRepository([
        { id: 'remote-existing', data: payload({ id: 'existing', amount: 50 }) },
        { id: 'remote-orphan', data: payload({ id: 'orphan', amount: 1 }) }
    ]);
    const storageAdapter = createStorage({
        income: [payload({ id: 'existing', amount: 75 }), payload({ id: 'new', amount: 25 })]
    });
    const { manager } = createManager({ repository, storageAdapter });
    const result = await manager.syncModule('income');
    assert(result.success, `full module synchronization failed: ${JSON.stringify(result)}`);
    assert(result.updated === 1 && result.created === 1 && result.deleted === 1, 'full reconciliation counts are incorrect');
    assert([...repository.documents.values()].every(data => ['existing', 'new'].includes(data.id)), 'remote mirror does not match LocalStorage');
});

test('Dashboard synchronization never deletes typed cloud backup documents', async () => {
    const repository = createRepository([
        { id: 'backup-1', data: payload({ recordType: 'cloud-backup', payload: { version: 'v3.5' } }) }
    ]);
    const storageAdapter = createStorage({ dashboard: [payload({ id: 'dashboard', income: [] })] });
    const { manager } = createManager({ repository, storageAdapter });
    const result = await manager.syncModule('dashboard');
    assert(result.success, `dashboard sync failed: ${JSON.stringify(result)}`);
    assert(repository.documents.has('backup-1'), 'dashboard reconciliation deleted a cloud backup');
    assert(!repository.calls.some(call => call.method === 'delete' && call.id === 'backup-1'),
        'cloud backup was sent to repository delete');
});

test('Uses approved aliases and keeps Firestore isolated behind repositories', () => {
    assert(normalizeModuleName('Credit Cards') === 'creditcard', 'credit card alias failed');
    assert(normalizeModuleName('expenses') === 'expense', 'expense alias failed');
    assert(!syncSource.includes('firebase-firestore.js'), 'sync layer imports Firestore directly');
    assert(!syncSource.includes('onSnapshot'), 'sync layer enables real-time listeners');
    assert(!/batchWrite|runFirestoreTransaction|retryQueue|backgroundSync/.test(syncSource), 'forbidden synchronization feature detected');
});

test('Reads every Dashboard source without changing the primary database', () => {
    const values = new Map([
        ['SFM_DATABASE', JSON.stringify({
            profile: { name: 'User' }, income: [{ id: 'i' }], expenses: [{ id: 'e' }],
            budgets: [{ id: 'b' }], loans: [{ id: 'l' }], investments: [{ id: 'v' }],
            creditcards: [{ id: 'c' }], goals: [{ id: 'g' }], reminders: [{ id: 'r' }],
            transactions: [{ id: 't' }], metadata: { version: '3.0.0' }
        })],
        ['sfm_emi_records', JSON.stringify([{ id: 'emi' }])]
    ]);
    const adapter = createDefaultStorageAdapter({
        getItem(key) { return values.get(key) ?? null; },
        setItem(key, value) { values.set(key, value); }
    });
    const [dashboard] = adapter.readModule('dashboard');
    assert(dashboard.income.length === 1 && dashboard.expenses.length === 1, 'dashboard finance data is incomplete');
    assert(dashboard.emi.length === 1 && dashboard.transactions.length === 1, 'dashboard supplemental data is incomplete');
});

test('Exposes and documents the complete Sprint 4.5 public API', () => {
    const methods = [
        'syncIncome', 'syncExpense', 'syncBudget', 'syncLoan', 'syncInvestment',
        'syncCreditCard', 'syncEMI', 'syncDashboard', 'syncSettings', 'syncReports',
        'syncAll', 'syncModule', 'syncLocalChange'
    ];
    methods.forEach(method => {
        assert(syncSource.includes(`async function ${method}`), `${method} is missing`);
    });
    assert((syncSource.match(/@throws \{never\}/g) || []).length >= methods.length,
        'public synchronization methods are missing possible-error documentation');
});

test('Hooks only after successful LocalStorage operations and managers do not import repositories', () => {
    const storageSource = fs.readFileSync(path.join(root, 'js/engine/storage.js'), 'utf8');
    const emiSource = fs.readFileSync(path.join(root, 'js/modules/emi/emi.storage.js'), 'utf8');
    const settingsSource = fs.readFileSync(path.join(root, 'js/modules/dashboard/settings.manager.js'), 'utf8');
    const managerFiles = fs.readdirSync(path.join(root, 'js/managers'))
        .filter(file => file.endsWith('.js'));

    assert(storageSource.includes('queueFirebaseSynchronization(module, "create", result.data)'), 'create hook is missing');
    assert(storageSource.includes('if (result.success)'), 'update/delete hooks are not success-gated');
    assert(emiSource.includes('if (!this.save(records, false))'), 'EMI hook is not gated by LocalStorage success');
    assert(settingsSource.includes('localStorage.setItem(this.storageKey') && settingsSource.includes('queueSettingsSynchronization()'), 'Settings hook is missing');
    managerFiles.forEach(file => {
        const source = fs.readFileSync(path.join(root, 'js/managers', file), 'utf8');
        assert(!source.includes('/repositories/'), `${file} imports a repository`);
    });
});

(async () => {
    const results = [];
    for (const entry of tests) {
        try {
            await entry.callback();
            results.push({ name: entry.name, status: 'passed' });
        } catch (error) {
            results.push({ name: entry.name, status: 'failed', error: error.message });
        }
    }
    const failures = results.filter(result => result.status === 'failed');
    process.stdout.write(JSON.stringify({
        passed: results.length - failures.length,
        failed: failures.length,
        failures
    }, null, 2) + '\n');
    process.exitCode = failures.length ? 1 : 0;
})();
