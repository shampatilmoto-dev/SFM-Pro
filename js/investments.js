"use strict";

/*==================================================
 SFM PRO Enterprise v3.5 Stable
 Investment Module
 Part 1 : CRUD Operations
==================================================*/

const INVESTMENT_MODULE = {
    version: "1.0.0",
    module: "Investments"
};

/*==================================================
 Initialize
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
    initializeInvestmentModule();
});

function initializeInvestmentModule() {

    const saveButton = document.getElementById("saveInvestmentBtn");

    if (!saveButton) return;

    loadInvestmentTable();

    saveButton.addEventListener(
        "click",
        saveInvestmentRecord
    );

}

/*==================================================
 Save Investment
==================================================*/

function saveInvestmentRecord(event) {

    event.preventDefault();

    const name = document.getElementById("investmentName");
    const type = document.getElementById("investmentType");
    const invested = document.getElementById("investedAmount");
    const current = document.getElementById("currentValue");
    const date = document.getElementById("investmentDate");
    const notes = document.getElementById("investmentNotes");

    if (!validateRequired([
        name,
        invested,
        current,
        date
    ])) {
        return;
    }

    const investment = {

        id: generateId(),

        name: name.value.trim(),

        type: type ? type.value : "",

        investedAmount: Number(invested.value),

        currentValue: Number(current.value),

        amount: Number(invested.value),

        current: Number(current.value),

        date: date.value,

        notes: notes ? notes.value.trim() : "",

        createdAt: new Date().toISOString()

    };

    createRecord(
        "investments",
        investment
    );

    loadInvestmentTable();

    if (typeof synchronizeApplication === "function") {
        synchronizeApplication();
    }

    resetForm("investmentForm");

    showNotification(
        "Investment saved successfully."
    );

}

/*==================================================
 Load Table
==================================================*/

function loadInvestmentTable() {

    const table = document.getElementById("investmentTable");

    if (!table) return;

    const records = getInvestmentRecords();

    updateInvestmentSummary();

    table.innerHTML = "";

    if (records.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="8">
                No investment records found.
            </td>
        </tr>
        `;

        return;

    }

    records
        .sort((a,b)=>Number(b.id)-Number(a.id))
        .forEach(record=>{

            table.innerHTML += createInvestmentRow(record);

        });

}

/*==================================================
 Row
==================================================*/

function escapeInvestmentHtml(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split(String.fromCharCode(34)).join('&quot;')
        .replace(/'/g, '&#39;');

}

function createInvestmentRow(record) {

    const safeName = escapeInvestmentHtml(record.name);
    const safeType = escapeInvestmentHtml(record.type);

    const investedAmount = Number(
        record.investedAmount ?? record.amount ?? 0
    );

    const currentValue = Number(
        record.currentValue ?? record.current ?? 0
    );

    const profit = currentValue - investedAmount;

    return `
    <tr>

        <td>${safeName}</td>

        <td>${safeType}</td>

        <td>${currency(investedAmount)}</td>

        <td>${currency(currentValue)}</td>

        <td>${currency(profit)}</td>

        <td>

            <button
                class="edit-btn"
                onclick="editInvestmentRecord('${record.id}')">

                Edit

            </button>

            <button
                class="delete-btn"
                onclick="deleteInvestmentRecord('${record.id}')">

                Delete

            </button>

        </td>

    </tr>
    `;

}

/*==================================================
 Delete
==================================================*/

function deleteInvestmentRecord(id) {

    if (!confirmDelete()) return;

    deleteRecord(
        "investments",
        id
    );

    loadInvestmentTable();

    if (typeof synchronizeApplication === "function") {
        synchronizeApplication();
    }

    showNotification(
        "Investment deleted."
    );

}

/*==================================================
 Search
==================================================*/

function searchInvestment(keyword) {

    return searchRecords(
        "investments",
        keyword
    );

}

/*==================================================
 Sort
==================================================*/

function sortInvestment(field="currentValue") {

    return sortRecords(
        "investments",
        field,
        "desc"
    );

}

/*==================================================
 Statistics
==================================================*/

function getInvestmentStatistics() {

    return {

        totalRecords:
            getInvestmentRecords().length,

        totalInvestment:
            getTotalInvestment(),

        currentValue:
            getCurrentInvestmentValue(),

        profit:
            getInvestmentProfit(),

        roi:
            getInvestmentROI()

    };

}

/*==================================================
 Refresh
==================================================*/

function refreshInvestmentModule() {

    loadInvestmentTable();

}

/*==================================================
 Export
==================================================*/

window.InvestmentModule = {

    loadInvestmentTable,

    refreshInvestmentModule,

    getInvestmentStatistics,

    searchInvestment,

    sortInvestment

};

console.log("--------------------------------");

console.log("Investment Module Ready");

console.log("Version :", INVESTMENT_MODULE.version);

console.log("--------------------------------");

/*==================================================
 SFM PRO Enterprise v3.5 Stable
 Investment Module
 Part 2 : Portfolio Analytics
==================================================*/

/*==================================================
 Edit Investment
==================================================*/

function editInvestmentRecord(id) {

    const investment = getInvestmentRecords()
        .find(item => String(item.id) === String(id));

    if (!investment) return;

    document.getElementById("investmentName").value = investment.name;
    document.getElementById("investmentType").value = investment.type;
    document.getElementById("investedAmount").value = investment.investedAmount;
    document.getElementById("currentValue").value = investment.currentValue;
    document.getElementById("investmentDate").value = investment.date;
    const notes = document.getElementById("investmentNotes");

    if (notes) {
        notes.value = investment.notes || "";
    }

    deleteRecord("investments", id);

    loadInvestmentTable();

    showNotification(
        "Investment loaded for editing."
    );

}

/*==================================================
 Investment Summary
==================================================*/

function getInvestmentSummary() {

    return {

        totalInvestment: getTotalInvestment(),

        currentValue: getCurrentInvestmentValue(),

        totalProfit: getInvestmentProfit(),

        roi: getInvestmentROI(),

        totalRecords: getInvestmentRecords().length

    };

}

function updateInvestmentSummary() {

    const summary = getInvestmentSummary();

    const totalInvestments =
        document.getElementById("totalInvestments");

    const totalInvested =
        document.getElementById("totalInvested");

    const currentInvestmentValue =
        document.getElementById("currentInvestmentValue");

    const investmentProfit =
        document.getElementById("investmentProfit");

    if (totalInvestments) {
        totalInvestments.textContent = summary.totalRecords;
    }

    if (totalInvested) {
        totalInvested.textContent = currency(summary.totalInvestment);
    }

    if (currentInvestmentValue) {
        currentInvestmentValue.textContent = currency(summary.currentValue);
    }

    if (investmentProfit) {
        investmentProfit.textContent = currency(summary.totalProfit);
    }

}

/*==================================================
 Portfolio Allocation
==================================================*/

function getPortfolioAllocation() {

    const summary = {};

    getInvestmentRecords().forEach(item => {

        if (!summary[item.type]) {

            summary[item.type] = 0;

        }

        summary[item.type] += item.currentValue;

    });

    return summary;

}

/*==================================================
 Top Investment
==================================================*/

function getTopInvestment() {

    const records = [...getInvestmentRecords()];

    if (records.length === 0) return null;

    records.sort(

        (a,b)=>b.currentValue-a.currentValue

    );

    return records[0];

}

/*==================================================
 Savings Goal
==================================================*/

function getSavingsGoalProgress() {

    const goal = getSavingsGoalAmount();

    if (goal <= 0) {

        return 0;

    }

    return (

        getCurrentInvestmentValue()

        /

        goal

    ) * 100;

}

/*==================================================
 Dashboard Widget
==================================================*/

function getInvestmentDashboardWidget() {

    return {

        invested:

            getTotalInvestment(),

        current:

            getCurrentInvestmentValue(),

        profit:

            getInvestmentProfit(),

        roi:

            getInvestmentROI(),

        goal:

            getSavingsGoalProgress()

    };

}

/*==================================================
 Portfolio Health
==================================================*/

function getPortfolioHealth() {

    const roi = getInvestmentROI();

    if (roi >= 20) return "Excellent";

    if (roi >= 10) return "Good";

    if (roi >= 0) return "Average";

    return "Needs Improvement";

}

/*==================================================
 Refresh Dashboard
==================================================*/

function refreshInvestmentDashboard() {

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
 Export
==================================================*/

Object.assign(

    window.InvestmentModule,

    {

        editInvestmentRecord,

        getInvestmentSummary,

        getPortfolioAllocation,

        getTopInvestment,

        getSavingsGoalProgress,

        getInvestmentDashboardWidget,

        getPortfolioHealth,

        refreshInvestmentDashboard

    }

);

console.log("Investment Module Part 2 Ready");

/*==================================================
 SFM PRO Enterprise v3.5 Stable
 Investment Module
 Part 3 : Reports & Performance
==================================================*/

/*==================================================
 Monthly Investment Summary
==================================================*/

function getMonthlyInvestmentSummary() {

    const summary = {};

    getInvestmentRecords().forEach(record => {

        const month = record.date.substring(0,7);

        if(!summary[month]){

            summary[month]={

                invested:0,

                current:0

            };

        }

        summary[month].invested += record.investedAmount;

        summary[month].current += record.currentValue;

    });

    return summary;

}

/*==================================================
 Profit History
==================================================*/

function getInvestmentProfitHistory() {

    return getInvestmentRecords().map(record=>{

        return{

            name:record.name,

            profit:

            record.currentValue-

            record.investedAmount

        };

    });

}

/*==================================================
 Performance Trend
==================================================*/

function getInvestmentPerformanceTrend(){

    return getInvestmentRecords().map(record=>{

        return{

            name:record.name,

            roi:

            ((record.currentValue-record.investedAmount)

            /

            record.investedAmount)

            *100

        };

    });

}

/*==================================================
 Chart Data
==================================================*/

function getInvestmentChartData(){

    return{

        labels:

        getInvestmentRecords().map(

            x=>x.name

        ),

        invested:

        getInvestmentRecords().map(

            x=>x.investedAmount

        ),

        current:

        getInvestmentRecords().map(

            x=>x.currentValue

        )

    };

}

/*==================================================
 Export Summary
==================================================*/

function exportInvestmentSummary(){

    return{

        summary:

        getInvestmentSummary(),

        allocation:

        getPortfolioAllocation(),

        trend:

        getInvestmentPerformanceTrend(),

        monthly:

        getMonthlyInvestmentSummary()

    };

}

/*==================================================
 Print Portfolio
==================================================*/

function printInvestmentSummary(){

    console.table(

        exportInvestmentSummary()

    );

}

/*==================================================
 Refresh Module
==================================================*/

function refreshInvestmentEngine(){

    loadInvestmentTable();

    refreshInvestmentDashboard();

}

/*==================================================
 Portfolio Allocation
==================================================*/

function getPortfolioAllocation() {

    const records = getInvestmentRecords();

    const allocation = {};

    records.forEach(record => {

        const type = record.type || record.investmentType || "Other";

        const amount = Number(
            record.amount ||
            record.investedAmount ||
            0
        );

        allocation[type] = (allocation[type] || 0) + amount;

    });

    return allocation;

}

/*==================================================
 Final Export
==================================================*/

Object.assign(

window.InvestmentModule,

{

getMonthlyInvestmentSummary,

getInvestmentProfitHistory,

getInvestmentPerformanceTrend,

getInvestmentChartData,

getPortfolioAllocation,

exportInvestmentSummary,

printInvestmentSummary,

refreshInvestmentEngine

}

);

window.getPortfolioAllocation = getPortfolioAllocation;

console.log("--------------------------------");

console.log("Investment Module Completed");

console.log("Version : 1.0.0");

console.log("Status  : Production Ready");

console.log("--------------------------------");
