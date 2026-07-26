'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const factoryPath = path.join(root, 'js', 'repositories', 'repository.factory.js');
const factorySource = fs.readFileSync(factoryPath, 'utf8');

const defaultFirestoreApi = {
    async createDocument() { throw new Error('default Firestore adapter should not run in QA'); },
    async deleteDocument() { throw new Error('default Firestore adapter should not run in QA'); },
    async queryCollection() { throw new Error('default Firestore adapter should not run in QA'); },
    async readDocument() { throw new Error('default Firestore adapter should not run in QA'); },
    async updateDocument() { throw new Error('default Firestore adapter should not run in QA'); }
};
const defaultAuthenticationManager = {
    async initialize() {},
    getCurrentUser() { return null; }
};

const testableSource = factorySource
    .replace(
        /import\s*\{[\s\S]*?\}\s*from\s*"\.\.\/firebase\/firebase-firestore\.js";/,
        'const { createDocument, deleteDocument, queryCollection, readDocument, updateDocument } = globalThis.__defaultFirestoreApi;'
    )
    .replace(
        /import\s*\{\s*AuthenticationManager\s*\}\s*from\s*"\.\.\/managers\/authentication\.manager\.js";/,
        'const AuthenticationManager = globalThis.__defaultAuthenticationManager;'
    )
    .replace(
        /export\s*\{[\s\S]*?\};\s*$/,
        'globalThis.__repositoryExports = { RepositoryError, createRepository, normalizeRepositoryError };'
    );

const context = {
    __defaultAuthenticationManager: defaultAuthenticationManager,
    __defaultFirestoreApi: defaultFirestoreApi,
    TextEncoder
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(testableSource, context, { filename: factoryPath });

const {
    RepositoryError,
    createRepository,
    normalizeRepositoryError
} = context.__repositoryExports;

const tests = [];

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function test(name, callback) {
    tests.push({ name, callback });
}

function payload(values) {
    return Object.assign(Object.create(null), values);
}

function createAuthenticationManager(user = { uid: 'user-42' }) {
    return {
        initializeCalls: 0,
        async initialize() {
            this.initializeCalls += 1;
        },
        getCurrentUser() {
            return user;
        }
    };
}

function createFirestoreApi(seed = []) {
    const calls = [];
    const documents = new Map(seed.map((entry) => [entry.id, entry.data]));
    let generatedId = 0;

    return {
        calls,
        documents,
        async createDocument(collectionPath, data) {
            const id = `generated-${++generatedId}`;
            calls.push({ method: 'create', collectionPath, id, data });
            documents.set(id, data);
            return id;
        },
        async updateDocument(collectionPath, id, data) {
            calls.push({ method: 'update', collectionPath, id, data });

            if (!documents.has(id)) {
                throw { code: 'not-found', message: 'raw missing document details' };
            }

            documents.set(id, { ...documents.get(id), ...data });
        },
        async deleteDocument(collectionPath, id) {
            calls.push({ method: 'delete', collectionPath, id });
            documents.delete(id);
        },
        async readDocument(collectionPath, id) {
            calls.push({ method: 'read', collectionPath, id });
            return documents.has(id) ? { id, data: documents.get(id) } : null;
        },
        async queryCollection(collectionPath) {
            calls.push({ method: 'query', collectionPath });
            return [...documents].map(([id, data]) => ({ id, data }));
        }
    };
}

async function expectRepositoryError(action, code) {
    try {
        await action();
        throw new Error(`Expected ${code} but operation succeeded.`);
    } catch (error) {
        assert(error instanceof RepositoryError, 'error is not a RepositoryError');
        assert(error.code === code, `expected ${code}, received ${error.code}`);
        return error;
    }
}

test('Exposes the identical common contract and user-scoped paths', async () => {
    const authenticationManager = createAuthenticationManager();
    const firestoreApi = createFirestoreApi();
    const repository = createRepository('income', {
        authenticationManager,
        firestoreApi
    });
    const expectedMethods = [
        'clear', 'count', 'delete', 'exists', 'getAll', 'getById', 'save', 'update'
    ];

    assert(
        JSON.stringify(Object.keys(repository).sort()) === JSON.stringify(expectedMethods),
        'repository contract does not match the required methods'
    );

    const id = await repository.save(payload({ amount: 100 }));
    assert(id === 'generated-1', 'save did not return the generated identifier');
    assert(await repository.exists(id), 'saved document does not exist');
    assert((await repository.getById(id)).data.amount === 100, 'getById returned incorrect data');
    await repository.update(id, payload({ amount: 125 }));
    assert((await repository.getAll()).length === 1, 'getAll returned an incorrect result');
    assert(await repository.count() === 1, 'count returned an incorrect value');
    await repository.delete(id);
    assert(await repository.count() === 0, 'delete did not remove the document');

    assert(authenticationManager.initializeCalls > 0, 'authentication was not initialized');
    assert(
        firestoreApi.calls.every((call) => call.collectionPath === 'users/user-42/income'),
        'a Firestore operation escaped the authenticated user path'
    );
});

test('Creates every requested domain repository with the approved collection path', () => {
    const domains = {
        'income.repository.js': ['IncomeRepository', 'income'],
        'expense.repository.js': ['ExpenseRepository', 'expense'],
        'budget.repository.js': ['BudgetRepository', 'budget'],
        'loan.repository.js': ['LoanRepository', 'loans'],
        'investment.repository.js': ['InvestmentRepository', 'investments'],
        'creditcard.repository.js': ['CreditCardRepository', 'creditcards'],
        'emi.repository.js': ['EMIRepository', 'emi'],
        'dashboard.repository.js': ['DashboardRepository', 'dashboard'],
        'settings.repository.js': ['SettingsRepository', 'settings'],
        'reports.repository.js': ['ReportsRepository', 'reports']
    };

    Object.entries(domains).forEach(([fileName, [exportName, collectionName]]) => {
        const source = fs.readFileSync(
            path.join(root, 'js', 'repositories', fileName),
            'utf8'
        );

        assert(
            source.includes(`const ${exportName} = createRepository("${collectionName}")`),
            `${fileName} has the wrong export or collection`
        );
        assert(!source.includes('firebase-firestore.js'), `${fileName} bypasses the factory`);
    });
});

test('Rejects unauthenticated access before calling Firestore', async () => {
    const firestoreApi = createFirestoreApi();
    const repository = createRepository('expense', {
        authenticationManager: createAuthenticationManager(null),
        firestoreApi
    });

    await expectRepositoryError(
        () => repository.getAll(),
        'repository/unauthenticated'
    );
    assert(firestoreApi.calls.length === 0, 'Firestore ran without an authenticated user');
});

test('Rejects invalid document IDs and empty payloads', async () => {
    const firestoreApi = createFirestoreApi();
    const repository = createRepository('budget', {
        authenticationManager: createAuthenticationManager(),
        firestoreApi
    });

    for (const id of ['', ' padded ', 'folder/document', '__reserved__']) {
        await expectRepositoryError(
            () => repository.getById(id),
            'repository/invalid-document-id'
        );
    }

    for (const data of [null, [], {}, Object.create(null)]) {
        await expectRepositoryError(
            () => repository.save(data),
            'repository/invalid-payload'
        );
    }

    assert(firestoreApi.calls.length === 0, 'invalid input reached Firestore');
});

test('Normalizes Firebase failures without exposing raw exception details', async () => {
    const rawMessage = 'sensitive Firebase rule details';
    const firestoreApi = createFirestoreApi();
    firestoreApi.queryCollection = async () => {
        throw { code: 'permission-denied', message: rawMessage };
    };
    const repository = createRepository('reports', {
        authenticationManager: createAuthenticationManager(),
        firestoreApi
    });

    const error = await expectRepositoryError(
        () => repository.getAll(),
        'repository/permission-denied'
    );
    assert(
        error.message === 'You do not have permission to access this data.',
        'permission error was not normalized'
    );
    assert(!error.message.includes(rawMessage), 'raw Firebase message was exposed');

    const unknown = normalizeRepositoryError(new Error(rawMessage), 'reports', 'read');
    assert(!unknown.message.includes(rawMessage), 'unknown raw error was exposed');
});

test('Clears documents with individual writes and reports the deleted count', async () => {
    const firestoreApi = createFirestoreApi([
        { id: 'one', data: payload({ value: 1 }) },
        { id: 'two', data: payload({ value: 2 }) }
    ]);
    const repository = createRepository('settings', {
        authenticationManager: createAuthenticationManager(),
        firestoreApi
    });

    assert(await repository.clear() === 2, 'clear returned the wrong deleted count');
    assert(firestoreApi.documents.size === 0, 'clear left documents behind');
    assert(
        firestoreApi.calls.filter((call) => call.method === 'delete').length === 2,
        'clear did not use individual deletes'
    );
});

test('Keeps Firestore isolated and documents every public repository method', () => {
    const javascriptFiles = fs.readdirSync(path.join(root, 'js'), { recursive: true })
        .filter((entry) => String(entry).endsWith('.js'));
    const directImports = javascriptFiles.filter((entry) => {
        const relative = String(entry).replace(/\\/g, '/');
        const source = fs.readFileSync(path.join(root, 'js', entry), 'utf8');
        return source.includes('firebase-firestore.js') &&
            !['firebase/firebase-firestore.js', 'firebase/firebase-init.js',
                'repositories/repository.factory.js'].includes(relative);
    });

    assert(directImports.length === 0, `Firestore boundary bypassed by: ${directImports}`);
    assert(!/localStorage|sessionStorage/.test(factorySource), 'repository accesses browser storage');
    assert(!/batchWrite|runFirestoreTransaction|onSnapshot/.test(factorySource),
        'repository enables a forbidden Firestore feature');
    assert(
        (factorySource.match(/@throws \{RepositoryError\}/g) || []).length >= 8,
        'public repository methods are missing @throws documentation'
    );
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

    const failures = results.filter((result) => result.status === 'failed');
    process.stdout.write(JSON.stringify({
        passed: results.length - failures.length,
        failed: failures.length,
        failures
    }, null, 2) + '\n');
    process.exitCode = failures.length ? 1 : 0;
})();
