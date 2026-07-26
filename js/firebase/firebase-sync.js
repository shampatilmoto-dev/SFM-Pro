"use strict";

import { IncomeRepository } from "../repositories/income.repository.js";
import { ExpenseRepository } from "../repositories/expense.repository.js";
import { BudgetRepository } from "../repositories/budget.repository.js";
import { LoanRepository } from "../repositories/loan.repository.js";
import { InvestmentRepository } from "../repositories/investment.repository.js";
import { CreditCardRepository } from "../repositories/creditcard.repository.js";
import { EMIRepository } from "../repositories/emi.repository.js";
import { DashboardRepository } from "../repositories/dashboard.repository.js";
import { SettingsRepository } from "../repositories/settings.repository.js";
import { ReportsRepository } from "../repositories/reports.repository.js";
import { AuthenticationManager } from "../managers/authentication.manager.js";

const DATABASE_KEY = "SFM_DATABASE";
const EMI_KEY = "sfm_emi_records";
const SETTINGS_KEY = "SFM_SETTINGS";
const SYNC_STATE_KEY = "SFM_FIREBASE_SYNC_STATE";
const SYNC_STATE_VERSION = 1;

const MODULE_ALIASES = Object.freeze({
    income: "income", incomes: "income", expense: "expense", expenses: "expense",
    budget: "budget", budgets: "budget", loan: "loan", loans: "loan",
    investment: "investment", investments: "investment", creditcard: "creditcard",
    creditcards: "creditcard", "credit-card": "creditcard", "credit-cards": "creditcard", emi: "emi",
    dashboard: "dashboard", settings: "settings", report: "reports", reports: "reports"
});

const DEFAULT_REPOSITORIES = Object.freeze({
    income: IncomeRepository,
    expense: ExpenseRepository,
    budget: BudgetRepository,
    loan: LoanRepository,
    investment: InvestmentRepository,
    creditcard: CreditCardRepository,
    emi: EMIRepository,
    dashboard: DashboardRepository,
    settings: SettingsRepository,
    reports: ReportsRepository
});

/** Normalized synchronization error retained for backward-compatible imports. */
class FirebaseSyncError extends Error {
    /**
     * @param {string} code Stable synchronization error code.
     * @param {string} message Internal, non-Firebase error message.
     * @param {string} moduleName Canonical synchronization module.
     * @param {string} operation Synchronization operation.
     */
    constructor(code, message, moduleName, operation) {
        super(message);
        this.name = "FirebaseSyncError";
        this.code = code;
        this.module = moduleName;
        this.operation = operation;
    }
}

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function safeParse(raw, fallback) {
    if (typeof raw !== "string" || raw.length === 0 || raw.length > 16 * 1024 * 1024) return fallback;
    try { return JSON.parse(raw) ?? fallback; } catch (_error) { return fallback; }
}

function normalizeModuleName(moduleName) {
    const key = typeof moduleName === "string"
        ? moduleName.trim().toLowerCase().replace(/[\s_]+/g, "-")
        : "";
    const canonical = MODULE_ALIASES[key];
    if (!canonical) {
        throw new FirebaseSyncError(
            "sync/unsupported-module",
            "The requested synchronization module is not supported.",
            key || "unknown",
            "validate"
        );
    }
    return canonical;
}

function sanitizeValue(value, depth = 0) {
    if (depth > 30 || value === undefined || typeof value === "function" || typeof value === "symbol") return undefined;
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
        return Number.isFinite(value) || typeof value !== "number" ? value : null;
    }
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item, depth + 1)).filter(item => item !== undefined);
    }
    if (!isPlainObject(value)) return undefined;

    const output = {};
    Object.keys(value).sort().forEach(key => {
        if (["__proto__", "prototype", "constructor"].includes(key)) return;
        const child = sanitizeValue(value[key], depth + 1);
        if (child !== undefined) output[key] = child;
    });
    return output;
}

function stableStringify(value) {
    return JSON.stringify(sanitizeValue(value));
}

async function hashPayload(value, cryptoApi = globalThis.crypto) {
    const text = stableStringify(value);
    if (cryptoApi?.subtle && typeof TextEncoder === "function") {
        const digest = await cryptoApi.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    }

    let first = 2166136261;
    let second = 2246822519;
    for (let index = 0; index < text.length; index += 1) {
        first = Math.imul(first ^ text.charCodeAt(index), 16777619);
        second = Math.imul(second ^ text.charCodeAt(index), 3266489917);
    }
    return `fallback-${(first >>> 0).toString(16)}${(second >>> 0).toString(16)}`;
}

function createDefaultStorageAdapter(storage = globalThis.localStorage) {
    function readDatabase() {
        const parsed = safeParse(storage?.getItem?.(DATABASE_KEY), {});
        return isPlainObject(parsed) ? parsed : {};
    }
    const array = value => Array.isArray(value) ? value : [];

    return Object.freeze({
        readModule(moduleName) {
            const database = readDatabase();
            if (moduleName === "income") return array(database.income);
            if (moduleName === "expense") return array(database.expenses);
            if (moduleName === "budget") return array(database.budgets);
            if (moduleName === "loan") return array(database.loans);
            if (moduleName === "investment") return array(database.investments);
            if (moduleName === "creditcard") return array(database.creditcards);
            if (moduleName === "emi") return array(safeParse(storage?.getItem?.(EMI_KEY), []));
            if (moduleName === "reports") return array(database.reports);
            if (moduleName === "settings") {
                const stored = safeParse(storage?.getItem?.(SETTINGS_KEY), database.settings ?? {});
                return [{ id: "settings", ...(isPlainObject(stored) ? stored : {}) }];
            }
            if (moduleName === "dashboard") {
                return [{
                    id: "dashboard",
                    profile: sanitizeValue(database.profile ?? {}),
                    income: array(database.income),
                    expenses: array(database.expenses),
                    budgets: array(database.budgets),
                    loans: array(database.loans),
                    investments: array(database.investments),
                    creditcards: array(database.creditcards),
                    emi: array(safeParse(storage?.getItem?.(EMI_KEY), [])),
                    goals: array(database.goals),
                    reminders: array(database.reminders),
                    transactions: array(database.transactions),
                    metadata: sanitizeValue(database.metadata ?? {})
                }];
            }
            return [];
        },
        readSyncState() {
            const parsed = safeParse(storage?.getItem?.(SYNC_STATE_KEY), null);
            if (!isPlainObject(parsed) || parsed.version !== SYNC_STATE_VERSION || !isPlainObject(parsed.modules)) {
                return { version: SYNC_STATE_VERSION, modules: {} };
            }
            return parsed;
        },
        writeSyncState(state) {
            storage?.setItem?.(SYNC_STATE_KEY, JSON.stringify(state));
        }
    });
}

function createResult(moduleName, operation, values = {}) {
    return Object.freeze({
        module: moduleName,
        operation,
        status: values.status ?? "failed",
        success: values.success === true,
        pending: values.pending === true,
        created: Number(values.created) || 0,
        updated: Number(values.updated) || 0,
        deleted: Number(values.deleted) || 0,
        skipped: Number(values.skipped) || 0,
        failed: Number(values.failed) || 0,
        conflicts: Number(values.conflicts) || 0,
        code: values.code ?? null
    });
}

function normalizeSyncCode(error) {
    const raw = typeof error === "object" && error !== null && "code" in error
        ? String(error.code).toLowerCase()
        : "";
    if (raw.includes("unauthenticated")) return "sync/authentication-required";
    if (raw.includes("permission-denied")) return "sync/permission-denied";
    if (raw.includes("network") || raw.includes("unavailable") || raw.includes("deadline")) return "sync/service-unavailable";
    if (raw.startsWith("sync/")) return raw;
    return "sync/failed";
}

function defaultLogFailure(result) {
    if (typeof console?.error === "function") {
        console.error(`[FirebaseSync] ${result.code}`, {
            module: result.module,
            operation: result.operation,
            failed: result.failed
        });
    }
}

/**
 * Create an isolated synchronization manager.
 * @param {Object} [options] Optional production or test adapters.
 * @param {Record<string, Object>} [options.repositories] Repository map.
 * @param {Object} [options.authenticationManager] AuthenticationManager-compatible adapter.
 * @param {Object} [options.storageAdapter] Local data and sync-state adapter.
 * @param {() => boolean} [options.isOnline] Connectivity predicate.
 * @param {(result: Object) => void} [options.logFailure] Safe failure logger.
 * @param {Crypto} [options.cryptoApi] Hashing adapter.
 * @returns {Readonly<Object>} Synchronization manager.
 */
function createFirebaseSyncManager(options = {}) {
    const repositories = options.repositories ?? DEFAULT_REPOSITORIES;
    const authenticationManager = options.authenticationManager ?? AuthenticationManager;
    const storageAdapter = options.storageAdapter ?? createDefaultStorageAdapter();
    const isOnline = options.isOnline ?? (() => globalThis.navigator?.onLine !== false);
    const logFailure = options.logFailure ?? defaultLogFailure;
    const cryptoApi = options.cryptoApi ?? globalThis.crypto;
    const activeOperations = new Map();
    let authenticatedUid = "";

    function failure(moduleName, operation, error, failed = 1) {
        const result = createResult(moduleName, operation, {
            status: "failed", code: normalizeSyncCode(error), failed
        });
        try { logFailure(result); } catch (_loggingError) { /* Logging cannot affect sync. */ }
        return result;
    }

    async function preflight(moduleName, operation) {
        if (!isOnline()) {
            return createResult(moduleName, operation, {
                status: "pending", pending: true, code: "sync/offline"
            });
        }
        try {
            await authenticationManager.initialize?.();
            const user = authenticationManager.getCurrentUser?.();
            if (typeof user?.uid !== "string" || !user.uid.trim()) {
                return failure(moduleName, operation, { code: "repository/unauthenticated" });
            }
            authenticatedUid = user.uid.trim();
        } catch (error) {
            return failure(moduleName, operation, error);
        }
        return null;
    }

    function moduleState(state, moduleName) {
        if (!isPlainObject(state.modules[moduleName])) state.modules[moduleName] = {};
        return state.modules[moduleName];
    }

    function readUserSyncState() {
        const state = storageAdapter.readSyncState();
        if (state.userUid !== authenticatedUid) {
            return { version: SYNC_STATE_VERSION, userUid: authenticatedUid, modules: {} };
        }
        return state;
    }

    function writeUserModuleState(state, moduleName) {
        const latest = storageAdapter.readSyncState();
        const compatible = latest &&
            latest.userUid === authenticatedUid &&
            latest.modules &&
            typeof latest.modules === "object" &&
            !Array.isArray(latest.modules);
        const next = compatible
            ? latest
            : { version: SYNC_STATE_VERSION, userUid: authenticatedUid, modules: {} };

        next.version = SYNC_STATE_VERSION;
        next.userUid = authenticatedUid;
        next.modules[moduleName] = state.modules[moduleName] ?? {};
        storageAdapter.writeSyncState(next);
    }

    async function runSerialized(requestedModule, task) {
        let key;
        try { key = normalizeModuleName(requestedModule); }
        catch (_error) { return task(); }

        const previous = activeOperations.get(key) ?? Promise.resolve();
        const current = previous.then(task, task);
        activeOperations.set(key, current);
        try {
            return await current;
        } finally {
            if (activeOperations.get(key) === current) activeOperations.delete(key);
        }
    }

    function normalizeRecord(record, fallbackId = "") {
        const payload = sanitizeValue(record);
        if (!isPlainObject(payload)) throw { code: "sync/invalid-record" };
        const id = typeof payload.id === "string" && payload.id.trim() ? payload.id.trim() : fallbackId;
        if (!id || id.includes("/")) throw { code: "sync/invalid-record-id" };
        return { ...payload, id };
    }

    async function findRemote(repository, localId, entry) {
        const documents = await repository.getAll();
        return documents.find(document => document?.id === entry?.remoteId) ??
            documents.find(document => document?.data?.id === localId) ?? null;
    }

    /**
     * Synchronize one successful LocalStorage create, update, or delete.
     * @param {string} requestedModule Module name or supported alias.
     * @param {"create"|"update"|"delete"} operation Completed local operation.
     * @param {Record<string, unknown>|string} value Saved record or deleted record ID.
     * @returns {Promise<Object>} Never-rejecting synchronization result.
     * @throws {never} Validation, authentication, network, and repository failures are normalized.
     */
    async function performSyncChange(requestedModule, operation, value) {
        let moduleName;
        try { moduleName = normalizeModuleName(requestedModule); }
        catch (error) { return failure(String(requestedModule || "unknown"), operation, error); }

        if (!["create", "update", "delete"].includes(operation)) {
            return failure(moduleName, String(operation || "unknown"), { code: "sync/invalid-operation" });
        }
        const blocked = await preflight(moduleName, operation);
        if (blocked) return blocked;
        const repository = repositories[moduleName];
        if (!repository) return failure(moduleName, operation, { code: "sync/repository-unavailable" });

        try {
            const state = readUserSyncState();
            const records = moduleState(state, moduleName);
            const localId = operation === "delete"
                ? String(typeof value === "string" ? value : value?.id ?? "").trim()
                : "";

            if (operation === "delete") {
                if (!localId || localId.includes("/")) throw { code: "sync/invalid-record-id" };
                const remote = await findRemote(repository, localId, records[localId]);
                if (!remote) {
                    delete records[localId];
                    writeUserModuleState(state, moduleName);
                    return createResult(moduleName, operation, {
                        status: "skipped", success: true, skipped: 1, code: "sync/already-deleted"
                    });
                }
                await repository.delete(remote.id);
                delete records[localId];
                writeUserModuleState(state, moduleName);
                return createResult(moduleName, operation, { status: "synced", success: true, deleted: 1 });
            }

            const payload = normalizeRecord(value);
            const hash = await hashPayload(payload, cryptoApi);
            const existingState = records[payload.id];
            if (existingState?.hash === hash) {
                return createResult(moduleName, operation, {
                    status: "skipped", success: true, skipped: 1, code: "sync/unchanged"
                });
            }

            const remote = await findRemote(repository, payload.id, existingState);
            let remoteId;
            let values;
            if (remote) {
                const remoteHash = remote.data ? await hashPayload(remote.data, cryptoApi) : existingState?.hash;
                const conflict = Boolean(existingState?.hash && remoteHash &&
                    remoteHash !== existingState.hash && hash !== existingState.hash);
                await repository.update(remote.id, payload);
                remoteId = remote.id;
                values = conflict
                    ? { updated: 1, conflicts: 1, code: "sync/conflict-local-wins" }
                    : { updated: 1 };
                if (conflict) {
                    records[payload.id] = {
                        ...existingState,
                        lastConflict: {
                            strategy: "local-wins",
                            remoteHash,
                            resolvedAt: new Date().toISOString()
                        }
                    };
                }
            } else {
                remoteId = await repository.save(payload);
                values = { created: 1 };
            }
            records[payload.id] = {
                remoteId,
                hash,
                syncedAt: new Date().toISOString(),
                ...(records[payload.id]?.lastConflict
                    ? { lastConflict: records[payload.id].lastConflict }
                    : {})
            };
            writeUserModuleState(state, moduleName);
            return createResult(moduleName, operation, { status: "synced", success: true, ...values });
        } catch (error) {
            return failure(moduleName, operation, error);
        }
    }

    /**
     * Reconcile one complete LocalStorage module to its repository.
     * @param {string} requestedModule Module name or supported alias.
     * @param {{force?: boolean}} [syncOptions] Set force to upload unchanged records.
     * @returns {Promise<Object>} Never-rejecting module synchronization result.
     * @throws {never} Errors are normalized, logged, and returned in the result.
     */
    async function performSyncModule(requestedModule, syncOptions = {}) {
        let moduleName;
        try { moduleName = normalizeModuleName(requestedModule); }
        catch (error) { return failure(String(requestedModule || "unknown"), "full", error); }

        const blocked = await preflight(moduleName, "full");
        if (blocked) return blocked;
        const repository = repositories[moduleName];
        if (!repository) return failure(moduleName, "full", { code: "sync/repository-unavailable" });

        try {
            const localRecords = storageAdapter.readModule(moduleName)
                .map(record => normalizeRecord(record, moduleName));
            const remoteDocuments = await repository.getAll();
            const remoteByLocalId = new Map();
            remoteDocuments.forEach(document => {
                if (typeof document?.data?.id === "string") remoteByLocalId.set(document.data.id, document);
            });
            const localIds = new Set(localRecords.map(record => record.id));
            const state = readUserSyncState();
            const records = moduleState(state, moduleName);
            const totals = { created: 0, updated: 0, deleted: 0, skipped: 0, failed: 0 };

            for (const payload of localRecords) {
                try {
                    const hash = await hashPayload(payload, cryptoApi);
                    const entry = records[payload.id];
                    const remote = remoteByLocalId.get(payload.id) ??
                        remoteDocuments.find(document => document.id === entry?.remoteId) ?? null;
                    if (!syncOptions.force && remote && entry?.hash === hash) {
                        totals.skipped += 1;
                        continue;
                    }
                    let remoteId;
                    if (remote) {
                        await repository.update(remote.id, payload);
                        remoteId = remote.id;
                        totals.updated += 1;
                    } else {
                        remoteId = await repository.save(payload);
                        totals.created += 1;
                    }
                    records[payload.id] = { remoteId, hash, syncedAt: new Date().toISOString() };
                } catch (_error) {
                    totals.failed += 1;
                }
            }

            for (const document of remoteDocuments) {
                if (document?.data?.recordType === "cloud-backup") continue;
                const localId = typeof document?.data?.id === "string" ? document.data.id : "";
                if (localId && localIds.has(localId)) continue;
                try {
                    await repository.delete(document.id);
                    if (localId) delete records[localId];
                    totals.deleted += 1;
                } catch (_error) {
                    totals.failed += 1;
                }
            }
            Object.keys(records).forEach(localId => { if (!localIds.has(localId)) delete records[localId]; });
            writeUserModuleState(state, moduleName);

            if (totals.failed > 0) return failure(moduleName, "full", { code: "sync/partial-failure" }, totals.failed);
            return createResult(moduleName, "full", { status: "synced", success: true, ...totals });
        } catch (error) {
            return failure(moduleName, "full", error);
        }
    }

    /**
     * Serialize a changed-record synchronization behind earlier work for the same module.
     * @param {string} requestedModule Module name or supported alias.
     * @param {"create"|"update"|"delete"} operation Completed local operation.
     * @param {Record<string, unknown>|string} value Saved record or deleted record ID.
     * @returns {Promise<Object>} Never-rejecting synchronization result.
     * @throws {never} All failures are normalized by the synchronization operation.
     */
    async function syncChange(requestedModule, operation, value) {
        return runSerialized(requestedModule, () => performSyncChange(requestedModule, operation, value));
    }

    /**
     * Serialize full-module reconciliation behind earlier work for the same module.
     * @param {string} requestedModule Module name or supported alias.
     * @param {{force?: boolean}} [syncOptions] Optional full-sync controls.
     * @returns {Promise<Object>} Never-rejecting synchronization result.
     * @throws {never} All failures are normalized by the synchronization operation.
     */
    async function syncModule(requestedModule, syncOptions = {}) {
        return runSerialized(requestedModule, () => performSyncModule(requestedModule, syncOptions));
    }

    /**
     * Synchronize every supported LocalStorage module.
     * @param {{force?: boolean}} [syncOptions] Optional full-sync controls.
     * @returns {Promise<{status: string, success: boolean, pending: boolean, results: Object[]}>} Aggregate result.
     * @throws {never} Individual module failures are returned and never reject the caller.
     */
    async function syncAll(syncOptions = {}) {
        const results = await Promise.all(
            Object.keys(DEFAULT_REPOSITORIES).map(moduleName => syncModule(moduleName, syncOptions))
        );
        const pending = results.some(result => result.pending);
        const success = results.every(result => result.success);
        return Object.freeze({
            status: pending ? "pending" : success ? "synced" : "failed",
            success,
            pending,
            results
        });
    }

    return Object.freeze({ syncAll, syncChange, syncModule });
}

const FirebaseSync = createFirebaseSyncManager();

/**
 * Synchronize the complete local Income collection to its user-scoped repository.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Counts and synced, pending, skipped, or failed status.
 * @throws {never} Offline, authentication, and repository errors are returned.
 */
async function syncIncome(options) { return FirebaseSync.syncModule("income", options); }
/**
 * Synchronize the complete local Expense collection.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized Expense synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncExpense(options) { return FirebaseSync.syncModule("expense", options); }
/**
 * Synchronize the complete local Budget collection.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized Budget synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncBudget(options) { return FirebaseSync.syncModule("budget", options); }
/**
 * Synchronize the complete local Loan collection.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized Loan synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncLoan(options) { return FirebaseSync.syncModule("loan", options); }
/**
 * Synchronize Loans through the backward-compatible plural API.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized Loan synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncLoans(options) { return syncLoan(options); }
/**
 * Synchronize the complete local Investment collection.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized Investment synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncInvestment(options) { return FirebaseSync.syncModule("investment", options); }
/**
 * Synchronize the complete local Credit Card collection.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized Credit Card synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncCreditCard(options) { return FirebaseSync.syncModule("creditcard", options); }
/**
 * Synchronize the complete standalone local EMI collection.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized EMI synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncEMI(options) { return FirebaseSync.syncModule("emi", options); }
/**
 * Synchronize the current Dashboard data snapshot.
 * @param {{force?: boolean}} [options] Set force to upload an unchanged snapshot.
 * @returns {Promise<Object>} Normalized Dashboard synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncDashboard(options) { return FirebaseSync.syncModule("dashboard", options); }
/**
 * Synchronize the current local Settings document.
 * @param {{force?: boolean}} [options] Set force to upload unchanged settings.
 * @returns {Promise<Object>} Normalized Settings synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncSettings(options) { return FirebaseSync.syncModule("settings", options); }
/**
 * Synchronize the complete local Reports collection.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized Reports synchronization result.
 * @throws {never} Possible errors are normalized and returned.
 */
async function syncReports(options) { return FirebaseSync.syncModule("reports", options); }
/**
 * Manually synchronize every supported module without blocking local operations.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Aggregate status plus every module result.
 * @throws {never} Module errors are normalized inside the aggregate result.
 */
async function syncAll(options) { return FirebaseSync.syncAll(options); }
/**
 * Manually synchronize one named module or supported alias.
 * @param {string} moduleName Supported module name or alias.
 * @param {{force?: boolean}} [options] Set force to upload unchanged records.
 * @returns {Promise<Object>} Normalized full-module synchronization result.
 * @throws {never} Unsupported modules and infrastructure errors are returned.
 */
async function syncModule(moduleName, options) { return FirebaseSync.syncModule(moduleName, options); }
/**
 * Synchronize one completed LocalStorage change without blocking its caller.
 * @param {string} moduleName Supported module name or alias.
 * @param {"create"|"update"|"delete"} operation Completed LocalStorage operation.
 * @param {Record<string, unknown>|string} value Saved record or deleted record ID.
 * @returns {Promise<Object>} Never-rejecting synchronization result.
 * @throws {never} Offline, authentication, and repository failures are returned.
 */
async function syncLocalChange(moduleName, operation, value) {
    return FirebaseSync.syncChange(moduleName, operation, value);
}

export {
    FirebaseSync, FirebaseSyncError, createFirebaseSyncManager,
    syncAll, syncBudget, syncCreditCard, syncDashboard,
    syncEMI, syncExpense, syncIncome, syncInvestment, syncLoan, syncLoans, syncLocalChange,
    syncModule, syncReports, syncSettings
};

export default FirebaseSync;
