// ==========================================
// SFM PRO
// Charts Module
// Release 1.6
// ==========================================

let incomeExpenseChart = null;

let expenseCategoryChart = null;

let budgetChart = null;

document.addEventListener("DOMContentLoaded", () => {

    loadCharts();

});

// ==========================================
// Load All Charts
// ==========================================

function loadCharts(){

    createIncomeExpenseChart();

    createExpenseCategoryChart();

    loadBudgetChart();

    loadEnterpriseCharts();

}

function createManagedChart(existingChart, canvas, config) {
    if (typeof ChartManager === "object" && typeof ChartManager.createOrReplace === "function") {
        return ChartManager.createOrReplace(existingChart, canvas, config);
    }

    if (existingChart) {
        existingChart.destroy();
    }

    return new Chart(canvas, config);
}

// ==========================================
// Income vs Expense Chart
// ==========================================

function createIncomeExpenseChart() {

    const canvas = document.getElementById("incomeExpenseChart");

    if (!canvas) return;

    incomeExpenseChart = createManagedChart(incomeExpenseChart, canvas, {

        type: "bar",

        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                label: "Amount",
                data: [
                    getTotalIncome(),
                    getTotalExpense()
                ],
                backgroundColor: [
                    "#16a34a",
                    "#ef4444"
                ]
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: false,

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }

    });

}

// ==========================================
// Expense Category Pie Chart
// ==========================================

function createExpenseCategoryChart() {

    const canvas = document.getElementById("expenseCategoryChart");

    if (!canvas) return;

    const expense = getExpenseRecords();

    const categoryData = {};

    expense.forEach(item => {

        if (!categoryData[item.category]) {

            categoryData[item.category] = 0;

        }

        categoryData[item.category] += Number(item.amount);

    });

    expenseCategoryChart = createManagedChart(expenseCategoryChart, canvas, {

        type: "pie",

        data: {

            labels: Object.keys(categoryData),

            datasets: [{

                data: Object.values(categoryData),

                backgroundColor: [

                    "#2563eb",
                    "#16a34a",
                    "#ef4444",
                    "#f59e0b",
                    "#8b5cf6",
                    "#06b6d4",
                    "#14b8a6",
                    "#ec4899"

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}// ==========================================
// Budget Chart
// Release 2.1
// ==========================================

function loadBudgetChart() {

    const canvas = document.getElementById("budgetChart");

    if (!canvas) return;

    const budget = getTotalBudget();

    const spent = getBudgetSpent();

    const remaining = Math.max(0, budget - spent);

    budgetChart = createManagedChart(budgetChart, canvas, {

        type: "doughnut",

        data: {

            labels: [

                "Spent",

                "Remaining"

            ],

            datasets: [{

                data: [

                    spent,

                    remaining

                ],

                backgroundColor: [

                    "#ef4444",

                    "#22c55e"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

console.log("--------------------------------");

console.log("Charts Engine Ready");

console.log("--------------------------------");

/*==================================================
 Charts Phase 2
 Enterprise Analytics
==================================================*/

let savingsChart = null;
let investmentChart = null;
let loanChart = null;
let netWorthChart = null;
let chartRefreshHandler = null;

/*==================================================
 Load Enterprise Charts
==================================================*/

function loadEnterpriseCharts(){

    createSavingsTrendChart();

    createInvestmentChart();

    createLoanChart();

    createNetWorthChart();

    createMonthlyTrendChart();

}

/*==================================================
 Savings Trend
==================================================*/

function createSavingsTrendChart(){

    const canvas=document.getElementById("savingsTrendChart");

    if(!canvas) return;

    savingsChart = createManagedChart(savingsChart, canvas, {

        type:"bar",

        data:{

            labels:["Income","Expense","Savings"],

            datasets:[{

                label:"Amount",

                data:[

                    getTotalIncome(),

                    getTotalExpense(),

                    getSavings()

                ]

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}

/*==================================================
 Investment Allocation
==================================================*/

function createInvestmentChart(){

    const canvas=document.getElementById("investmentChart");

    if(!canvas) return;

    const allocation=getPortfolioAllocation();

    investmentChart = createManagedChart(investmentChart, canvas, {

        type:"pie",

        data:{

            labels:Object.keys(allocation),

            datasets:[{

                data:Object.values(allocation)

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}

/*==================================================
 Loan Distribution
==================================================*/

function createLoanChart(){

    const canvas=document.getElementById("loanChart");

    if(!canvas) return;

    const loans=getLoanRecords();

    loanChart = createManagedChart(loanChart, canvas, {

        type:"doughnut",

        data:{

            labels:loans.map(x=>x.lender),

            datasets:[{

                data:loans.map(x=>x.amount)

            }]

        },

        options:{

            responsive:true

        }

    });

}

/*==================================================
 Net Worth
==================================================*/

function createNetWorthChart(){

    const canvas=document.getElementById("netWorthChart");

    if(!canvas) return;

    netWorthChart = createManagedChart(netWorthChart, canvas, {

        type:"bar",

        data:{

            labels:["Assets","Liabilities","Net Worth"],

            datasets:[{

                label:"Financial Position",

                data:[

                    getTotalAssets(),

                    getTotalLiabilities(),

                    getNetWorth()

                ]

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}

console.log("Charts Phase 2 Ready");

/*==================================================
 Charts Phase 3
 Dynamic Dashboard
==================================================*/

function refreshAllCharts(){
    const run = () => {
        createIncomeExpenseChart();

        createExpenseCategoryChart();

        loadBudgetChart();

        loadEnterpriseCharts();
    };

    if (typeof PerformanceBenchmark === "object" && typeof PerformanceBenchmark.measure === "function") {
        PerformanceBenchmark.measure("charts.refreshAllCharts", run);
        return;
    }

    run();

}

/*==================================================
 Auto Refresh
==================================================*/

function enableChartAutoRefresh(){

    if (!chartRefreshHandler) {
        chartRefreshHandler = typeof Scheduler === "object" && typeof Scheduler.debounce === "function"
            ? Scheduler.debounce(refreshAllCharts, 180)
            : refreshAllCharts;
    }

    window.addEventListener("storage", chartRefreshHandler);

}

/*==================================================
 Refresh Dashboard
==================================================*/

function refreshDashboardCharts(){

    refreshAllCharts();

    console.log("Dashboard Charts Updated");

}

/*==================================================
 Resize Charts
==================================================*/

const resizeCharts = () => {

    if(incomeExpenseChart){

        incomeExpenseChart.resize();

    }

    if(expenseCategoryChart){

        expenseCategoryChart.resize();

    }

    if(budgetChart){

        budgetChart.resize();

    }

    if(savingsChart){

        savingsChart.resize();

    }

    if(investmentChart){

        investmentChart.resize();

    }

    if(loanChart){

        loanChart.resize();

    }

    if(netWorthChart){

        netWorthChart.resize();

    }
};

const resizeHandler = typeof Scheduler === "object" && typeof Scheduler.throttle === "function"
    ? Scheduler.throttle(resizeCharts, 120)
    : resizeCharts;

window.addEventListener("resize", resizeHandler);

/*==================================================
 Export Chart
==================================================*/

function exportChart(chart,name){

    if(!chart) return;

    const link=document.createElement("a");

    link.download=name+".png";

    link.href=chart.toBase64Image();

    link.click();

}

/*==================================================
 Export All Charts
==================================================*/

function exportAllCharts(){

    exportChart(incomeExpenseChart,"Income_vs_Expense");

    exportChart(expenseCategoryChart,"Expense_Category");

    exportChart(budgetChart,"Budget");

    exportChart(savingsChart,"Savings");

    exportChart(investmentChart,"Investment");

    exportChart(loanChart,"Loans");

    exportChart(netWorthChart,"NetWorth");

}

/*==================================================
 Global API
==================================================*/

window.Charts={

    refresh:refreshDashboardCharts,

    export:exportAllCharts,

    income:incomeExpenseChart,

    expense:expenseCategoryChart,

    budget:budgetChart

};

enableChartAutoRefresh();

console.log("--------------------------------");

console.log("Charts Phase 3 Ready");

console.log("--------------------------------");


/*==================================================
 Charts Phase 4
 Advanced Analytics
==================================================*/

let monthlyTrendChart = null;

/*==================================================
 Monthly Financial Trend
==================================================*/

function createMonthlyTrendChart(){

    const canvas=document.getElementById("monthlyTrendChart");

    if(!canvas) return;

    if(monthlyTrendChart){

        monthlyTrendChart.destroy();

    }

    const summary=getMonthlySummary();

    monthlyTrendChart=new Chart(canvas,{

        type:"line",

        data:{

            labels:summary.labels,

            datasets:[

                {

                    label:"Income",

                    data:summary.income

                },

                {

                    label:"Expense",

                    data:summary.expense

                },

                {

                    label:"Savings",

                    data:summary.savings

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{

                mode:"index",

                intersect:false

            }

        }

    });

}

/*==================================================
 Cash Flow Trend
==================================================*/

function createCashFlowTrend(){

    return getCashFlow();

}

/*==================================================
 Investment Growth
==================================================*/

function createInvestmentGrowthTrend(){

    return getInvestmentProfit();

}

/*==================================================
 Loan Analytics
==================================================*/

function createLoanAnalytics(){

    return{

        total:getOutstandingLoans(),

        emi:getMonthlyEMI(),

        ratio:getDebtToIncomeRatio()

    };

}

/*==================================================
 Refresh Analytics
==================================================*/

function refreshAnalytics(){

    createMonthlyTrendChart();

}

console.log("--------------------------------");

console.log("Charts Phase 4 Ready");

console.log("--------------------------------");