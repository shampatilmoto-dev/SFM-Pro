"use strict";

import {
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { firebaseApp, firebaseConfigurationStatus } from "./firebase-config.js";

const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

function requireFirebaseAuth() {
    if (firebaseAuth) return firebaseAuth;
    const error = new Error(firebaseConfigurationStatus.message ?? "Firebase is not configured.");
    error.code = "auth/configuration-not-found";
    throw error;
}

/** Error type exposed by the Firebase infrastructure layer. */
class FirebaseAuthError extends Error {
    /**
     * @param {string} operation Authentication operation that failed.
     * @param {unknown} cause Original Firebase error.
     */
    constructor(operation, cause) {
        super(`Firebase authentication ${operation} failed.`);
        this.name = "FirebaseAuthError";
        this.operation = operation;
        this.code = typeof cause === "object" && cause !== null && "code" in cause
            ? String(cause.code)
            : "auth/unknown";
    }
}

/**
 * Run an authentication operation with consistent error normalization.
 * @template T
 * @param {string} operation
 * @param {() => Promise<T>} action
 * @returns {Promise<T>}
 */
async function runAuthOperation(operation, action) {
    try {
        return await action();
    } catch (error) {
        throw new FirebaseAuthError(operation, error);
    }
}

/**
 * Register a user with email and password credentials.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js").UserCredential>}
 */
async function registerUser(email, password) {
    return runAuthOperation("registration", () =>
        createUserWithEmailAndPassword(requireFirebaseAuth(), email, password)
    );
}

/**
 * Sign in a user with email and password credentials.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js").UserCredential>}
 */
async function loginUser(email, password) {
    return runAuthOperation("login", () =>
        signInWithEmailAndPassword(requireFirebaseAuth(), email, password)
    );
}

/**
 * Sign out the current Firebase user.
 * @returns {Promise<void>}
 */
async function logoutUser() {
    return runAuthOperation("logout", () => signOut(requireFirebaseAuth()));
}

/**
 * Select Firebase-managed persistence for subsequent authentication changes.
 * @param {boolean} [rememberUser=true] Persist across browser restarts when true.
 * @returns {Promise<void>}
 */
async function setAuthPersistence(rememberUser = true) {
    const persistence = rememberUser
        ? browserLocalPersistence
        : browserSessionPersistence;

    return runAuthOperation("persistence", () =>
        setPersistence(requireFirebaseAuth(), persistence)
    );
}

/**
 * Return the in-memory user, or null while signed out.
 * @returns {import("https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js").User|null}
 */
function getCurrentUser() {
    return firebaseAuth?.currentUser ?? null;
}

/**
 * Subscribe to authentication state changes.
 * @param {(user: import("https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js").User|null) => void} listener
 * @param {(error: FirebaseAuthError) => void} [errorListener]
 * @returns {import("https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js").Unsubscribe}
 */
function listenToAuthState(listener, errorListener = () => {}) {
    if (typeof listener !== "function") {
        throw new TypeError("Authentication state listener must be a function.");
    }

    if (!firebaseAuth) {
        queueMicrotask(() => errorListener(new FirebaseAuthError(
            "configuration",
            { code: "auth/configuration-not-found" }
        )));
        return () => {};
    }

    return onAuthStateChanged(
        firebaseAuth,
        listener,
        (error) => errorListener(new FirebaseAuthError("state listener", error))
    );
}

export {
    FirebaseAuthError,
    getCurrentUser,
    listenToAuthState,
    loginUser,
    logoutUser,
    registerUser,
    setAuthPersistence
};
