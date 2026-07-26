"use strict";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { firebaseDb } from "./firebase-init.js";

/** Error type exposed by Firestore infrastructure operations. */
class FirebaseFirestoreError extends Error {
    /** @param {string} operation @param {unknown} cause */
    constructor(operation, cause) {
        const message = cause instanceof Error ? cause.message : "Unknown Firestore error";
        super(`Firestore ${operation} failed: ${message}`, { cause });
        this.name = "FirebaseFirestoreError";
        this.operation = operation;
        this.code = typeof cause === "object" && cause !== null && "code" in cause
            ? String(cause.code)
            : "firestore/unknown";
    }
}

/**
 * @template T
 * @param {string} operation
 * @param {() => Promise<T>} action
 * @returns {Promise<T>}
 */
async function runFirestoreOperation(operation, action) {
    try {
        return await action();
    } catch (error) {
        throw new FirebaseFirestoreError(operation, error);
    }
}

/**
 * Create a document with either an explicit or generated identifier.
 * @param {string} collectionPath
 * @param {Record<string, unknown>} data
 * @param {string|null} [documentId]
 * @param {{merge?: boolean}} [options]
 * @returns {Promise<string>} Created document identifier.
 */
async function createDocument(collectionPath, data, documentId = null, options = {}) {
    return runFirestoreOperation("create document", async () => {
        if (documentId) {
            const reference = doc(firebaseDb, collectionPath, documentId);
            await setDoc(reference, data, { merge: options.merge === true });
            return reference.id;
        }

        const reference = await addDoc(collection(firebaseDb, collectionPath), data);
        return reference.id;
    });
}

/**
 * @param {string} collectionPath
 * @param {string} documentId
 * @returns {Promise<{id: string, data: Record<string, unknown>}|null>}
 */
async function readDocument(collectionPath, documentId) {
    return runFirestoreOperation("read document", async () => {
        const snapshot = await getDoc(doc(firebaseDb, collectionPath, documentId));
        return snapshot.exists() ? { id: snapshot.id, data: snapshot.data() } : null;
    });
}

/** @param {string} collectionPath @param {string} documentId @param {Record<string, unknown>} data */
async function updateDocument(collectionPath, documentId, data) {
    return runFirestoreOperation("update document", () =>
        updateDoc(doc(firebaseDb, collectionPath, documentId), data)
    );
}

/** @param {string} collectionPath @param {string} documentId */
async function deleteDocument(collectionPath, documentId) {
    return runFirestoreOperation("delete document", () =>
        deleteDoc(doc(firebaseDb, collectionPath, documentId))
    );
}

/**
 * Query a collection using Firebase query constraints such as `where()` and
 * `orderBy()`. An empty constraint list returns every accessible document.
 * @param {string} collectionPath
 * @param {import("https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js").QueryConstraint[]} [constraints]
 * @returns {Promise<Array<{id: string, data: Record<string, unknown>}>>}
 */
async function queryCollection(collectionPath, constraints = []) {
    return runFirestoreOperation("query collection", async () => {
        const reference = collection(firebaseDb, collectionPath);
        const snapshot = await getDocs(query(reference, ...constraints));
        return snapshot.docs.map((item) => ({ id: item.id, data: item.data() }));
    });
}

/**
 * Reserved for an atomic multi-document write API.
 * @returns {Promise<never>}
 */
async function batchWrite() {
    // TODO(Sprint 4.3+): define the approved batch operation contract.
    throw new Error("Batch writes are not implemented yet.");
}

/**
 * Reserved for an atomic read/write transaction API.
 * @returns {Promise<never>}
 */
async function runFirestoreTransaction() {
    // TODO(Sprint 4.3+): define retry-safe transaction callbacks.
    throw new Error("Firestore transactions are not implemented yet.");
}

export {
    FirebaseFirestoreError,
    batchWrite,
    createDocument,
    deleteDocument,
    queryCollection,
    readDocument,
    runFirestoreTransaction,
    updateDocument
};

