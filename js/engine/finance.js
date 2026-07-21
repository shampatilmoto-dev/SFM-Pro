"use strict";

/*==================================================
 SFM PRO Enterprise
 Finance Engine v3.5 Stable
 Part 1 : Core Engine
==================================================*/

/*==================================================
 Module Information
==================================================*/

const FINANCE_ENGINE = {

    version: "3.5 Stable",

    name: "SFM Finance Engine",

    currency: "INR",

    locale: "en-IN"

};

/*==================================================
 Initialization
==================================================*/
document.addEventListener("DOMContentLoaded", () => {

    console.log("Expense JS Loaded");

    // New Enterprise Expense Module
    if (typeof ExpenseController !== "undefined") {

        ExpenseController.initialize();

    }

});

/*==================================================
 Initialize Finance Engine
==================================================*/

function initializeFinanceEngine() {

    console.log("--------------------------------");

    console.log(FINANCE_ENGINE.name);

    console.log("Version :", FINANCE_ENGINE.version);

    console.log("--------------------------------");

}

/*==================================================
 Currency Formatter
==================================================*/

function formatCurrency(amount) {

    amount = Number(amount || 0);

    return new Intl.NumberFormat(

        FINANCE_ENGINE.locale,

        {

            style: "currency",

            currency: FINANCE_ENGINE.currency,

            maximumFractionDigits: 2

        }

    ).format(amount);

}

/*==================================================
 Number Formatter
==================================================*/

function formatNumber(number) {

    return new Intl.NumberFormat(

        FINANCE_ENGINE.locale

    ).format(Number(number || 0));

}

/*==================================================
 Percentage Formatter
==================================================*/

function formatPercent(value) {

    return Number(value || 0).toFixed(2) + "%";

}

/*==================================================
 Date Formatter
==================================================*/

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleDateString(

        FINANCE_ENGINE.locale,

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}

/*==================================================
 Current Month
==================================================*/

function getCurrentMonth() {

    return new Date().getMonth();

}

/*==================================================
 Current Year
==================================================*/

function getCurrentYear() {

    return new Date().getFullYear();

}

/*==================================================
 Validation
==================================================*/

function isValidNumber(value) {

    return !isNaN(value) && Number(value) >= 0;

}

function isValidArray(data) {

    return Array.isArray(data);

}

/*==================================================
 Safe Records
==================================================*/

function getModuleRecords(module) {

    if (!moduleExists(module)) {

        return [];

    }

    return getAllRecords(module);

}

/*==================================================
 Generic Total
==================================================*/

function calculateTotal(records, field = "amount") {

    if (!Array.isArray(records)) {

        return 0;

    }

    return records.reduce((sum, item) => {

        return sum + Number(item[field] || 0);

    }, 0);

}

/*==================================================
 Current Month Records
==================================================*/

function getCurrentMonthRecords(module) {

    const records = getModuleRecords(module);

    const month = getCurrentMonth();

    const year = getCurrentYear();

    return records.filter(item => {

        if (!item.date) return false;

        const d = new Date(item.date);

        return d.getMonth() === month &&
               d.getFullYear() === year;

    });

}

/*==================================================
 Current Month Total
==================================================*/

function getCurrentMonthTotal(module) {

    return calculateTotal(

        getCurrentMonthRecords(module)

    );

}

/*==================================================
 Last Updated
==================================================*/

function financeLastUpdated() {

    return new Date().toLocaleString(

        FINANCE_ENGINE.locale

    );

}

/*==================================================
 Finance Status
==================================================*/

function getFinanceStatus() {

    return {

        version: FINANCE_ENGINE.version,

        storageReady:

            typeof getAllRecords === "function",

        modules: {

            income:

                getModuleRecords("income").length,

            expenses:

                getModuleRecords("expenses").length,

            budgets:

                getModuleRecords("budgets").length,

            loans:

                getModuleRecords("loans").length,

            investments:

                getModuleRecords("investments").length

        },

        lastUpdated:

            financeLastUpdated()

    };

}

/*==================================================
 Console
==================================================*/

console.log("Finance Part 1 Ready");


/*==================================================
 Finance Part 2
 Income & Expense Engine
==================================================*/

/*==================================================
 Income
==================================================*/

function getIncomeRecords() {

    return getModuleRecords("income");

}

function getTotalIncome() {

    return calculateTotal(

        getIncomeRecords()

    );

}

function getMonthlyIncome() {

    return getCurrentMonthTotal("income");

}

/*==================================================
 Expense
==================================================*/

function getExpenseRecords() {

    return getModuleRecords("expenses");

}

function getTotalExpense() {

    return calculateTotal(

        getExpenseRecords()

    );

}

/*==================================================
 Compatibility Wrapper
==================================================*/

function getTotalExpenses() {

    return getTotalExpense();

}

function getMonthlyExpense() {

    return getCurrentMonthTotal("expenses");

}

/*==================================================
 Balance
==================================================*/

function getTotalBalance() {

    return getTotalIncome()

        -

        getTotalExpense();

}

function getCashFlow() {

    return getTotalBalance();

}

/*==================================================
 Savings
==================================================*/

function getSavings() {

    return Math.max(

        0,

        getCashFlow()

    );

}

function getSavingsRate() {

    const income = getTotalIncome();

    if (income === 0)

        return 0;

    return (

        getSavings()

        /

        income

    ) * 100;

}

/*==================================================
 Income Category Wise
==================================================*/

function getIncomeByCategory() {

    const result = {};

    getIncomeRecords()

        .forEach(item => {

            const category =

                item.category ||

                "Other";

            result[category] =

                (

                    result[category] || 0

                )

                +

                Number(item.amount || 0);

        });

    return result;

}

/*==================================================
 Expense Category Wise
==================================================*/

function getExpenseByCategory() {

    const result = {};

    getExpenseRecords()

        .forEach(item => {

            const category =

                item.category ||

                "Other";

            result[category] =

                (

                    result[category] || 0

                )

                +

                Number(item.amount || 0);

        });

    return result;

}

/*==================================================
 Recent Income
==================================================*/

function getRecentIncome(limit = 5) {

    return [...getIncomeRecords()]

        .sort((a, b) =>

            b.id - a.id

        )

        .slice(0, limit);

}

/*==================================================
 Recent Expense
==================================================*/

function getRecentExpense(limit = 5) {

    return [...getExpenseRecords()]

        .sort((a, b) =>

            b.id - a.id

        )

        .slice(0, limit);

}

/*==================================================
 Financial Summary
==================================================*/

function getFinancialSummary() {

    return {

        income:

            getTotalIncome(),

        expense:

            getTotalExpense(),

        balance:

            getTotalBalance(),

        savings:

            getSavings(),

        savingsRate:

            getSavingsRate(),

        monthlyIncome:

            getMonthlyIncome(),

        monthlyExpense:

            getMonthlyExpense()

    };

}

console.log(

    "Finance Part 2 Ready"

);

/*==================================================
 Finance Part 3
 Budget Engine
==================================================*/

/*==================================================
 Budget Records
==================================================*/

function getBudgetRecords() {

    return getModuleRecords("budgets");

}

/*==================================================
 Total Budget
==================================================*/

function getTotalBudget() {

    return calculateTotal(

        getBudgetRecords()

    );

}

/*==================================================
 Budget Spent
==================================================*/

function getBudgetSpent() {

    return getTotalExpense();

}

/*==================================================
 Budget Remaining
==================================================*/

function getBudgetRemaining() {

    return Math.max(

        0,

        getTotalBudget()

        -

        getBudgetSpent()

    );

}

/*==================================================
 Budget Usage %
==================================================*/

function getBudgetUsage() {

    const budget = getTotalBudget();

    if (budget <= 0)

        return 0;

    return Math.min(

        100,

        (

            getBudgetSpent()

            /

            budget

        ) * 100

    );

}

/*==================================================
 Budget Status
==================================================*/

function getBudgetStatus() {

    const usage = getBudgetUsage();

    if (usage >= 100)

        return "Over Budget";

    if (usage >= 90)

        return "Critical";

    if (usage >= 75)

        return "Warning";

    if (usage >= 50)

        return "Good";

    return "Excellent";

}

/*==================================================
 Budget Color
==================================================*/

function getBudgetColor() {

    const usage = getBudgetUsage();

    if (usage >= 100)

        return "#ef4444";

    if (usage >= 90)

        return "#f97316";

    if (usage >= 75)

        return "#facc15";

    return "#22c55e";

}

/*==================================================
 Budget Remaining %
==================================================*/

function getBudgetRemainingPercent() {

    const budget = getTotalBudget();

    if (budget <= 0)

        return 0;

    return (

        getBudgetRemaining()

        /

        budget

    ) * 100;

}

/*==================================================
 Overspending
==================================================*/

function isBudgetExceeded() {

    return getBudgetSpent()

        >

        getTotalBudget();

}

/*==================================================
 Budget Summary
==================================================*/

function getBudgetSummary() {

    return {

        totalBudget:

            getTotalBudget(),

        spent:

            getBudgetSpent(),

        remaining:

            getBudgetRemaining(),

        usage:

            getBudgetUsage(),

        remainingPercent:

            getBudgetRemainingPercent(),

        status:

            getBudgetStatus(),

        exceeded:

            isBudgetExceeded(),

        color:

            getBudgetColor()

    };

}

/*==================================================
 Dashboard Budget Widget
==================================================*/

function getDashboardBudget() {

    return {

        total:

            formatCurrency(

                getTotalBudget()

            ),

        spent:

            formatCurrency(

                getBudgetSpent()

            ),

        remaining:

            formatCurrency(

                getBudgetRemaining()

            ),

        usage:

            formatPercent(

                getBudgetUsage()

            ),

        status:

            getBudgetStatus()

    };

}

console.log(

    "Finance Part 3 Ready"

);

/*==================================================
 Finance Part 4
 Loan & Credit Card Engine
==================================================*/

/*==================================================
 Loan Records
==================================================*/

function getLoanRecords() {

    return getModuleRecords("loans");

}

/*==================================================
 Credit Card Records
==================================================*/

function getCreditCardRecords() {

    return getModuleRecords("creditcards");

}

/*==================================================
 Total Loan Amount
==================================================*/

function getTotalLoans() {

    return calculateTotal(

        getLoanRecords(),

        "amount"

    );

}

/*==================================================
 Outstanding Loan
==================================================*/

function getOutstandingLoans() {

    return calculateTotal(

        getLoanRecords(),

        "outstanding"

    );

}

/*==================================================
 Monthly EMI
==================================================*/

function getMonthlyEMI() {

    return calculateTotal(

        getLoanRecords(),

        "emi"

    );

}

/*==================================================
 Total Interest
==================================================*/

function getTotalLoanInterest() {

    return calculateTotal(

        getLoanRecords(),

        "interest"

    );

}

/*==================================================
 Credit Card Outstanding
==================================================*/

function getCreditCardOutstanding() {

    return calculateTotal(

        getCreditCardRecords(),

        "outstanding"

    );

}

/*==================================================
 Credit Limit
==================================================*/

function getCreditLimit() {

    return calculateTotal(

        getCreditCardRecords(),

        "limit"

    );

}

/*==================================================
 Credit Utilization %
==================================================*/

function getCreditUtilization() {

    const limit = getCreditLimit();

    if (limit <= 0)

        return 0;

    return (

        getCreditCardOutstanding()

        /

        limit

    ) * 100;

}

/*==================================================
 Total Liability
==================================================*/

function getTotalLiabilities() {

    return getOutstandingLoans()

        +

        getCreditCardOutstanding();

}

/*==================================================
 Debt To Income Ratio
==================================================*/

function getDebtToIncomeRatio() {

    const income = getTotalIncome();

    if (income <= 0)

        return 0;

    return (

        getMonthlyEMI()

        /

        income

    ) * 100;

}

/*==================================================
 Loan Status
==================================================*/

function getLoanStatus() {

    const ratio = getDebtToIncomeRatio();

    if (ratio >= 60)

        return "Critical";

    if (ratio >= 40)

        return "High";

    if (ratio >= 25)

        return "Moderate";

    return "Healthy";

}

/*==================================================
 Loan Summary
==================================================*/

function getLoanSummary() {

    return {

        totalLoan:

            getTotalLoans(),

        outstanding:

            getOutstandingLoans(),

        monthlyEMI:

            getMonthlyEMI(),

        interest:

            getTotalLoanInterest(),

        debtRatio:

            getDebtToIncomeRatio(),

        status:

            getLoanStatus()

    };

}

/*==================================================
 Credit Card Summary
==================================================*/

function getCreditCardSummary() {

    return {

        limit:

            getCreditLimit(),

        outstanding:

            getCreditCardOutstanding(),

        utilization:

            getCreditUtilization()

    };

}

/*==================================================
 Dashboard Loan Widget
==================================================*/

function getDashboardLoanWidget() {

    return {

        outstanding:

            formatCurrency(

                getOutstandingLoans()

            ),

        emi:

            formatCurrency(

                getMonthlyEMI()

            ),

        liabilities:

            formatCurrency(

                getTotalLiabilities()

            ),

        ratio:

            formatPercent(

                getDebtToIncomeRatio()

            ),

        status:

            getLoanStatus()

    };

}

console.log("Finance Part 4 Ready");

/*==================================================
 Finance Part 5
 Investment & Financial Health Engine
==================================================*/

/*==================================================
 Investment Records
==================================================*/

function getInvestmentRecords() {

    return getModuleRecords("investments");

}

/*==================================================
 Total Investment Amount
==================================================*/

function getTotalInvestment() {

    return calculateTotal(

        getInvestmentRecords(),

        "amount"

    );

}

/*==================================================
 Current Investment Value
==================================================*/

function getCurrentInvestmentValue() {

    return calculateTotal(

        getInvestmentRecords(),

        "current"

    );

}

/*==================================================
 Investment Profit
==================================================*/

function getInvestmentProfit() {

    return (

        getCurrentInvestmentValue()

        -

        getTotalInvestment()

    );

}

/*==================================================
 Investment ROI
==================================================*/

function getInvestmentROI() {

    const invested = getTotalInvestment();

    if (invested <= 0)

        return 0;

    return (

        getInvestmentProfit()

        /

        invested

    ) * 100;

}

/*==================================================
 Cash In Hand
==================================================*/

 function getCashInHand() {
    return 0;
}

/*==================================================
 Bank Balance
==================================================*/

function getBankBalance() {
    return getTotalBalance();
}

/*==================================================
 Total Assets
==================================================*/

function getTotalAssets() {

    return (

        getCashInHand()

        +

        getBankBalance()

        +

        getCurrentInvestmentValue()

    );

}

/*==================================================
 Net Worth
==================================================*/

function getNetWorth() {

    return (

        getTotalAssets()

        -

        getTotalLiabilities()

    );

}

/*==================================================
 Savings Goal
==================================================*/

function getSavingsGoalAmount() {

    const goals = getModuleRecords("goals");

    if (goals.length === 0)

        return 0;

    return Number(

        goals[0].amount || 0

    );

}

/*==================================================
 Savings Goal Progress
==================================================*/

function getSavingsGoalProgress() {

    const goal = getSavingsGoalAmount();

    if (goal <= 0)

        return 0;

    return (

        getSavings()

        /

        goal

    ) * 100;

}

/*==================================================
 Financial Health Score
==================================================*/

function getFinancialHealthScore() {

    let score = 100;

    if (

        getDebtToIncomeRatio()

        > 40

    ) score -= 20;

    if (

        getBudgetUsage()

        > 90

    ) score -= 15;

    if (

        getSavingsRate()

        < 20

    ) score -= 15;

    if (

        getCashFlow()

        < 0

    ) score -= 20;

    if (

        getInvestmentROI()

        < 0

    ) score -= 10;

    return Math.max(

        0,

        Math.round(score)

    );

}

/*==================================================
 Financial Health Status
==================================================*/

function getFinancialHealthStatus() {

    const score =

        getFinancialHealthScore();

    if (score >= 90)

        return "Excellent";

    if (score >= 75)

        return "Good";

    if (score >= 60)

        return "Average";

    if (score >= 40)

        return "Poor";

    return "Critical";

}

/*==================================================
 Financial Insights
==================================================*/

function getFinancialInsights() {

    const insights = [];

    if (

        getSavingsRate()

        < 20

    ) {

        insights.push(

            "Increase your monthly savings."

        );

    }

    if (

        getBudgetUsage()

        > 90

    ) {

        insights.push(

            "Budget utilization is too high."

        );

    }

    if (

        getDebtToIncomeRatio()

        > 40

    ) {

        insights.push(

            "Reduce loan EMI burden."

        );

    }

    if (

        getInvestmentROI()

        > 10

    ) {

        insights.push(

            "Your investments are performing well."

        );

    }

    if (

        insights.length === 0

    ) {

        insights.push(

            "Excellent financial performance."

        );

    }

    return insights;

}

/*==================================================
 Dashboard Financial Widget
==================================================*/

function getDashboardFinancialWidget() {

    return {

        assets:

            formatCurrency(

                getTotalAssets()

            ),

        liabilities:

            formatCurrency(

                getTotalLiabilities()

            ),

        netWorth:

            formatCurrency(

                getNetWorth()

            ),

        investment:

            formatCurrency(

                getCurrentInvestmentValue()

            ),

        roi:

            formatPercent(

                getInvestmentROI()

            ),

        score:

            getFinancialHealthScore(),

        status:

            getFinancialHealthStatus(),

        insights:

            getFinancialInsights()

    };

}

console.log(

    "Finance Part 5 Ready"

);

/*==================================================
 Finance Part 6
 Reports, Dashboard & Final Engine
==================================================*/

/*==================================================
 Recent Transactions
==================================================*/

function getRecentTransactions(limit = 10) {

    const income = getIncomeRecords().map(item => ({
        ...item,
        type: "Income"
    }));

    const expenses = getExpenseRecords().map(item => ({
        ...item,
        type: "Expense"
    }));

    const transactions = [

        ...income,

        ...expenses

    ];

    return transactions

        .sort((a, b) =>

            Number(b.id) - Number(a.id)

        )

        .slice(0, limit);

}

/*==================================================
 Monthly Summary
==================================================*/

function getMonthlySummary() {

    return {

        income:

            getMonthlyIncome(),

        expense:

            getMonthlyExpense(),

        savings:

            getMonthlyIncome()

            -

            getMonthlyExpense(),

        cashFlow:

            getCashFlow()

    };

}

/*==================================================
 Yearly Summary
==================================================*/

function getYearlySummary() {

    return {

        income:

            getTotalIncome(),

        expense:

            getTotalExpense(),

        savings:

            getSavings(),

        investment:

            getCurrentInvestmentValue(),

        liabilities:

            getTotalLiabilities(),

        netWorth:

            getNetWorth()

    };

}

/*==================================================
 Income vs Expense Chart
==================================================*/

function getIncomeExpenseChartData() {

    return {

        labels: [

            "Income",

            "Expense"

        ],

        values: [

            getTotalIncome(),

            getTotalExpense()

        ]

    };

}

/*==================================================
 Budget Chart
==================================================*/

function getBudgetChartData() {

    return {

        labels: [

            "Spent",

            "Remaining"

        ],

        values: [

            getBudgetSpent(),

            getBudgetRemaining()

        ]

    };

}

/*==================================================
 Loan Chart
==================================================*/

function getLoanChartData() {

    return {

        labels: [

            "Outstanding",

            "Paid"

        ],

        values: [

            getOutstandingLoans(),

            Math.max(

                0,

                getTotalLoans()

                -

                getOutstandingLoans()

            )

        ]

    };

}

/*==================================================
 Dashboard Summary
==================================================*/

function getDashboardSummary() {

    return {

        balance:

            getTotalBalance(),

        income:

            getTotalIncome(),

        expense:

            getTotalExpense(),

        savings:

            getSavings(),

        budget:

            getBudgetSummary(),

        loans:

            getLoanSummary(),

        investments:

            getDashboardFinancialWidget(),

        transactions:

            getRecentTransactions(5),

        score:

            getFinancialHealthScore()

    };

}

/*==================================================
 Export Finance Summary
==================================================*/

function exportFinanceSummary() {

    return JSON.stringify(

        {

            dashboard:

                getDashboardSummary(),

            monthly:

                getMonthlySummary(),

            yearly:

                getYearlySummary()

        },

        null,

        2

    );

}

/*==================================================
 Engine Information
==================================================*/

function getFinanceEngineInfo() {

    return {

        engine:

            FINANCE_ENGINE.name,

        version:

            FINANCE_ENGINE.version,

        currency:

            FINANCE_ENGINE.currency,

        locale:

            FINANCE_ENGINE.locale,

        initialized:

            financeLastUpdated()

    };

}

/*==================================================
 Refresh Finance
==================================================*/

function refreshFinanceEngine() {

    return {

        dashboard:

            getDashboardSummary(),

        status:

            "Ready"

    };

}

/*==================================================
 Final Initialization
==================================================*/

window.Finance = {

    getDashboardSummary,

    getFinancialSummary,

    getBudgetSummary,

    getLoanSummary,

    getDashboardFinancialWidget,

    getRecentTransactions,

    getFinanceEngineInfo,

    refreshFinanceEngine

};

console.log("--------------------------------");
console.log("SFM Finance Engine Completed");
console.log("Version :", FINANCE_ENGINE.version);
console.log("Status  : Production Ready");
console.log("--------------------------------");
