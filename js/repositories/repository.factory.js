"use strict";

import {
    createDocument,
    deleteDocument,
    queryCollection,
    readDocument,
    updateDocument
} from "../firebase/firebase-firestore.js";
import { AuthenticationManager } from "../managers/authentication.manager.js";

const DEFAULT_FIRESTORE_API = Object.freeze({
    createDocument,
    deleteDocument,
    queryCollection,
    readDocument,
    updateDocument
});

const FIRESTORE_ERROR_MESSAGES = Object.freeze({
    "permission-denied": "You do not have permission to access this data.",
    unauthenticated: "Sign in before accessing your data.",
    unavailable: "The data service is temporarily unavailable. Please try again.",
    "network-request-failed": "Unable to reach the data service. Check your connection and try again.",
    "deadline-exceeded": "The data request timed out. Please try again.",
    "resource-exhausted": "The data service is temporarily busy. Please try again later.",
    "invalid-argument": "The submitted data could not be accepted.",
    "already-exists": "A record with this identifier already exists.",
    "not-found": "The requested record no longer exists."
});

/** UI-safe error exposed by every Firestore repository. */
class RepositoryError extends Error {
    /**
     * Create a normalized repository error without retaining raw Firebase data.
     * @param {string} code Stable repository error code.
     * @param {string} message Friendly error message.
     * @param {string} repository Repository collection name.
     * @param {string} operation Repository operation that failed.
     */
    constructor(code, message, repository, operation) {
        super(message);
        this.name = "RepositoryError";
        this.code = code;
        this.repository = repository;
        this.operation = operation;
    }
}

/**
 * Convert an infrastructure exception into a friendly repository error.
 * @param {unknown} error Infrastructure or validation exception.
 * @param {string} repository Repository collection name.
 * @param {string} operation Repository operation that failed.
 * @returns {RepositoryError} Normalized repository error.
 */
function normalizeRepositoryError(error, repository, operation) {
    if (error instanceof RepositoryError) {
        return error;
    }

    const rawCode = typeof error === "object" && error !== null && "code" in error
        ? String(error.code).toLowerCase()
        : "unknown";
    const normalizedCode = rawCode.includes("/")
        ? rawCode.split("/").at(-1)
        : rawCode;
    const message = FIRESTORE_ERROR_MESSAGES[normalizedCode] ??
        `Unable to ${operation} ${repository} data. Please try again.`;

    return new RepositoryError(
        `repository/${normalizedCode}`,
        message,
        repository,
        operation
    );
}

function validateCollectionName(collectionName) {
    if (typeof collectionName !== "string" ||
        !/^[a-z][a-z0-9-]*$/.test(collectionName)) {
        throw new TypeError("Repository collection name is invalid.");
    }

    return collectionName;
}

function validateDocumentId(id, repository, operation) {
    const validType = typeof id === "string";
    const byteLength = validType && typeof TextEncoder === "function"
        ? new TextEncoder().encode(id).length
        : validType ? id.length : 0;
    const invalid = !validType ||
        !id ||
        id !== id.trim() ||
        id.includes("/") ||
        /[\u0000-\u001f\u007f]/.test(id) ||
        /^__.*__$/.test(id) ||
        byteLength > 1500;

    if (invalid) {
        throw new RepositoryError(
            "repository/invalid-document-id",
            "A valid document identifier is required.",
            repository,
            operation
        );
    }

    return id;
}

function validatePayload(data, repository, operation) {
    const isObject = typeof data === "object" && data !== null && !Array.isArray(data);
    const prototype = isObject ? Object.getPrototypeOf(data) : null;
    const isPlainObject = isObject && (prototype === Object.prototype || prototype === null);

    if (!isPlainObject || Object.keys(data).length === 0) {
        throw new RepositoryError(
            "repository/invalid-payload",
            "A non-empty data object is required.",
            repository,
            operation
        );
    }

    return data;
}

/**
 * Create a user-scoped repository with the common SFM PRO data contract.
 * @param {string} collectionName Approved user subcollection name.
 * @param {Object} [dependencies] Optional test adapters.
 * @param {Object} [dependencies.authenticationManager] Authentication adapter.
 * @param {Object} [dependencies.firestoreApi] Firestore service adapter.
 * @returns {Readonly<Object>} Repository implementing the shared contract.
 * @throws {TypeError} If the collection name is invalid.
 */
function createRepository(collectionName, dependencies = {}) {
    const repository = validateCollectionName(collectionName);
    const authenticationManager = dependencies.authenticationManager ?? AuthenticationManager;
    const firestoreApi = dependencies.firestoreApi ?? DEFAULT_FIRESTORE_API;

    async function getCollectionPath(operation) {
        try {
            await authenticationManager.initialize?.();
        } catch (_error) {
            throw new RepositoryError(
                "repository/authentication-unavailable",
                "Authentication is temporarily unavailable. Please try again.",
                repository,
                operation
            );
        }

        const user = authenticationManager.getCurrentUser?.();
        const uid = typeof user?.uid === "string" ? user.uid.trim() : "";

        if (!uid || uid.includes("/")) {
            throw new RepositoryError(
                "repository/unauthenticated",
                "Sign in before accessing your data.",
                repository,
                operation
            );
        }

        return `users/${uid}/${repository}`;
    }

    async function execute(operation, action) {
        try {
            return await action();
        } catch (error) {
            throw normalizeRepositoryError(error, repository, operation);
        }
    }

    return Object.freeze({
        /**
         * Save a new document using a generated Firestore identifier.
         * @param {Record<string, unknown>} data Non-empty document payload.
         * @returns {Promise<string>} Generated document identifier.
         * @throws {RepositoryError} If authentication, validation, or persistence fails.
         */
        async save(data) {
            return execute("save", async () => {
                const payload = validatePayload(data, repository, "save");
                const collectionPath = await getCollectionPath("save");
                return firestoreApi.createDocument(collectionPath, payload);
            });
        },

        /**
         * Update an existing document.
         * @param {string} id Existing document identifier.
         * @param {Record<string, unknown>} data Non-empty update payload.
         * @returns {Promise<void>} Resolves after the document is updated.
         * @throws {RepositoryError} If authentication, validation, or persistence fails.
         */
        async update(id, data) {
            return execute("update", async () => {
                const documentId = validateDocumentId(id, repository, "update");
                const payload = validatePayload(data, repository, "update");
                const collectionPath = await getCollectionPath("update");
                await firestoreApi.updateDocument(collectionPath, documentId, payload);
            });
        },

        /**
         * Delete a document by identifier.
         * @param {string} id Document identifier to delete.
         * @returns {Promise<void>} Resolves after deletion completes.
         * @throws {RepositoryError} If authentication, validation, or persistence fails.
         */
        async delete(id) {
            return execute("delete", async () => {
                const documentId = validateDocumentId(id, repository, "delete");
                const collectionPath = await getCollectionPath("delete");
                await firestoreApi.deleteDocument(collectionPath, documentId);
            });
        },

        /**
         * Read a single document by identifier.
         * @param {string} id Document identifier to retrieve.
         * @returns {Promise<{id: string, data: Record<string, unknown>}|null>} Document or null.
         * @throws {RepositoryError} If authentication, validation, or persistence fails.
         */
        async getById(id) {
            return execute("read", async () => {
                const documentId = validateDocumentId(id, repository, "read");
                const collectionPath = await getCollectionPath("read");
                return firestoreApi.readDocument(collectionPath, documentId);
            });
        },

        /**
         * Read every document in the authenticated user's collection.
         * @returns {Promise<Array<{id: string, data: Record<string, unknown>}>>} Documents.
         * @throws {RepositoryError} If authentication or persistence fails.
         */
        async getAll() {
            return execute("read", async () => {
                const collectionPath = await getCollectionPath("read");
                return firestoreApi.queryCollection(collectionPath);
            });
        },

        /**
         * Check whether a document exists.
         * @param {string} id Document identifier to check.
         * @returns {Promise<boolean>} True when the document exists.
         * @throws {RepositoryError} If authentication, validation, or persistence fails.
         */
        async exists(id) {
            return execute("check", async () => {
                const documentId = validateDocumentId(id, repository, "check");
                const collectionPath = await getCollectionPath("check");
                return (await firestoreApi.readDocument(collectionPath, documentId)) !== null;
            });
        },

        /**
         * Count documents in the authenticated user's collection.
         * @returns {Promise<number>} Number of accessible documents.
         * @throws {RepositoryError} If authentication or persistence fails.
         */
        async count() {
            return execute("count", async () => {
                const collectionPath = await getCollectionPath("count");
                return (await firestoreApi.queryCollection(collectionPath)).length;
            });
        },

        /**
         * Delete every document in the authenticated user's collection.
         * This operation intentionally uses individual writes, not a batch.
         * @returns {Promise<number>} Number of documents deleted.
         * @throws {RepositoryError} If authentication or persistence fails.
         */
        async clear() {
            return execute("clear", async () => {
                const collectionPath = await getCollectionPath("clear");
                const documents = await firestoreApi.queryCollection(collectionPath);
                let deletedCount = 0;

                for (const document of documents) {
                    const documentId = validateDocumentId(document.id, repository, "clear");
                    await firestoreApi.deleteDocument(collectionPath, documentId);
                    deletedCount += 1;
                }

                return deletedCount;
            });
        }
    });
}

export {
    RepositoryError,
    createRepository,
    normalizeRepositoryError
};

