"use strict";

/*==================================================
 SFM PRO Enterprise
 Dashboard Cards Module
 Version : v3.5 Stable
==================================================*/

const DashboardCards = {

    financialSummary: {
        income: 0,
        expense: 0,
        balance: 0,
        savings: 0,
        investment: 0,
        loans: 0,
        budget: 0,
        cashFlow: 0,
        netWorth: 0
    },

    /*==================================================
        Refresh Dashboard Cards
    ==================================================*/

    refresh() {
        this.calculateSummary();
        this.updateCards();
        this.updateEMI();
        this.updateBudgetProgress();
    },

    /*==================================================
        Calculate Financial Summary
    ==================================================*/

    calculateSummary() {
        const serviceSummary =
            typeof DashboardService === "object" &&
            typeof DashboardService.getDashboardCardSummary === "function"
                ? DashboardService.getDashboardCardSummary()
                : null;

        if (serviceSummary && typeof serviceSummary === "object") {
            this.financialSummary.income = Number(serviceSummary.income || 0);
            this.financialSummary.expense = Number(serviceSummary.expense || 0);
            this.financialSummary.balance = Number(serviceSummary.balance || 0);
            this.financialSummary.savings = Number(serviceSummary.savings || 0);
            this.financialSummary.investment = Number(serviceSummary.investment || 0);
            this.financialSummary.loans = Number(serviceSummary.loans || 0);
            this.financialSummary.budget = Number(serviceSummary.budget || 0);
            this.financialSummary.cashFlow = Number(serviceSummary.cashFlow || 0);
            this.financialSummary.netWorth = Number(serviceSummary.netWorth || 0);
            return;
        }

        const incomeList =
            typeof IncomeStorage !== "undefined" && typeof IncomeStorage.load === "function"
                ? IncomeStorage.load()
                : [];

        const totalIncome = incomeList.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        this.financialSummary.income = totalIncome;
        this.financialSummary.expense =
            typeof getTotalExpense === "function"
                ? getTotalExpense()
                : 0;

        this.financialSummary.balance =
            this.financialSummary.income -
            this.financialSummary.expense;

        this.financialSummary.savings =
            this.financialSummary.balance;

        this.financialSummary.investment =
            typeof getCurrentInvestmentValue === "function"
                ? getCurrentInvestmentValue()
                : 0;

        this.financialSummary.loans =
            typeof getOutstandingLoans === "function"
                ? getOutstandingLoans()
                : 0;

        this.financialSummary.budget =
            typeof BudgetEngine !== "undefined" &&
            typeof BudgetEngine.getTotalBudget === "function"
                ? BudgetEngine.getTotalBudget()
                : 0;

        this.financialSummary.cashFlow =
            typeof getCashFlow === "function"
                ? getCashFlow()
                : this.financialSummary.balance;

        this.financialSummary.netWorth =
            typeof getNetWorth === "function"
                ? getNetWorth()
                : this.financialSummary.balance +
                  this.financialSummary.investment -
                  this.financialSummary.loans;
    },

    /*==================================================
        Update Dashboard Cards
    ==================================================*/

    updateCards() {
        const data = this.financialSummary;

        const formatValue = (value) => {
            if (typeof formatCurrency === "function") {
                return formatCurrency(value);
            }
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(Number(value || 0));
        };

        const setValue = (id, value) => {
            if (typeof CardRenderer === "object" && typeof CardRenderer.setCurrency === "function") {
                CardRenderer.setCurrency(id, value, formatValue);
                return;
            }

            const element = document.getElementById(id);
            if (!element) return;
            element.textContent = formatValue(value);
        };

        setValue("totalBalance", data.balance);
        setValue("summaryIncome", data.income);
        setValue("summaryExpense", data.expense);
        setValue("summarySavings", data.savings);
        setValue("netWorthCard", data.netWorth);
        setValue("cashCard", data.balance);
        setValue("bankBalanceCard", data.balance);
        setValue("cashFlowCard", data.cashFlow);
        setValue("loanOutstandingCard", data.loans);
        setValue("investmentCard", data.investment);

        const remaining = Math.max(data.budget - data.expense, 0);
        setValue("budgetRemaining", remaining);
        setValue("budgetRemainingCard", remaining);

        // DashboardController owns budgetUsage in the primary runtime path.
        // Keep this only as a backward-compatible fallback for isolated legacy flows.
        if (
            (typeof DashboardController === "undefined" || typeof DashboardController.refresh !== "function") &&
            typeof BudgetEngine !== "undefined" &&
            typeof BudgetEngine.getBudgetUsage === "function"
        ) {
            const usageElement = document.getElementById("budgetUsage");
            if (usageElement) {
                usageElement.textContent = BudgetEngine.getBudgetUsage() + "%";
            }
        }
    },

    /*==================================================
        EMI
    ==================================================*/

    updateEMI() {
        if (typeof calculateEMI === "function") {
            calculateEMI();
        }
    },

    /*==================================================
        Budget Progress
    ==================================================*/

    updateBudgetProgress() {
        if (typeof updateBudgetProgress === "function") {
            updateBudgetProgress();
        }
    }
};

console.log("✔ Dashboard Cards Module Loaded");
