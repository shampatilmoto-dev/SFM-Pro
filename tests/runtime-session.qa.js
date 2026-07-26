'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const managerPath = path.join(
    __dirname,
    '..',
    'js',
    'managers',
    'authentication.manager.js'
);
const managerSource = fs.readFileSync(managerPath, 'utf8');
const singletonMarker = 'const AuthenticationManager = createAuthenticationManager();';
const singletonIndex = managerSource.indexOf(singletonMarker);

if (singletonIndex < 0) {
    throw new Error('AuthenticationManager singleton marker was not found.');
}

const testableSource = managerSource
    .slice(0, singletonIndex)
    .replace(
        /import\.meta\.url/g,
        JSON.stringify('http://127.0.0.1:5500/js/managers/authentication.manager.js')
    ) +
    '\nglobalThis.__authenticationExports = {' +
    'AuthenticationError, createAuthenticationManager, getRouteName, ' +
    'isProtectedRoute, normalizeAuthenticationError};';

const context = {
    console: { log() {}, warn() {}, error() {} },
    queueMicrotask,
    setTimeout,
    clearTimeout,
    URL
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(testableSource, context, { filename: managerPath });

const {
    createAuthenticationManager,
    isProtectedRoute,
    normalizeAuthenticationError
} = context.__authenticationExports;

const tests = [];

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function test(name, callback) {
    tests.push({ name, callback });
}

function createNavigation(pathname) {
    const replacements = [];

    return {
        replacements,
        adapter: {
            getPathname() {
                return pathname;
            },
            replace(url) {
                replacements.push(url);
            }
        }
    };
}

function createAuthAdapter(options = {}) {
    const calls = [];
    let currentUser = options.user ?? null;
    let stateListener = null;
    let errorListener = null;

    return {
        calls,
        emit(user) {
            currentUser = user;
            stateListener?.(user);
        },
        fail(error) {
            errorListener?.(error);
        },
        getCurrentUser() {
            return currentUser;
        },
        listenToAuthState(listener, onError) {
            calls.push('listen');
            stateListener = listener;
            errorListener = onError;

            if (options.autoEmit !== false) {
                queueMicrotask(() => listener(currentUser));
            }

            return () => {
                stateListener = null;
                errorListener = null;
            };
        },
        async setAuthPersistence(rememberUser) {
            calls.push(`persistence:${rememberUser}`);
        },
        async loginUser(email, password) {
            calls.push(`login:${email}:${password}`);

            if (options.loginError) {
                throw options.loginError;
            }

            currentUser = options.loginUser ?? { uid: 'user-1', email };
            stateListener?.(currentUser);
            return { user: currentUser };
        },
        async logoutUser() {
            calls.push('logout');
            currentUser = null;
            stateListener?.(null);
        }
    };
}

function createManager(pathname, authAdapter, overrides = {}) {
    const navigation = createNavigation(pathname);
    const manager = createAuthenticationManager({
        loadAuthApi: async () => authAdapter,
        navigation: navigation.adapter,
        documentRef: null,
        schedule: (callback) => callback(),
        loginUrl: '/login.html',
        dashboardUrl: '/dashboard.html',
        ...overrides
    });

    return { manager, replacements: navigation.replacements };
}

test('Waits for the first Firebase auth state before resolving initialization', async () => {
    const authAdapter = createAuthAdapter({ autoEmit: false });
    const { manager } = createManager('/dashboard.html', authAdapter);
    let settled = false;
    const firstInitialization = manager.initialize().then((user) => {
        settled = true;
        return user;
    });

    await new Promise((resolve) => setImmediate(resolve));
    assert(!settled, 'initialization resolved before Firebase emitted auth state');
    assert(authAdapter.calls.includes('listen'), 'Firebase state listener was not registered');

    const restoredUser = { uid: 'restored-user', email: 'restored@example.com' };
    authAdapter.emit(restoredUser);

    assert(await firstInitialization === restoredUser, 'restored user was not returned');
    assert(manager.initialize() === manager.initialize(), 'initialization is not idempotent');
});

test('Protects every requested route and redirects a signed-out nested page', async () => {
    const protectedFiles = [
        'dashboard.html',
        'income.html',
        'expense.html',
        'budget.html',
        'creditcards.html',
        'emi.html',
        'investments.html',
        'loans.html',
        'reports.html',
        'settings.html'
    ];

    protectedFiles.forEach((file) => {
        assert(isProtectedRoute(`/pages/${file}`), `${file} is not protected`);
    });
    assert(!isProtectedRoute('/login.html'), 'login page must not be protected');

    const authAdapter = createAuthAdapter();
    const { manager, replacements } = createManager('/pages/income.html', authAdapter);
    assert(!await manager.protectRoute(), 'signed-out route was allowed');
    assert(replacements.at(-1) === '/login.html', 'signed-out route did not redirect to login');
});

test('Restores a Firebase user on refresh without redirecting', async () => {
    const restoredUser = { uid: 'restored-user', email: 'restored@example.com' };
    const authAdapter = createAuthAdapter({ user: restoredUser });
    const { manager, replacements } = createManager('/dashboard.html', authAdapter);

    assert(await manager.protectRoute(), 'restored user was rejected');
    assert(manager.getCurrentUser() === restoredUser, 'current user was not restored');
    assert(replacements.length === 0, 'authenticated refresh redirected unexpectedly');
});

test('Sets Firebase persistence before login and honors Remember me', async () => {
    const authAdapter = createAuthAdapter();
    const { manager } = createManager('/login.html', authAdapter);

    await manager.initialize();
    await manager.login('person@example.com', 'secret', { remember: false });

    const persistenceIndex = authAdapter.calls.indexOf('persistence:false');
    const loginIndex = authAdapter.calls.indexOf('login:person@example.com:secret');
    assert(persistenceIndex >= 0, 'session persistence was not selected');
    assert(loginIndex > persistenceIndex, 'login ran before persistence was selected');
});

test('Normalizes credential failures without exposing raw Firebase text', async () => {
    const rawMessage = 'Firebase: Error (auth/invalid-credential).';
    const authAdapter = createAuthAdapter({
        loginError: { code: 'auth/invalid-credential', message: rawMessage }
    });
    const { manager } = createManager('/login.html', authAdapter);

    try {
        await manager.login('person@example.com', 'wrong');
        throw new Error('login unexpectedly succeeded');
    } catch (error) {
        assert(
            error.message === 'Invalid email or password. Please try again.',
            'credential error was not normalized'
        );
        assert(!error.message.includes(rawMessage), 'raw Firebase message was exposed');
    }

    const unknown = normalizeAuthenticationError(new Error('sensitive provider details'));
    assert(
        unknown.message === 'Authentication is temporarily unavailable. Please try again.',
        'unknown error did not use the generic message'
    );
});

test('Signs out through Firebase and redirects without custom session storage', async () => {
    const authAdapter = createAuthAdapter({
        user: { uid: 'signed-in-user', email: 'signed@example.com' }
    });
    const { manager, replacements } = createManager('/dashboard.html', authAdapter);

    await manager.initialize();
    await manager.logout();

    assert(authAdapter.calls.includes('logout'), 'Firebase logout was not called');
    assert(replacements.at(-1) === '/login.html', 'logout did not redirect to login');
    assert(
        !/sessionStorage|localStorage|sfmLoggedIn|sfmUser/.test(managerSource),
        'manager contains a custom browser-storage session'
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
