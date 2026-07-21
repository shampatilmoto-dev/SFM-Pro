/*==================================================
 SFM PRO Enterprise v3.5 Stable
 storage.js
 Part 1 : Database Foundation
==================================================*/

"use strict";

/*==================================================
 Application Information
==================================================*/

const DB_NAME = "SFM_DATABASE";
const DB_VERSION = "3.0.0";

/*==================================================
 Storage Result Helpers
==================================================*/

function createStorageResult({
    success = false,
    data = null,
    errors = [],
    warnings = [],
    message = ""
} = {}) {

    const safeErrors = Array.isArray(errors)
        ? errors.filter(Boolean)
        : [];

    return {
        success: Boolean(success),
        data,
        errors: safeErrors,
        warnings: Array.isArray(warnings) ? warnings.filter(Boolean) : [],
        message,
        // Backward compatibility fields for consumers using legacy shape.
        valid: Boolean(success),
        error: safeErrors[0] || null
    };

}

function deepClone(value) {

    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }

    if (value === undefined) {
        return undefined;
    }

    try {
        return JSON.parse(JSON.stringify(value));
    } catch (error) {
        return value;
    }

}

function hasUnsafeJsonKeys(value, depth = 0) {

    if (depth > 20) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some(item => hasUnsafeJsonKeys(item, depth + 1));
    }

    if (!value || typeof value !== "object") {
        return false;
    }

    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
        return true;
    }

    return Object.keys(value).some(key => {
        if (["__proto__", "prototype", "constructor"].includes(key)) {
            return true;
        }

        return hasUnsafeJsonKeys(value[key], depth + 1);
    });

}

function parseStoredDatabaseJson(text) {

    if (typeof text !== "string" || text.length === 0 || text.length > 8 * 1024 * 1024) {
        return null;
    }

    try {
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return null;
        }

        if (hasUnsafeJsonKeys(parsed)) {
            return null;
        }

        return parsed;
    } catch (error) {
        return null;
    }

}

/*==================================================
 Default Database
==================================================*/

const defaultDatabase = {

    profile: {
        name: "",
        email: "",
        mobile: ""
    },

    settings: {
        currency: "INR",
        theme: "light",
        language: "en"
    },

    income: [],
    expenses: [],
    budgets: [],
    loans: [],
    investments: [],
    creditcards: [],
    transactions: [],
    reminders: [],
    goals: [],
    categories: [],
    reports: [],

    metadata: {
        version: DB_VERSION,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

};

/*==================================================
 Current Database
==================================================*/

let database = {};
let isDatabaseLoaded = false;

/*==================================================
 Create Database
==================================================*/

function createDatabase() {

    database = deepClone(defaultDatabase);

    const saved = saveDatabase();

    if (!saved.success) {
        console.error("Database create write failed", saved.error);
        return false;
    }

    console.log("Database Created");

    isDatabaseLoaded = true;

    return true;

}

/*==================================================
 Load Database
==================================================*/

function loadDatabase(force = false) {

    if (isDatabaseLoaded && !force) {
        return;
    }

    let saved = null;

    try {
        saved = localStorage.getItem(DB_NAME);
    } catch (error) {
        console.error("Database Read Failed", error);
        createDatabase();
        return;
    }

    if (!saved) {

        createDatabase();

        return;

    }

    const parsed = parseStoredDatabaseJson(saved);

    if (!parsed) {
        console.error("Database Corrupted");
        createDatabase();
        return;
    }

    database = parsed;

    migrateDatabase();
    isDatabaseLoaded = true;

}

function migrateDatabase() {
    const requiredModules = [
        "income",
        "expenses",
        "budgets",
        "loans",
        "investments",
        "creditcards",
        "transactions",
        "reminders",
        "goals",
        "categories",
        "reports"
    ];

    let migrated = false;

    requiredModules.forEach(module => {
        if (!Array.isArray(database[module])) {
            database[module] = [];
            migrated = true;
        }
    });

    if (migrated) {
        const saved = saveDatabase();
        if (saved.success) {
            console.log("Database migrated to include missing modules.");
        } else {
            console.error("Database migration write failed", saved.error);
        }
    }
}

/*==================================================
 Save Database
==================================================*/

function saveDatabase() {

    try {

        if (!database.metadata || typeof database.metadata !== "object") {
            database.metadata = {
                version: DB_VERSION,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        database.metadata.updatedAt = new Date().toISOString();

        localStorage.setItem(

            DB_NAME,

            JSON.stringify(database)

        );

        return createStorageResult({
            success: true,
            data: {
                key: DB_NAME,
                updatedAt: database.metadata.updatedAt
            },
            message: "Database saved successfully."
        });

    } catch (error) {

        console.error("Database Save Failed", error);

        return createStorageResult({
            success: false,
            errors: ["Unable to save database."],
            message: "Database save failed."
        });

    }

}

/*==================================================
 Reset Database
==================================================*/

function resetDatabase() {

    database = deepClone(defaultDatabase);

    const saved = saveDatabase();

    isDatabaseLoaded = true;

    return saved.success;

}

/*==================================================
 Database Validation
==================================================*/

function validateDatabase() {

    const modules = [

        "income",
        "expenses",
        "budgets",
        "loans",
        "investments",
        "creditcards",
        "transactions"

    ];

    return modules.every(module =>

        Array.isArray(database[module])

    );

}

/*==================================================
 Initialize Storage
==================================================*/

function initializeStorage() {

    loadDatabase();

    if (!validateDatabase()) {

        console.warn("Database Invalid");

        resetDatabase();

    }

    console.log("Storage Initialized");

}

initializeStorage();

window.addEventListener("storage", event => {
    if (event && event.key === DB_NAME) {
        isDatabaseLoaded = false;
    }
});

/*==================================================
 Part 2 : Generic CRUD Engine
==================================================*/

/*==================================================
 Generate Unique ID
==================================================*/

function generateId() {

    try {
        if (typeof crypto !== "undefined" &&
            crypto &&
            typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
    } catch (error) {
        // Continue with fallback for environments where crypto access fails.
    }

    return "id_" + Date.now().toString(36) + "_" +
        Math.random().toString(36).slice(2, 10);

}

/*==================================================
 Structured CRUD Results
==================================================*/

function createRecordResult(module, record) {

    if (!Array.isArray(database[module])) {

        return createStorageResult({
            success: false,
            errors: ["Invalid Module : " + module],
            message: "Create record failed."
        });

    }

    const newRecord = {

        id: generateId(),

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString(),

        ...record

    };

    database[module].push(newRecord);

    const saved = saveDatabase();

    if (!saved.success) {
        database[module].pop();
        return createStorageResult({
            success: false,
            errors: saved.errors.length ? saved.errors : ["Unable to save record."],
            message: "Create record failed."
        });
    }

    return createStorageResult({
        success: true,
        data: deepClone(newRecord),
        message: "Record created successfully."
    });

}

function getAllRecordsResult(module) {

    if (!Array.isArray(database[module])) {

        return createStorageResult({
            success: false,
            data: [],
            errors: ["Invalid Module : " + module],
            message: "Read records failed."
        });

    }

    return createStorageResult({
        success: true,
        data: deepClone(database[module]),
        message: "Records fetched successfully."
    });

}

function getRecordByIdResult(module, id) {

    if (!Array.isArray(database[module])) {

        return createStorageResult({
            success: false,
            data: null,
            errors: ["Invalid Module : " + module],
            message: "Read record failed."
        });

    }

    const record = database[module].find(

        item => item.id == id

    ) || null;

    if (!record) {
        return createStorageResult({
            success: false,
            data: null,
            errors: ["Record not found."],
            message: "Read record failed."
        });
    }

    return createStorageResult({
        success: true,
        data: deepClone(record),
        message: "Record fetched successfully."
    });

}

function updateRecordResult(module, id, updatedData) {

    if (!Array.isArray(database[module])) {

        return createStorageResult({
            success: false,
            errors: ["Invalid Module : " + module],
            message: "Update record failed."
        });

    }

    const index = database[module].findIndex(

        item => item.id == id

    );

    if (index === -1) {

        return createStorageResult({
            success: false,
            errors: ["Record not found."],
            message: "Update record failed."
        });

    }

    const previous = deepClone(database[module][index]);

    database[module][index] = {

        ...database[module][index],

        ...updatedData,

        updatedAt: new Date().toISOString()

    };

    const saved = saveDatabase();

    if (!saved.success) {
        database[module][index] = previous;
        return createStorageResult({
            success: false,
            errors: saved.errors.length ? saved.errors : ["Unable to save updated record."],
            message: "Update record failed."
        });
    }

    return createStorageResult({
        success: true,
        data: deepClone(database[module][index]),
        message: "Record updated successfully."
    });

}

function deleteRecordResult(module, id) {

    if (!Array.isArray(database[module])) {

        return createStorageResult({
            success: false,
            errors: ["Invalid Module : " + module],
            message: "Delete record failed."
        });

    }

    const index = database[module].findIndex(

        item => item.id == id

    );

    if (index === -1) {

        return createStorageResult({
            success: false,
            errors: ["Record not found."],
            message: "Delete record failed."
        });

    }

    const removed = database[module][index];

    database[module].splice(index, 1);

    const saved = saveDatabase();

    if (!saved.success) {
        database[module].splice(index, 0, removed);
        return createStorageResult({
            success: false,
            errors: saved.errors.length ? saved.errors : ["Unable to save deletion."],
            message: "Delete record failed."
        });
    }

    return createStorageResult({
        success: true,
        data: deepClone(removed),
        message: "Record deleted successfully."
    });

}

function replaceModuleResult(module, data) {

    if (!Array.isArray(database[module])) {

        return createStorageResult({
            success: false,
            errors: ["Invalid Module : " + module],
            message: "Replace module failed."
        });

    }

    if (!Array.isArray(data)) {
        return createStorageResult({
            success: false,
            errors: ["Module data must be an array."],
            message: "Replace module failed."
        });
    }

    const previous = deepClone(database[module]);
    database[module] = deepClone(data);

    const saved = saveDatabase();

    if (!saved.success) {
        database[module] = previous;
        return createStorageResult({
            success: false,
            errors: saved.errors.length ? saved.errors : ["Unable to save module data."],
            message: "Replace module failed."
        });
    }

    return createStorageResult({
        success: true,
        data: deepClone(database[module]),
        message: "Module replaced successfully."
    });

}

/*==================================================
 Create Record
==================================================*/

function createRecord(module, record) {

    const result = createRecordResult(module, record);

    if (!result.success) {
        console.error(result.error || "Create record failed");
        return null;
    }

    return result.data;

}

/*==================================================
 Get All Records
==================================================*/

function getAllRecords(module) {

    const result = getAllRecordsResult(module);

    return result.success ? result.data : [];

}

/*==================================================
 Get Record By ID
==================================================*/

function getRecordById(module, id) {

    const result = getRecordByIdResult(module, id);

    return result.success ? result.data : null;

}

/*==================================================
 Update Record
==================================================*/

function updateRecord(module, id, updatedData) {

    const result = updateRecordResult(module, id, updatedData);

    return result.success;

}

/*==================================================
 Delete Record
==================================================*/

function deleteRecord(module, id) {

    const result = deleteRecordResult(module, id);

    return result.success;

}

/*==================================================
 Replace Module
==================================================*/

function replaceModule(module, data) {

    const result = replaceModuleResult(module, data);

    return result.success;

}

console.log("Storage Part 2 Ready");

/*==================================================
 Part 3 : Module APIs
==================================================*/

/*==================================================
 Income
==================================================*/

function getIncome() {
    return getAllRecords("income");
}

function addIncome(data) {
    return createRecord("income", data);
}

function updateIncome(id, data) {
    return updateRecord("income", id, data);
}

function removeIncome(id) {
    return deleteRecord("income", id);
}

function saveIncome(data) {
    return replaceModule("income", data);
}

/*==================================================
 Expenses
==================================================*/

function getExpenses() {
    return getAllRecords("expenses");
}

function getExpense() {
    return getExpenses();
}

function addExpense(data) {
    return createRecord("expenses", data);
}

function updateExpense(id, data) {
    return updateRecord("expenses", id, data);
}

function removeExpense(id) {
    return deleteRecord("expenses", id);
}

function deleteExpense(id) {
    return removeExpense(id);
}

function saveExpenses(data) {
    return replaceModule("expenses", data);
}

function saveExpense(data) {
    return saveExpenses(data);
}

/*==================================================
 Budgets
==================================================*/

function getBudgets() {
    return getAllRecords("budgets");
}

function getBudget() {
    return getBudgets();
}

function addBudget(data) {
    return createRecord("budgets", data);
}

function updateBudget(id, data) {
    return updateRecord("budgets", id, data);
}

function removeBudget(id) {
    return deleteRecord("budgets", id);
}

function saveBudgets(data) {
    return replaceModule("budgets", data);
}

function saveBudget(data) {
    return saveBudgets(data);
}

/*==================================================
 Loans
==================================================*/

function getLoans() {
    return getAllRecords("loans");
}

function addLoan(data) {
    return createRecord("loans", data);
}

function updateLoan(id, data) {
    return updateRecord("loans", id, data);
}

function removeLoan(id) {
    return deleteRecord("loans", id);
}

function saveLoans(data) {
    return replaceModule("loans", data);
}

/*==================================================
 Investments
==================================================*/

function getInvestments() {
    return getAllRecords("investments");
}

function addInvestment(data) {
    return createRecord("investments", data);
}

function updateInvestment(id, data) {
    return updateRecord("investments", id, data);
}

function removeInvestment(id) {
    return deleteRecord("investments", id);
}

function saveInvestments(data) {
    return replaceModule("investments", data);
}

/*==================================================
 Transactions
==================================================*/

function getTransactions() {

    return getAllRecords("transactions");

}

function addTransaction(data) {

    return createRecord("transactions", data);

}

function updateTransaction(id, data) {

    return updateRecord("transactions", id, data);

}

function removeTransaction(id) {

    return deleteRecord("transactions", id);

}

function saveTransactions(data) {

    return replaceModule("transactions", data);

}

console.log("Storage Part 3 Ready");

/*==================================================
 Part 4 : Search, Statistics & Helper Functions
==================================================*/

/*==================================================
 Module Exists
==================================================*/

function moduleExists(module) {

    return Object.prototype.hasOwnProperty.call(database, module);

}

/*==================================================
 Record Count
==================================================*/

function getRecordCount(module) {

    if (!moduleExists(module)) {

        return 0;

    }

    return database[module].length;

}

/*==================================================
 Search Records
==================================================*/

function searchRecords(module, keyword = "") {

    if (!moduleExists(module)) {

        return [];

    }

    keyword = String(keyword)
        .toLowerCase()
        .trim();

    if (keyword === "") {

        return getAllRecords(module);

    }

    return database[module].filter(record =>

        Object.values(record).some(value =>

            String(value)
                .toLowerCase()
                .includes(keyword)

        )

    );

}

/*==================================================
 Filter Records
==================================================*/

function filterRecords(module, field, value) {

    if (!moduleExists(module)) {

        return [];

    }

    return database[module].filter(record =>

        record[field] === value

    );

}

/*==================================================
 Sort Records
==================================================*/

function sortRecords(module, field, order = "asc") {

    if (!moduleExists(module)) {

        return [];

    }

    const list = [...database[module]];

    list.sort((a, b) => {

        if (a[field] < b[field]) {

            return order === "asc" ? -1 : 1;

        }

        if (a[field] > b[field]) {

            return order === "asc" ? 1 : -1;

        }

        return 0;

    });

    return list;

}

/*==================================================
 Clone Data
==================================================*/

function cloneData(data) {

    return structuredClone(data);

}

/*==================================================
 Module Empty
==================================================*/

function isModuleEmpty(module) {

    return getRecordCount(module) === 0;

}

/*==================================================
 Database Statistics
==================================================*/

function getDatabaseStatistics() {

    return {

        income: getRecordCount("income"),

        expenses: getRecordCount("expenses"),

        budgets: getRecordCount("budgets"),

        loans: getRecordCount("loans"),

        investments: getRecordCount("investments"),

        transactions: getRecordCount("transactions"),

        reminders: getRecordCount("reminders"),

        goals: getRecordCount("goals"),

        categories: getRecordCount("categories"),

        reports: getRecordCount("reports")

    };

}

console.log("Storage Part 4 Ready");
