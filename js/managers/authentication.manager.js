"use strict";

const PROTECTED_ROUTES = Object.freeze([
    "dashboard.html",
    "income.html",
    "expense.html",
    "budget.html",
    "creditcards.html",
    "emi.html",
    "investments.html",
    "loans.html",
    "reports.html",
    "settings.html"
]);

const LOGIN_ROUTE = "login.html";
const LOGOUT_CONTROL_SELECTOR = "#logoutBtn, .sidebar-logout, .expense-logout";
const APPLICATION_ROOT_URL = new URL("../../", import.meta.url);
const DEFAULT_LOGIN_URL = new URL("login.html", APPLICATION_ROOT_URL).href;
const DEFAULT_DASHBOARD_URL = new URL("dashboard.html", APPLICATION_ROOT_URL).href;

const AUTH_ERROR_MESSAGES = Object.freeze({
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/wrong-password": "Invalid email or password. Please try again.",
    "auth/user-not-found": "Invalid email or password. Please try again.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/too-many-requests": "Too many sign-in attempts. Please wait and try again.",
    "auth/network-request-failed": "Unable to reach the authentication service. Check your connection and try again.",
    "auth/missing-password": "Enter your password.",
    "auth/operation-not-allowed": "Email and password sign-in is not available. Contact support."
});

/** Friendly, UI-safe error produced by the authentication manager. */
class AuthenticationError extends Error {
    /**
     * Create an authentication error without retaining raw Firebase details.
     * @param {string} code Stable Firebase or manager error code.
     * @param {string} message User-facing error message.
     */
    constructor(code, message) {
        super(message);
        this.name = "AuthenticationError";
        this.code = code;
    }
}

/**
 * Convert a Firebase error into a safe, friendly authentication error.
 * @param {unknown} error Error received from the Firebase adapter.
 * @returns {AuthenticationError} Normalized error safe for UI display.
 */
function normalizeAuthenticationError(error) {
    if (error instanceof AuthenticationError) {
        return error;
    }

    const code = typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "auth/unknown";
    const message = AUTH_ERROR_MESSAGES[code] ??
        "Authentication is temporarily unavailable. Please try again.";

    return new AuthenticationError(code, message);
}

/**
 * Return the lowercase file name for a URL pathname.
 * @param {string} pathname Browser pathname.
 * @returns {string} Final decoded path segment.
 */
function getRouteName(pathname = "") {
    const segments = String(pathname).split("/").filter(Boolean);
    const finalSegment = segments.at(-1) || "";

    try {
        return decodeURIComponent(finalSegment).toLowerCase();
    } catch (_error) {
        return finalSegment.toLowerCase();
    }
}

/**
 * Determine whether a pathname belongs to a protected SFM PRO page.
 * @param {string} pathname Browser pathname.
 * @returns {boolean} True when authentication is required.
 */
function isProtectedRoute(pathname = "") {
    return PROTECTED_ROUTES.includes(getRouteName(pathname));
}

/**
 * Create an isolated authentication manager.
 * @param {Object} [options] Optional adapters used for testing or alternate hosts.
 * @param {() => Promise<Object>} [options.loadAuthApi] Loads firebase-auth.js.
 * @param {{getPathname: () => string, replace: (url: string) => void}} [options.navigation]
 * @param {Document|null} [options.documentRef]
 * @param {(callback: Function, delay: number) => unknown} [options.schedule]
 * @param {string} [options.loginUrl]
 * @param {string} [options.dashboardUrl]
 * @returns {Readonly<Object>} Authentication manager instance.
 */
function createAuthenticationManager(options = {}) {
    const loadAuthApi = options.loadAuthApi ?? (() => import("../firebase/firebase-auth.js"));
    const navigation = options.navigation ?? {
        getPathname: () => globalThis.location?.pathname ?? "",
        replace: (url) => globalThis.location?.replace(url)
    };
    const documentRef = Object.hasOwn(options, "documentRef")
        ? options.documentRef
        : globalThis.document ?? null;
    const schedule = options.schedule ?? globalThis.setTimeout?.bind(globalThis);
    const loginUrl = options.loginUrl ?? DEFAULT_LOGIN_URL;
    const dashboardUrl = options.dashboardUrl ?? DEFAULT_DASHBOARD_URL;
    const listeners = new Set();

    const state = {
        authApi: null,
        authApiPromise: null,
        currentUser: null,
        initialized: false,
        readyPromise: null,
        unsubscribe: null,
        logoutControlsBound: false
    };

    function currentPathname() {
        return navigation.getPathname();
    }

    function emitManagerError(error) {
        const normalized = normalizeAuthenticationError(error);

        listeners.forEach((entry) => {
            if (typeof entry.errorListener === "function") {
                entry.errorListener(normalized);
            }
        });

        if (documentRef && typeof documentRef.dispatchEvent === "function" &&
            typeof globalThis.CustomEvent === "function") {
            documentRef.dispatchEvent(new CustomEvent("sfm:authentication-error", {
                detail: { code: normalized.code, message: normalized.message }
            }));
        }

        return normalized;
    }

    function emitAuthState(user) {
        listeners.forEach((entry) => {
            try {
                entry.listener(user);
            } catch (_error) {
                if (typeof entry.errorListener === "function") {
                    entry.errorListener(new AuthenticationError(
                        "auth/listener-failed",
                        "An authentication state listener could not be completed."
                    ));
                }
            }
        });

        if (documentRef && typeof documentRef.dispatchEvent === "function" &&
            typeof globalThis.CustomEvent === "function") {
            documentRef.dispatchEvent(new CustomEvent("sfm:authentication-state", {
                detail: { authenticated: Boolean(user), user: user ?? null }
            }));
        }
    }

    async function getAuthApi() {
        if (!state.authApiPromise) {
            state.authApiPromise = Promise.resolve()
                .then(loadAuthApi)
                .then((authApi) => {
                    state.authApi = authApi;
                    return authApi;
                });
        }

        return state.authApiPromise;
    }

    function handleLaterAuthState(user) {
        const pathname = currentPathname();

        if (!user && isProtectedRoute(pathname)) {
            manager.redirectToLogin();
            return;
        }

        if (user && getRouteName(pathname) === LOGIN_ROUTE && typeof schedule === "function") {
            schedule(() => manager.redirectToDashboard(), 500);
        }
    }

    function bindLogoutControls() {
        if (state.logoutControlsBound || !documentRef ||
            typeof documentRef.addEventListener !== "function") {
            return;
        }

        documentRef.addEventListener("click", async (event) => {
            const control = event.target?.closest?.(LOGOUT_CONTROL_SELECTOR);

            if (!control) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            try {
                await manager.logout();
            } catch (error) {
                emitManagerError(error);
            }
        }, true);

        state.logoutControlsBound = true;
    }

    const manager = Object.freeze({
        /**
         * Initialize Firebase Authentication and wait for its first state result.
         * Repeated calls share the same initialization promise.
         * @returns {Promise<Object|null>} Restored user, or null when signed out.
         */
        initialize() {
            if (state.readyPromise) {
                return state.readyPromise;
            }

            bindLogoutControls();
            state.readyPromise = (async () => {
                const authApi = await getAuthApi();

                return new Promise((resolve, reject) => {
                    state.unsubscribe = authApi.listenToAuthState(
                        (user) => {
                            const wasInitialized = state.initialized;
                            state.currentUser = user ?? null;
                            state.initialized = true;
                            emitAuthState(state.currentUser);

                            if (!wasInitialized) {
                                resolve(state.currentUser);
                                return;
                            }

                            handleLaterAuthState(state.currentUser);
                        },
                        (error) => {
                            const normalized = emitManagerError(error);

                            if (!state.initialized) {
                                state.initialized = true;
                                reject(normalized);
                            }
                        }
                    );
                });
            })().catch((error) => {
                throw emitManagerError(error);
            });

            return state.readyPromise;
        },

        /**
         * Sign in with Firebase email/password authentication.
         * @param {string} email Email address entered in the existing username field.
         * @param {string} password User password.
         * @param {{remember?: boolean}} [loginOptions] Persistence preference.
         * @returns {Promise<Object>} Authenticated Firebase user.
         */
        async login(email, password, loginOptions = {}) {
            try {
                const authApi = await getAuthApi();
                await authApi.setAuthPersistence(loginOptions.remember !== false);
                const credential = await authApi.loginUser(email, password);
                return credential.user;
            } catch (error) {
                throw normalizeAuthenticationError(error);
            }
        },

        /**
         * Sign out through Firebase and return to the login page.
         * @returns {Promise<void>}
         */
        async logout() {
            try {
                const authApi = await getAuthApi();
                await authApi.logoutUser();
                manager.redirectToLogin();
            } catch (error) {
                throw normalizeAuthenticationError(error);
            }
        },

        /**
         * Return the currently resolved Firebase user.
         * @returns {Object|null} Current user or null when signed out/not restored.
         */
        getCurrentUser() {
            return state.currentUser ?? state.authApi?.getCurrentUser?.() ?? null;
        },

        /**
         * Check the already-resolved authentication state synchronously.
         * Call initialize() first when restoration may still be pending.
         * @returns {boolean} True when a Firebase user is signed in.
         */
        isAuthenticated() {
            return Boolean(manager.getCurrentUser());
        },

        /**
         * Wait for authentication restoration and optionally redirect signed-out users.
         * @param {{redirect?: boolean}} [checkOptions] Redirect preference.
         * @returns {Promise<boolean>} True when authenticated.
         */
        async checkAuthentication(checkOptions = {}) {
            const user = await manager.initialize();
            const authenticated = Boolean(user);

            if (!authenticated && checkOptions.redirect !== false) {
                manager.redirectToLogin();
            }

            return authenticated;
        },

        /**
         * Protect the current route after Firebase restores persisted state.
         * @returns {Promise<boolean>} True when navigation may continue.
         */
        async protectRoute() {
            if (!isProtectedRoute(currentPathname())) {
                await manager.initialize();
                return true;
            }

            try {
                return await manager.checkAuthentication({ redirect: true });
            } catch (_error) {
                manager.redirectToLogin();
                return false;
            }
        },

        /**
         * Subscribe to manager-level authentication state and normalized errors.
         * @param {(user: Object|null) => void} listener State callback.
         * @param {(error: AuthenticationError) => void} [errorListener] Error callback.
         * @returns {() => void} Unsubscribe function.
         */
        onAuthenticationStateChanged(listener, errorListener) {
            if (typeof listener !== "function") {
                throw new TypeError("Authentication state listener must be a function.");
            }

            const entry = { listener, errorListener };
            listeners.add(entry);

            if (state.initialized) {
                queueMicrotask(() => listener(state.currentUser));
            }

            return () => listeners.delete(entry);
        },

        /**
         * Select Firebase local or session persistence without custom storage keys.
         * @param {boolean} [rememberUser=true] Persist beyond the current tab when true.
         * @returns {Promise<void>}
         */
        async setSessionPersistence(rememberUser = true) {
            try {
                const authApi = await getAuthApi();
                await authApi.setAuthPersistence(rememberUser);
            } catch (error) {
                throw normalizeAuthenticationError(error);
            }
        },

        /**
         * Navigate to the application login page.
         * @returns {void}
         */
        redirectToLogin() {
            navigation.replace(loginUrl);
        },

        /**
         * Navigate to the application dashboard.
         * @returns {void}
         */
        redirectToDashboard() {
            navigation.replace(dashboardUrl);
        },

        /**
         * Normalize an authentication error for safe UI display.
         * @param {unknown} error Firebase or manager error.
         * @returns {AuthenticationError} Friendly normalized error.
         */
        normalizeError(error) {
            return normalizeAuthenticationError(error);
        }
    });

    return manager;
}

const AuthenticationManager = createAuthenticationManager();

if (typeof globalThis.window !== "undefined" && typeof globalThis.document !== "undefined") {
    globalThis.AuthenticationManager = AuthenticationManager;

    const pathname = globalThis.location?.pathname ?? "";

    try {
        if (isProtectedRoute(pathname)) {
            await AuthenticationManager.protectRoute();
        } else if (getRouteName(pathname) === LOGIN_ROUTE) {
            const currentUser = await AuthenticationManager.initialize();

            if (currentUser) {
                AuthenticationManager.redirectToDashboard();
            }
        } else {
            await AuthenticationManager.initialize();
        }
    } catch (_error) {
        if (isProtectedRoute(pathname)) {
            AuthenticationManager.redirectToLogin();
        }
    }
}

export {
    AuthenticationError,
    AuthenticationManager,
    createAuthenticationManager,
    getRouteName,
    isProtectedRoute,
    normalizeAuthenticationError
};
