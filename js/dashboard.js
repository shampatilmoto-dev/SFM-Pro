/*==================================================
 SFM PRO Enterprise v3.5 Stable
 dashboard.js
 Part 1 : Core Initialization
==================================================*/

"use strict";

const dashboardSelectors = {
    byId: {},
    byQuery: {},
    filterHandler: null,
    quickActionBound: false
};

/*==================================================
 Global Selectors
==================================================*/


/*==================================================
 DOM Ready
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    // The enterprise bootstrap owns dashboard startup when the page route is set.
    // Keep this fallback for standalone/legacy dashboard markup.
    if (document.body.dataset.page !== "dashboard") {

        DashboardController.initialize();

    }

});


/*==================================================
 Common Helpers
==================================================*/

function showElement(selector) {

    const element = $(selector);

    if (element) {

        element.style.display = "";

    }

}

function hideElement(selector) {

    const element = $(selector);

    if (element) {

        element.style.display = "none";

    }

}

function setText(selector, value) {

    if (!dashboardSelectors.byQuery[selector]) {
        dashboardSelectors.byQuery[selector] = $(selector);
    }

    const element = dashboardSelectors.byQuery[selector];

    if (!element) return;

    element.textContent = value;

}

/*==================================================
 Part 2 : Data Loading & Finance Engine
==================================================*/

/*==================================================
 Load Database
==================================================*/

function loadStoredData() {

    dashboardState.income =
        getIncomeRecords();

    dashboardState.expenses =
        getExpenseRecords();

    dashboardState.budgets =
        getBudgetRecords();

    dashboardState.loans =
        getLoanRecords();

    dashboardState.investments =
        getInvestmentRecords();

    dashboardState.transactions =
    typeof DashboardService === "object" &&
    typeof DashboardService.getRecentTransactions === "function"
        ? DashboardService.getRecentTransactions()
        : typeof getRecentTransactions === "function"
            ? getRecentTransactions()
            : typeof getTransactionRecords === "function"
                ? getTransactionRecords()
                : getTransactions();

}

/*==================================================
 Calculate Financial Summary
==================================================*/

function calculateFinancialSummary(){

    DashboardCards.financialSummary.income =
        getTotalIncome();

    DashboardCards.financialSummary.expense =
        getTotalExpense();

    DashboardCards.financialSummary.balance =
        getTotalBalance();

    DashboardCards.financialSummary.savings =
        getSavings();

    DashboardCards.financialSummary.investment =
        getCurrentInvestmentValue();

    DashboardCards.financialSummary.loans =
        getOutstandingLoans();

    DashboardCards.financialSummary.budget =
        getTotalBudget();

    DashboardCards.financialSummary.cashFlow =
        getCashFlow();

    DashboardCards.financialSummary.netWorth =
        getNetWorth();

}

/*==================================================
 Update Dashboard Cards
==================================================*/

function updateDashboardCards(){

    updateCurrency("#totalBalance",
        DashboardCards.financialSummary.balance);

    updateCurrency("#summaryIncome",
        DashboardCards.financialSummary.income);

    updateCurrency("#summaryExpense",
        DashboardCards.financialSummary.expense);

    updateCurrency("#summarySavings",
        DashboardCards.financialSummary.savings);

    updateCurrency("#netWorthCard",
        DashboardCards.financialSummary.netWorth);

    updateCurrency("#cashCard",
        DashboardCards.financialSummary.balance);

    updateCurrency("#bankBalanceCard",
        DashboardCards.financialSummary.balance);

    updateCurrency("#cashFlowCard",
        DashboardCards.financialSummary.cashFlow);

    updateCurrency("#loanOutstandingCard",
        DashboardCards.financialSummary.loans);

    updateCurrency("#investmentCard",
        DashboardCards.financialSummary.investment);

    const remaining = Math.max(
        DashboardCards.financialSummary.budget -
        DashboardCards.financialSummary.expense,
        0
    );

    updateCurrency("#budgetRemaining",
        remaining);

    updateCurrency("#budgetRemainingCard",
        remaining);

}

/*==================================================
 Total Amount
==================================================*/

function getTotal(list){

    return list.reduce((sum,item)=>{

        return sum +
        Number(item.amount || 0);

    },0);

}

/*==================================================
 Loan Balance
==================================================*/

function getLoanBalance(){

    return dashboardState.loans.reduce(

        (sum,loan)=>{

            return sum +

            Number(

                loan.balance ??

                loan.remaining ??

                loan.amount ??

                0

            );

        },

        0

    );

}

/*==================================================
 Update Currency
==================================================*/

function updateCurrency(selector,value){

    const element=$(selector);

    if(!element) return;

    element.textContent=formatCurrency(value);

}

/*==================================================
 Monthly EMI
==================================================*/

function calculateEMI() {

    updateCurrency(

        "#nextEmiCard",

        getMonthlyEMI()

    );

}

/*==================================================
 Budget Progress
==================================================*/

function updateBudgetProgress(){

    const progress = $("#budgetProgressFill");

    if(!progress) return;

    let percent = 0;

    if(DashboardCards.financialSummary.budget > 0){

        percent =
        DashboardCards.financialSummary.expense /
        DashboardCards.financialSummary.budget * 100;

    }

    percent = Math.min(percent,100);

    progress.style.width = percent + "%";

}

/*==================================================
 Refresh Finance
==================================================*/

function refreshFinance() {

    console.log("✅ NEW refreshFinance() is running");

    if (typeof DashboardCards !== "undefined") {

        DashboardCards.refresh();

    }

}

/*==================================================
 Part 3 : Financial Health Engine
==================================================*/

/*==================================================
 Health Summary
==================================================*/

let healthSummary = {

    score: 100,

    savingsRate: 0,

    expenseRatio: 0,

    debtRatio: 0,

    budgetUsage: 0,

    status: "Excellent"

};

/*==================================================
 Refresh Health
==================================================*/

function refreshHealth() {

    calculateHealthMetrics();

    updateHealthCards();

    updateHealthStatus();

    generateInsights();

}

/*==================================================
 Calculate Health Metrics
==================================================*/

function calculateHealthMetrics() {

    const income = DashboardCards.financialSummary.income;

const expense = DashboardCards.financialSummary.expense;

const loans = DashboardCards.financialSummary.loans;

const budget = DashboardCards.financialSummary.budget;

const savings = DashboardCards.financialSummary.savings;
    healthSummary.savingsRate =

        income > 0 ?

        (savings / income) * 100 : 0;

    healthSummary.expenseRatio =

        income > 0 ?

        (expense / income) * 100 : 0;

    healthSummary.debtRatio =

        income > 0 ?

        (loans / income) * 100 : 0;

    healthSummary.budgetUsage =

        budget > 0 ?

        (expense / budget) * 100 : 0;

    calculateHealthScore();

}

/*==================================================
 Calculate Health Score
==================================================*/

function calculateHealthScore() {

    let score = 100;

    if (healthSummary.expenseRatio > 50)

        score -= (healthSummary.expenseRatio - 50) * 0.4;

    if (healthSummary.debtRatio > 40)

        score -= (healthSummary.debtRatio - 40) * 0.3;

    if (healthSummary.budgetUsage > 100)

        score -= (healthSummary.budgetUsage - 100) * 0.2;

    if (healthSummary.savingsRate >= 30)

        score += 5;

    score = Math.max(0, Math.min(100, Math.round(score)));

    healthSummary.score = score;

}

/*==================================================
 Update Health Cards
==================================================*/

function updateHealthCards() {

    setText(

        "#healthScore",

        healthSummary.score

    );

    setText(

        "#savingRate",

        healthSummary.savingsRate.toFixed(1) + "%"

    );

    setText(

        "#expenseRatio",

        healthSummary.expenseRatio.toFixed(1) + "%"

    );

    setText(

        "#debtRatio",

        healthSummary.debtRatio.toFixed(1) + "%"

    );

}

/*==================================================
 Health Status
==================================================*/

function updateHealthStatus() {

    const status = $("#healthStatus");

    if (!status) return;

    let text = "Excellent";

    if (healthSummary.score < 85)

        text = "Good";

    if (healthSummary.score < 70)

        text = "Average";

    if (healthSummary.score < 50)

        text = "Needs Attention";

    healthSummary.status = text;

    status.textContent = text;

}

/*==================================================
 Smart Financial Insights
==================================================*/

function generateInsights() {

    const insight = $("#financialInsight");

    if (!insight) return;

    const messages = [];

    if (healthSummary.savingsRate >= 30)

        messages.push("✅ Excellent savings habit.");

    if (healthSummary.savingsRate < 20)

        messages.push("⚠ Increase monthly savings.");

    if (healthSummary.expenseRatio > 70)

        messages.push("⚠ Expenses are consuming most of your income.");

    if (healthSummary.debtRatio > 50)

        messages.push("🚨 Loan burden is higher than recommended.");

    if (healthSummary.budgetUsage > 100)

        messages.push("📉 Monthly budget exceeded.");

    if (messages.length === 0)

        messages.push("🎉 Your finances are looking healthy.");

    insight.innerHTML = messages.join("<br>");

}

/*==================================================
 Refresh Complete Dashboard
==================================================*/

function refreshCompleteDashboard() {

    refreshFinance();

    refreshHealth();

    loadRecentTransactions();

}

/*==================================================
 Part 4 : Transactions & Dashboard Events
==================================================*/

/*==================================================
 Recent Transactions
==================================================*/

function loadRecentTransactions() {

    const run = () => {

    const tableBody = $("#transactionTableBody");

    if (!tableBody) return;

    const transactions =

        [...dashboardState.transactions]

        .sort(

            (a,b)=>

            new Date(b.date)-new Date(a.date)

        )

        .slice(0,10);

    const emptyStateRenderer = () => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="6" style="text-align:center;">
                No transactions available.
            </td>
        `;
        return row;
    };

    if (typeof ListRenderer === "object" && typeof ListRenderer.render === "function") {
        ListRenderer.render(tableBody, transactions, createTransactionRow, {
            clear: true,
            emptyStateRenderer
        });
        return;
    }

    if (typeof TableRenderer === "object" && typeof TableRenderer.renderNodeRows === "function") {
        const rows = transactions.map(createTransactionRow);
        TableRenderer.renderNodeRows(tableBody, rows, {
            emptyStateRenderer
        });
        return;
    }

    tableBody.innerHTML = "";

    if (transactions.length === 0) {
        const emptyNode = emptyStateRenderer();
        tableBody.appendChild(emptyNode);
        return;
    }

    transactions.forEach(transaction=>{

        tableBody.appendChild(

            createTransactionRow(transaction)

        );

    });

    };

    if (typeof PerformanceBenchmark === "object" && typeof PerformanceBenchmark.measure === "function") {
        PerformanceBenchmark.measure("dashboard.loadRecentTransactions", run);
        return;
    }

    run();

}

/*==================================================
 Create Row
==================================================*/

function escapeDashboardHtml(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split(String.fromCharCode(34)).join('&quot;')
        .replace(/'/g, '&#39;');

}

function createTransactionRow(transaction){

    transaction = {
        ...transaction,
        date: escapeDashboardHtml(transaction.date || '-'),
        category: escapeDashboardHtml(transaction.category || '-'),
        description: escapeDashboardHtml(transaction.description || '-'),
        type: escapeDashboardHtml(transaction.type || '-'),
        status: escapeDashboardHtml(transaction.status || 'Completed')
    };

    const tr=document.createElement("tr");

    const typeColor=

    transaction.type==="Income"

    ? "#16A34A"

    : "#DC2626";

    tr.innerHTML=

    `

    <td>${transaction.date || "-"}</td>

    <td>${transaction.category || "-"}</td>

    <td>${transaction.description || "-"}</td>

    <td style="color:${typeColor};font-weight:600;">

        ${transaction.type || "-"}

    </td>

    <td>${formatCurrency(transaction.amount)}</td>

    <td>${transaction.status || "Completed"}</td>

    `;

    return tr;

}

/*==================================================
 Search Transactions
==================================================*/

function initializeTransactionSearch(){

    const search=$("#transactionSearch");

    if(!search) return;

    if (!dashboardSelectors.filterHandler) {
        dashboardSelectors.filterHandler = typeof Scheduler === "object" && typeof Scheduler.debounce === "function"
            ? Scheduler.debounce(filterTransactions, 120)
            : filterTransactions;
    }

    search.addEventListener("input", dashboardSelectors.filterHandler);

}

/*==================================================
 Filter Dropdown
==================================================*/

function initializeTransactionFilter(){

    const filter=$("#transactionFilter");

    if(!filter) return;

    if (!dashboardSelectors.filterHandler) {
        dashboardSelectors.filterHandler = typeof Scheduler === "object" && typeof Scheduler.debounce === "function"
            ? Scheduler.debounce(filterTransactions, 120)
            : filterTransactions;
    }

    filter.addEventListener("change", dashboardSelectors.filterHandler);

}

/*==================================================
 Filter Logic
==================================================*/

function filterTransactions(){

    const run = () => {

    const keyword=

    $("#transactionSearch")

    ?.value

    .toLowerCase()

    .trim() || "";

    const type=

    $("#transactionFilter")

    ?.value || "all";

    const tableBody=$("#transactionTableBody");

    if (!tableBody) return;

    tableBody.innerHTML="";

    const filtered = dashboardState.transactions

    .filter(item=>{

        const text=

        `${item.category}

        ${item.description}`

        .toLowerCase();

        const matchText=

        text.includes(keyword);

        const matchType=

        type.toLowerCase()==="all"

        ||

        String(item.type || "").toLowerCase()===
        type.toLowerCase();

        return matchText && matchType;

    })

    ;

    if (typeof ListRenderer === "object" && typeof ListRenderer.render === "function") {
        if (filtered.length > 200 && typeof ListRenderer.renderLazy === "function") {
            ListRenderer.renderLazy(tableBody, filtered, createTransactionRow, {
                clear: true,
                chunkSize: 120
            });
            return;
        }

        ListRenderer.render(tableBody, filtered, createTransactionRow, {
            clear: true
        });
        return;
    }

    filtered.forEach(item=>{

        tableBody.appendChild(

            createTransactionRow(item)

        );

    });

    };

    if (typeof PerformanceBenchmark === "object" && typeof PerformanceBenchmark.measure === "function") {
        PerformanceBenchmark.measure("dashboard.filterTransactions", run);
        return;
    }

    run();

}

/*==================================================
 Quick Actions
==================================================*/

function initializeQuickActions(){

    if (dashboardSelectors.quickActionBound) {
        return;
    }

    const actionGrid = $(".action-grid");
    if (!actionGrid) {
        return;
    }

    if (typeof EventDelegate === "object" && typeof EventDelegate.on === "function") {
        EventDelegate.on(actionGrid, "click", "button", (_event, button) => {
            console.log("Quick Action :", button.innerText.trim());
        });
        dashboardSelectors.quickActionBound = true;
        return;
    }

    $$(".action-grid button")
    .forEach(button=>{
        button.addEventListener(
            "click",
            ()=>{
                console.log("Quick Action :", button.innerText.trim());
            }
        );
    });

    dashboardSelectors.quickActionBound = true;

}

/*==================================================
 Dashboard Events
==================================================*/

function initializeDashboardEvents(){

    initializeTransactionSearch();

    initializeTransactionFilter();

    initializeQuickActions();

}

/*==================================================
 Refresh Dashboard
==================================================*/

function refreshDashboard() {

    DashboardController.refresh();

}

/*==================================================
 Part 5 : Utilities & Production Helpers
==================================================*/

/*==================================================
 Currency Formatter
==================================================*/

function formatCurrency(value) {

    value = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR",

        maximumFractionDigits: 0

    }).format(value);

}

/*==================================================
 Number Formatter
==================================================*/

function formatNumber(value) {

    return new Intl.NumberFormat("en-IN")

    .format(Number(value || 0));

}

/*==================================================
 Percentage Formatter
==================================================*/

function formatPercent(value) {

    return Number(value || 0).toFixed(1) + "%";

}

/*==================================================
 Animate Counter
==================================================*/

function animateCounter(selector, endValue, duration = 800) {

    const element = $(selector);

    if (!element) return;

    let start = 0;

    const increment = endValue / (duration / 16);

    function update() {

        start += increment;

        if (start >= endValue) {

            element.textContent = formatCurrency(endValue);

            return;

        }

        element.textContent = formatCurrency(start);

        requestAnimationFrame(update);

    }

    update();

}

/*==================================================
 Export Backup (JSON)
==================================================*/

function exportJSON() {

    const json = JSON.stringify(

        dashboardState,

        null,

        2

    );

    const blob = new Blob(

        [json],

        {

            type: "application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "SFM_Backup.json";

    a.click();

    URL.revokeObjectURL(url);

}

/*==================================================
 Export CSV
==================================================*/

function exportCSV() {

    if (!dashboardState.transactions.length)

        return;

    let csv =

    "Date,Category,Description,Type,Amount\n";

    dashboardState.transactions.forEach(t => {

        csv +=

`${t.date},${t.category},${t.description},${t.type},${t.amount}\n`;

    });

    const blob = new Blob(

        [csv],

        {

            type:"text/csv"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "Transactions.csv";

    a.click();

    URL.revokeObjectURL(url);

}

/*==================================================
 Print Dashboard
==================================================*/

function printDashboard() {

    window.print();

}

/*==================================================
 Auto Refresh
==================================================*/

function enableAutoRefresh() {

    setInterval(() => {

        refreshDashboard();

    }, 60000);

}

/*==================================================
 Dashboard Statistics
==================================================*/

function getDashboardStatistics() {

    return {

        totalIncome:

        financialSummary.income,

        totalExpense:

        financialSummary.expense,

        totalSavings:

        financialSummary.savings,

        totalLoans:

        financialSummary.loans,

        totalInvestments:

        financialSummary.investment,

        totalTransactions:

        dashboardState.transactions.length

    };

}

/*==================================================
 Error Handler
==================================================*/

window.addEventListener("error", (event) => {

    console.error(

        "Dashboard Error:",

        event.message

    );

});

/*==================================================
 Initialize Utilities
==================================================*/

function initializeUtilities() {

    enableAutoRefresh();

    console.log("Utilities Initialized");

}   // <-- initializeUtilities ends here

/*==================================================
 Refresh Charts
==================================================*/

function refreshCharts() {

    if (typeof Charts !== "undefined") {

        if (typeof Charts.refresh === "function") {

            Charts.refresh();

        }

    }

}
