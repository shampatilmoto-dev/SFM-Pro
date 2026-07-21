"use strict";

/*==================================================
 SFM PRO Enterprise
 App Controller v5.0 Production Release
 Part 1 : Core Controller
==================================================*/

/*==================================================
 Module Information
==================================================*/

const APP_ENGINE = {

    version: "v5.0 Production Release",

    name: "SFM Application Controller"

};

function escapeAppHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split(String.fromCharCode(34)).join('&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeText(value) {
    if (typeof Sanitizer === "object" && typeof Sanitizer.text === "function") {
        return Sanitizer.text(value);
    }

    return String(value ?? "").trim();
}

/*==================================================
 DOM Ready
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeApplication();

});

/*==================================================
 Initialize Application
==================================================*/

function initializeApplication() {

    console.log("--------------------------------");

    console.log(APP_ENGINE.name);

    console.log("Version :", APP_ENGINE.version);

    console.log("--------------------------------");

    registerGlobalEvents();

    initializeForms();

    initializeTables();

    synchronizeApplication();

}

/*==================================================
 Register Global Events
==================================================*/

function registerGlobalEvents() {

    window.addEventListener(

        "sfm-database",

        () => {

            synchronizeApplication();

        }

    );

}

/*==================================================
 Initialize Forms
==================================================*/

function initializeForms() {

    if (typeof FormEngine === "object" && typeof FormEngine.prepareAllForms === "function") {
        FormEngine.prepareAllForms(document, { autocomplete: "off" });
        return;
    }

    const forms = document.querySelectorAll("form");

    forms.forEach(form => {

        form.setAttribute("autocomplete", "off");

    });

}

/*==================================================
 Initialize Tables
==================================================*/

function initializeTables() {

    if (typeof IncomeTable !== "undefined") {
    IncomeTable.load();
}

    if (typeof loadExpenseTable === "function") {

        loadExpenseTable();

    }

    if (typeof loadBudgetTable === "function") {

        loadBudgetTable();

    }

    if (typeof loadLoanTable === "function") {

        loadLoanTable();

    }

    if (typeof loadInvestmentTable === "function") {

        loadInvestmentTable();

    }

}

/*==================================================
 Synchronize Application
==================================================*/

function synchronizeApplication() {

    if (

        typeof refreshDashboard ===

        "function"

    ) {

        refreshDashboard();

    }

    if (

        typeof loadCharts ===

        "function"

    ) {

        loadCharts();

    }

}

/*==================================================
 Reset Form
==================================================*/

function resetForm(formId) {

    const form = document.getElementById(formId);

    if (!form) return;

    form.reset();

}

/*==================================================
 Notification
==================================================*/

function showNotification(

    message,

    type = "success"

) {

    console.log(

        `[${type.toUpperCase()}] ${message}`

    );

    const resolvedType = String(type || "success").toLowerCase();

    if (typeof ErrorHandler === "object" && typeof ErrorHandler.notify === "function") {
        ErrorHandler.notify(message, resolvedType, {
            fallbackMessage: "Operation status unavailable."
        });
        return;
    }

    if (typeof Notification === "object" && typeof Notification.show === "function") {
        Notification.show(message, resolvedType);
        return;
    }

    alert(message);

}

/*==================================================
 Validation
==================================================*/

function isEmpty(value) {

    return (

        value === null ||

        value === undefined ||

        String(value).trim() === ""

    );

}

function validateRequired(fields) {

    for (const field of fields) {

        const value = sanitizeText(field && "value" in field ? field.value : "");

        const isValid = typeof Validator === "object" && typeof Validator.required === "function"
            ? Validator.required(value)
            : !isEmpty(value);

        if (!isValid) {

            field.focus();

            showNotification(

                "Please fill all required fields.",

                "warning"

            );

            return false;

        }

    }

    return true;

}

/*==================================================
 Common Delete Confirmation
==================================================*/

function confirmDelete(message = "Delete this record?") {
    if (typeof Dialog === "object" && typeof Dialog.confirmSync === "function") {
        return Dialog.confirmSync(message);
    }

    return confirm(message);

}

/*==================================================
 Currency Helper
==================================================*/

function currency(value) {

    return formatCurrency(value);

}

/*==================================================
 Dashboard Refresh
==================================================*/

function refreshApplication() {

    synchronizeApplication();

}

/*==================================================
 Controller Information
==================================================*/

function getApplicationInfo() {

    return {

        controller:

            APP_ENGINE.name,

        version:

            APP_ENGINE.version,

        finance:

            getFinanceEngineInfo(),

        storage:

            getDatabaseStatistics()

    };

}

/*==================================================
 Export
==================================================*/

window.App = {

    refreshApplication,

    showNotification,

    validateRequired,

    resetForm,

    currency,

    getApplicationInfo

};

console.log("--------------------------------");

console.log("App Controller Part 1 Ready");

console.log("--------------------------------");

/*==================================================
 App Part 2
 Income Module
==================================================*/

/*==================================================
 Initialize Income Module
==================================================*/

function initializeIncomeModule() {

    const saveButton = document.getElementById("saveIncomeBtn");

    if (!saveButton) return;

    loadIncomeTable();

    saveButton.addEventListener("click", saveIncomeRecord);

}

/*==================================================
 Save Income
==================================================*/

function saveIncomeRecord(event) {

    event.preventDefault();

    const title = document.getElementById("incomeTitle");

    const category = document.getElementById("incomeCategory");

    const amount = document.getElementById("incomeAmount");

    const date = document.getElementById("incomeDate");

    const notes = document.getElementById("incomeNotes");

    if (!validateRequired([

        title,

        amount,

        date

    ])) {

        return;

    }

    const income = {

        id: generateId(),

        title: title.value.trim(),

        category: category.value,

        amount: Number(amount.value),

        date: date.value,

        notes: notes.value.trim()

    };

    createRecord("income", income);

    loadIncomeTable();

    synchronizeApplication();

    resetForm("incomeForm");

    showNotification(

        "Income saved successfully."

    );

}

function loadIncome() {

}

/*==================================================
 Income Row
==================================================*/

function createIncomeRow(record) {

    return `

<tr>

<td>${escapeAppHtml(record.title)}</td>

<td>${escapeAppHtml(record.category)}</td>

<td>${currency(record.amount)}</td>

<td>${formatDate(record.date)}</td>

<td>

<button

class="delete-btn"

onclick="deleteIncomeRecord('${record.id}')">

ðŸ—‘ Delete

</button>

</td>

</tr>

`;

}

/*==================================================
 Delete Income
==================================================*/

function deleteIncomeRecord(id) {

    if (!confirmDelete()) {

        return;

    }

    deleteRecord(

        "income",

        id

    );

    loadIncomeTable();

    synchronizeApplication();

    showNotification(

        "Income deleted."

    );

}

/*==================================================
 Search Income
==================================================*/

function searchIncome(keyword) {

    return searchRecords(

        "income",

        keyword

    );

}

/*==================================================
 Sort Income
==================================================*/

function sortIncome(field = "date") {

    return sortRecords(

        "income",

        field,

        "desc"

    );

}

/*==================================================
 Income Statistics
==================================================*/

function getIncomeStatistics() {

    return {

        totalRecords:

            getIncomeRecords().length,

        totalIncome:

            getTotalIncome(),

        monthlyIncome:

            getMonthlyIncome(),

        categories:

            getIncomeByCategory()

    };

}

/*==================================================
 Start Income Module
==================================================*/

initializeIncomeModule();

console.log("App Part 2 Ready");

/*==================================================
 App Part 3
 Expense Module
==================================================*/

/*==================================================
 Start Expense Module
==================================================*/

// initializeExpenseModule();

console.log("App Part 3 Ready");

/*==================================================
 App Part 4
 Budget Module
==================================================*/

/*==================================================
 Initialize Budget Module
==================================================*/

function initializeBudgetModule() {

    const saveButton = document.getElementById("saveBudgetBtn");

    if (!saveButton) return;

    loadBudgetTable();

    saveButton.addEventListener("click", saveBudgetRecord);

}

/*==================================================
 Save Budget
==================================================*/

function saveBudgetRecord(event) {

    event.preventDefault();

    const category = document.getElementById("budgetCategory");

    const amount = document.getElementById("budgetAmount");

    const month = document.getElementById("budgetMonth");

    const notes = document.getElementById("budgetNotes");

    if (!validateRequired([

        category,

        amount,

        month

    ])) {

        return;

    }

    const budget = {

        id: generateId(),

        category: category.value,

        amount: Number(amount.value),

        month: month.value,

        notes: notes.value.trim(),

        createdAt: new Date().toISOString()

    };

    createRecord("budgets", budget);

    loadBudgetTable();

    synchronizeApplication();

    resetForm("budgetForm");

    showNotification(

        "Budget saved successfully."

    );

}

/*==================================================
 Load Budget Table
==================================================*/

function loadBudgetTable() {

    const table = document.getElementById("budgetTable");

    if (!table) return;

    const records = getBudgetRecords();

    table.innerHTML = "";

    if (records.length === 0) {

        table.innerHTML = `

<tr>

<td colspan="6">

No budget records found.

</td>

</tr>

`;

        return;

    }

    records

        .sort((a, b) =>

            Number(b.id) - Number(a.id)

        )

        .forEach(record => {

            table.innerHTML += createBudgetRow(record);

        });

}

/*==================================================
 Budget Row
==================================================*/

function createBudgetRow(record) {

    return `

<tr>

<td>${escapeAppHtml(record.category)}</td>

<td>${currency(record.amount)}</td>

<td>${escapeAppHtml(record.month)}</td>

<td>${escapeAppHtml(record.notes || "-")}</td>

<td>${getBudgetStatus()}</td>

<td>

<button

class="delete-btn"

onclick="deleteBudgetRecord('${record.id}')">

ðŸ—‘ Delete

</button>

</td>

</tr>

`;

}

/*==================================================
 Delete Budget
==================================================*/

function deleteBudgetRecord(id) {

    if (!confirmDelete()) {

        return;

    }

    deleteRecord(

        "budgets",

        id

    );

    loadBudgetTable();

    synchronizeApplication();

    showNotification(

        "Budget deleted."

    );

}

/*==================================================
 Search Budget
==================================================*/

function searchBudget(keyword) {

    return searchRecords(

        "budgets",

        keyword

    );

}

/*==================================================
 Sort Budget
==================================================*/

function sortBudget(field = "month") {

    return sortRecords(

        "budgets",

        field,

        "desc"

    );

}

/*==================================================
 Budget Statistics
==================================================*/

function getBudgetStatistics() {

    return {

        totalRecords:

            getBudgetRecords().length,

        totalBudget:

            getTotalBudget(),

        spent:

            getBudgetSpent(),

        remaining:

            getBudgetRemaining(),

        usage:

            getBudgetUsage(),

        status:

            getBudgetStatus()

    };

}

/*==================================================
 Budget Alert
==================================================*/

function checkBudgetAlert() {

    if (isBudgetExceeded()) {

        showNotification(

            "Warning: Budget limit exceeded.",

            "warning"

        );

    }

}

/*==================================================
 Refresh Budget
==================================================*/

function refreshBudgetModule() {

    loadBudgetTable();

    checkBudgetAlert();

}

/*==================================================
 Start Budget Module
==================================================*/

initializeBudgetModule();

console.log("App Part 4 Ready");

/*==================================================
 App Part 5
 Loan Module
==================================================*/

/*==================================================
 Initialize Loan Module
==================================================*/

function initializeLoanModule() {

    const saveButton = document.getElementById("saveLoanBtn");

    if (!saveButton) return;

    loadLoanTable();

    saveButton.addEventListener("click", saveLoanRecord);

}

/*==================================================
 Save Loan
==================================================*/

function saveLoanRecord(event) {

    event.preventDefault();

    const lender = document.getElementById("loanLender");

    const type = document.getElementById("loanType");

    const amount = document.getElementById("loanAmount");

    const emi = document.getElementById("loanEMI");

    const interest = document.getElementById("loanInterest");

    const tenure = document.getElementById("loanTenure");

    const startDate = document.getElementById("loanStartDate");

    const notes = document.getElementById("loanNotes");

    if (!validateRequired([
        lender,
        amount,
        emi
    ])) {

        return;

    }

    const loan = {

        id: generateId(),

        lender: lender.value.trim(),

        type: type ? type.value : "",

        amount: Number(amount.value),

        emi: Number(emi.value),

        interest: Number(interest ? interest.value : 0),

        tenure: Number(tenure ? tenure.value : 0),

        startDate: startDate ? startDate.value : "",

        notes: notes ? notes.value.trim() : "",

        createdAt: new Date().toISOString()

    };

    createRecord("loans", loan);

    loadLoanTable();

    synchronizeApplication();

    resetForm("loanForm");

    showNotification("Loan saved successfully.");

}

/*==================================================
 Load Loan Table
==================================================*/

function loadLoanTable() {

    const table = document.getElementById("loanTable");

    if (!table) return;

    const records = getLoanRecords();

    table.innerHTML = "";

    if (records.length === 0) {

        table.innerHTML = `

<tr>
<td colspan="8">No loan records found.</td>
</tr>

`;

        return;

    }

    records
        .sort((a,b)=>Number(b.id)-Number(a.id))
        .forEach(record=>{

            table.innerHTML += createLoanRow(record);

        });

}

/*==================================================
 Loan Row
==================================================*/

function createLoanRow(record) {

    return `

<tr>

<td>${escapeAppHtml(record.lender)}</td>

<td>${escapeAppHtml(record.type)}</td>

<td>${currency(record.amount)}</td>

<td>${currency(record.emi)}</td>

<td>${record.interest}%</td>

<td>${record.tenure} Months</td>

<td>${escapeAppHtml(record.startDate || "-")}</td>

<td>

<button
class="delete-btn"
onclick="deleteLoanRecord('${record.id}')">

ðŸ—‘ Delete

</button>

</td>

</tr>

`;

}

/*==================================================
 Delete Loan
==================================================*/

function deleteLoanRecord(id) {

    if (!confirmDelete()) return;

    deleteRecord("loans", id);

    loadLoanTable();

    synchronizeApplication();

    showNotification("Loan deleted.");

}

/*==================================================
 Search Loan
==================================================*/

function searchLoan(keyword) {

    return searchRecords(
        "loans",
        keyword
    );

}

/*==================================================
 Sort Loan
==================================================*/

function sortLoan(field="amount") {

    return sortRecords(
        "loans",
        field,
        "desc"
    );

}

/*==================================================
 Loan Statistics
==================================================*/

function getLoanStatistics() {

    return {

        totalLoans: getLoanRecords().length,

        outstanding: getOutstandingLoans(),

        monthlyEMI: getMonthlyEMI(),

        totalInterest: getTotalLoanInterest(),

        liabilities: getTotalLiabilities(),

        debtRatio: getDebtToIncomeRatio(),

        status: getLoanStatus()

    };

}

/*==================================================
 EMI Reminder
==================================================*/

function checkEMIReminder() {

    const emi = getMonthlyEMI();

    if (emi > 0) {

        console.log(

            "Monthly EMI :",

            currency(emi)

        );

    }

}

/*==================================================
 Refresh Loan Module
==================================================*/

function refreshLoanModule() {

    loadLoanTable();

    checkEMIReminder();

}

/*==================================================
 Start Loan Module
==================================================*/

initializeLoanModule();

console.log("App Part 5 Ready");

/*==================================================
 App Part 6
 Credit Card Module
==================================================*/

/*==================================================
 Initialize Credit Card Module
==================================================*/

function initializeCreditCardModule() {

    const saveButton = document.getElementById("saveCreditCardBtn");

    if (!saveButton) return;

    loadCreditCardTable();

    saveButton.addEventListener("click", saveCreditCardRecord);

}

/*==================================================
 Save Credit Card
==================================================*/

function saveCreditCardRecord(event) {

    event.preventDefault();

    const bank = document.getElementById("cardBank");
    const cardName = document.getElementById("cardName");
    const limit = document.getElementById("creditLimit");
    const outstanding = document.getElementById("outstandingAmount");
    const dueDate = document.getElementById("dueDate");
    const notes = document.getElementById("cardNotes");

    if (!validateRequired([
        bank,
        cardName,
        limit,
        outstanding
    ])) {
        return;
    }

    const card = {

        id: generateId(),

        bank: bank.value.trim(),

        cardName: cardName.value.trim(),

        creditLimit: Number(limit.value),

        outstanding: Number(outstanding.value),

        dueDate: dueDate ? dueDate.value : "",

        notes: notes ? notes.value.trim() : "",

        createdAt: new Date().toISOString()

    };

    createRecord("creditcards", card);

    loadCreditCardTable();

    synchronizeApplication();

    resetForm("creditCardForm");

    showNotification(
        "Credit Card saved successfully."
    );

}

/*==================================================
 Load Credit Card Table
==================================================*/

function loadCreditCardTable() {

    const table = document.getElementById("creditCardTable");

    if (!table) return;

    const records = getCreditCardRecords();

    table.innerHTML = "";

    if (records.length === 0) {

        table.innerHTML = `

<tr>
<td colspan="7">
No credit cards found.
</td>
</tr>

`;

        return;

    }

    records
        .sort((a,b)=>Number(b.id)-Number(a.id))
        .forEach(record=>{

            table.innerHTML += createCreditCardRow(record);

        });

}

/*==================================================
 Credit Card Row
==================================================*/

function createCreditCardRow(record) {

    const utilization = record.creditLimit > 0
        ? ((record.outstanding / record.creditLimit) * 100).toFixed(1)
        : 0;

    return `

<tr>

<td>${escapeAppHtml(record.bank)}</td>

<td>${escapeAppHtml(record.cardName)}</td>

<td>${currency(record.creditLimit)}</td>

<td>${currency(record.outstanding)}</td>

<td>${utilization}%</td>

<td>${escapeAppHtml(record.dueDate || "-")}</td>

<td>

<button
class="delete-btn"
onclick="deleteCreditCardRecord('${record.id}')">

ðŸ—‘ Delete

</button>

</td>

</tr>

`;

}

/*==================================================
 Delete Credit Card
==================================================*/

function deleteCreditCardRecord(id) {

    if (!confirmDelete()) return;

    deleteRecord("creditcards", id);

    loadCreditCardTable();

    synchronizeApplication();

    showNotification(
        "Credit Card deleted."
    );

}

/*==================================================
 Search Credit Card
==================================================*/

function searchCreditCard(keyword) {

    return searchRecords(
        "creditcards",
        keyword
    );

}

/*==================================================
 Sort Credit Card
==================================================*/

function sortCreditCard(field="outstanding") {

    return sortRecords(
        "creditcards",
        field,
        "desc"
    );

}

/*==================================================
 Credit Card Statistics
==================================================*/

function getCreditCardStatistics() {

    return {

        totalCards:
            getCreditCardRecords().length,

        totalOutstanding:
            getCreditCardOutstanding(),

        totalLimit:
            getCreditLimit(),

        utilization:
            getCreditUtilization(),

        liabilities:
            getTotalLiabilities()

    };

}

/*==================================================
 Credit Limit Alert
==================================================*/

function checkCreditCardAlert() {

    const utilization = getCreditUtilization();

    if (utilization >= 80) {

        showNotification(
            "Warning: Credit utilization is above 80%.",
            "warning"
        );

    }

}

/*==================================================
 Refresh Credit Card Module
==================================================*/

function refreshCreditCardModule() {

    loadCreditCardTable();

    checkCreditCardAlert();

}

/*==================================================
 Start Credit Card Module
==================================================*/

initializeCreditCardModule();

console.log("App Part 6 Ready");

