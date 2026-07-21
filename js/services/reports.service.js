"use strict";

const ReportsService = {
    defaultSummary: {
        income: { totalEntries: 0, totalIncome: 0 },
        expense: { total: 0, count: 0 },
        budget: { totalBudget: 0, totalUsed: 0, remaining: 0, utilization: 0 },
        loans: { totalLoans: 0, totalOutstanding: 0, totalEMI: 0 },
        creditcards: { totalCreditLimit: 0, totalOutstanding: 0, availableCredit: 0, utilization: 0 },
        investments: { totalRecords: 0, invested: 0, current: 0, profit: 0 },
        emi: { monthlyEMI: 0, totalPaid: 0, pendingAmount: 0, totalOutstanding: 0 }
    },

    safeCall(fn, fallback) {
        try {
            const value = typeof fn === "function" ? fn() : fallback;
            return value == null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    },

    getModuleRecords() {
        return {
            income: this.safeCall(() => IncomeService.loadIncomes(), []),
            expense: this.safeCall(() => ExpenseService.loadExpenses(), []),
            budget: this.safeCall(() => BudgetService.loadBudgets(), []),
            loans: this.safeCall(() => LoanService.loadLoans(), []),
            creditcards: this.safeCall(() => CreditCardService.loadCards(), []),
            investments: this.safeCall(() => getInvestmentRecords(), []),
            emi: this.safeCall(() => EMIService.loadEMIs(), [])
        };
    },

    getReportSummary(filtered) {
        const incomeSummary = this.safeCall(
            () => IncomeEngine.getIncomeSummary(filtered.income),
            this.defaultSummary.income
        );

        const expenseSummary = this.safeCall(
            () => ExpenseService.getSummary(filtered.expense),
            this.defaultSummary.expense
        );

        const budgetSummary = this.safeCall(
            () => BudgetService.getSummary(filtered.budget),
            this.defaultSummary.budget
        );

        const loansSummary = this.safeCall(
            () => LoanEngine.getLoanSummary(filtered.loans),
            this.defaultSummary.loans
        );

        const creditSummary = this.safeCall(
            () => CreditCardService.getSummary(filtered.creditcards),
            this.defaultSummary.creditcards
        );

        const investmentSummary = ReportsEngine.getInvestmentSummary(filtered.investments);

        const emiSummary = this.safeCall(
            () => EMIEngine.calculateSummary(filtered.emi),
            this.defaultSummary.emi
        );

        return {
            income: incomeSummary,
            expense: expenseSummary,
            budget: budgetSummary,
            loans: loansSummary,
            creditcards: creditSummary,
            investments: investmentSummary,
            emi: emiSummary
        };
    },

    getReportData(filters) {
        const normalized = ReportsEngine.normalizeFilters(filters);
        const records = this.getModuleRecords();

        const filtered = {
            income: ReportsEngine.filterByDate(records.income, "income", normalized),
            expense: ReportsEngine.filterByDate(records.expense, "expense", normalized),
            budget: ReportsEngine.filterByDate(records.budget, "budget", normalized),
            loans: ReportsEngine.filterByDate(records.loans, "loans", normalized),
            creditcards: ReportsEngine.filterByDate(records.creditcards, "creditcards", normalized),
            investments: ReportsEngine.filterByDate(records.investments, "investments", normalized),
            emi: ReportsEngine.filterByDate(records.emi, "emi", normalized)
        };

        const summaries = this.getReportSummary(filtered);

        return ReportsEngine.buildReport(normalized, filtered, summaries);
    }
};
