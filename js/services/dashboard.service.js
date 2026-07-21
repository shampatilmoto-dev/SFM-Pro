"use strict";

const DashboardService = {

    getIncomeTotal() {
        if (typeof IncomeService !== "object") {
            return 0;
        }

        const summary = IncomeService.getIncomeSummary();
        return Number(summary?.totalIncome || 0);
    },

    getExpenseTotal() {
        if (typeof ExpenseService !== "object") {
            return 0;
        }

        const expenses = ExpenseService.loadExpenses();
        const summary = ExpenseService.getSummary(expenses);
        return Number(summary?.total || 0);
    },

    getBudgetTotal() {
        if (typeof BudgetService !== "object") {
            return 0;
        }

        const budgets = BudgetService.loadBudgets();
        const summary = BudgetService.getSummary(budgets);
        return Number(summary?.totalBudget || 0);
    },

    getLoanOutstanding() {
        if (typeof LoanService !== "object") {
            return 0;
        }

        const summary = LoanService.getLoanSummary();
        return Number(summary?.totalOutstanding || 0);
    },

    getCreditCardOutstanding() {
        if (typeof CreditCardService !== "object") {
            return 0;
        }

        const cards = CreditCardService.loadCards();
        const summary = CreditCardService.getSummary(cards);
        return Number(summary?.totalOutstanding || 0);
    },

    getInvestmentValue() {
        if (typeof ReportsService !== "object") {
            return 0;
        }

        const report = ReportsService.getReportData({
            reportType: "overall",
            from: "",
            to: ""
        });

        return Number(report?.summary?.totalInvestments || 0);
    },

    getIncomeRecords() {
        if (typeof IncomeService !== "object") {
            return [];
        }

        return IncomeService.loadIncomes() || [];
    },

    getExpenseRecords() {
        if (typeof ExpenseService !== "object") {
            return [];
        }

        return ExpenseService.loadExpenses() || [];
    },

    toSortableTime(value) {
        const timestamp = Date.parse(String(value || ""));
        return Number.isNaN(timestamp) ? 0 : timestamp;
    },

    buildTransactionDedupKey(item) {
        const moduleName = String(item?.sourceModule || "unknown").trim().toLowerCase();
        const sourceId = String(item?.sourceId || item?.id || "").trim();

        if (sourceId !== "") {
            return `${moduleName}:${sourceId}`;
        }

        const date = String(item?.date || "").trim();
        const category = String(item?.category || "").trim().toLowerCase();
        const description = String(item?.description || "").trim().toLowerCase();
        const type = String(item?.type || "").trim().toLowerCase();
        const amount = Number(item?.amount || 0);
        const normalizedAmount = Number.isFinite(amount) ? amount : 0;

        return `${moduleName}:${type}:${date}:${category}:${description}:${normalizedAmount}`;
    },

    mapIncomeToTransaction(income, index = 0) {
        const record = income && typeof income === "object"
            ? income
            : {};

        const date = String(record.date || "").trim();
        const category = String(record.category || "Income").trim() || "Income";
        const source = String(record.source || "").trim();
        const notes = String(record.notes || "").trim();
        const description = source || notes || "Income entry";
        const amount = Number(record.amount);
        const safeAmount = Number.isFinite(amount) ? amount : 0;
        const createdAt = String(record.createdAt || "").trim();
        const updatedAt = String(record.updatedAt || "").trim();
        const sortTime = Math.max(
            this.toSortableTime(date),
            this.toSortableTime(updatedAt),
            this.toSortableTime(createdAt)
        );

        const base = {
            id: record.id || `income-${index}`,
            sourceModule: "income",
            sourceId: record.id || null,
            date: date || "-",
            category,
            description,
            type: "Income",
            amount: safeAmount,
            status: "Completed",
            _sortTime: sortTime
        };

        return {
            ...base,
            _dedupeKey: this.buildTransactionDedupKey(base)
        };
    },

    mapExpenseToTransaction(expense, index = 0) {
        const record = expense && typeof expense === "object"
            ? expense
            : {};

        const date = String(record.date || "").trim();
        const category = String(record.category || "Other").trim() || "Other";
        const title = String(record.title || "").trim();
        const notes = String(record.notes || "").trim();
        const description = title || notes || "Expense entry";
        const amount = Number(record.amount);
        const safeAmount = Number.isFinite(amount) ? amount : 0;
        const createdAt = String(record.createdAt || "").trim();
        const updatedAt = String(record.updatedAt || "").trim();
        const sortTime = Math.max(
            this.toSortableTime(date),
            this.toSortableTime(updatedAt),
            this.toSortableTime(createdAt)
        );

        const base = {
            id: record.id || `expense-${index}`,
            sourceModule: "expenses",
            sourceId: record.id || null,
            date: date || "-",
            category,
            description,
            type: "Expense",
            amount: safeAmount,
            status: "Completed",
            _sortTime: sortTime
        };

        return {
            ...base,
            _dedupeKey: this.buildTransactionDedupKey(base)
        };
    },

    getRecentTransactions(limit = 10) {
        const maxItems = Number.isFinite(Number(limit))
            ? Math.max(0, Math.floor(Number(limit)))
            : 10;

        if (maxItems === 0) {
            return [];
        }

        const incomes = this.getIncomeRecords();
        const expenses = this.getExpenseRecords();

        const transactions = [];

        if (Array.isArray(incomes)) {
            transactions.push(
                ...incomes.map((income, index) => this.mapIncomeToTransaction(income, index))
            );
        }

        if (Array.isArray(expenses)) {
            transactions.push(
                ...expenses.map((expense, index) => this.mapExpenseToTransaction(expense, index))
            );
        }

        const dedupeMap = new Map();

        transactions.forEach(item => {
            const key = String(item?._dedupeKey || "");

            if (!key) {
                return;
            }

            const existing = dedupeMap.get(key);

            if (!existing || Number(item._sortTime || 0) > Number(existing._sortTime || 0)) {
                dedupeMap.set(key, item);
            }
        });

        return Array.from(dedupeMap.values())
            .sort((left, right) => {
                if (right._sortTime !== left._sortTime) {
                    return right._sortTime - left._sortTime;
                }

                return String(right.id || "").localeCompare(String(left.id || ""));
            })
            .slice(0, maxItems)
            .map(item => ({
                id: item.id,
                sourceModule: item.sourceModule,
                sourceId: item.sourceId,
                date: item.date,
                category: item.category,
                description: item.description,
                type: item.type,
                amount: item.amount,
                status: item.status
            }));
    },

    getDashboardCardSummary() {
        const income = this.getIncomeTotal();
        const expense = this.getExpenseTotal();
        const balance = income - expense;
        const savings = balance;
        const investment = this.getInvestmentValue();
        const loans = this.getLoanOutstanding();
        const budget = this.getBudgetTotal();
        const cashFlow = income - expense;
        const netWorth = income + investment - loans;

        return {
            income,
            expense,
            balance,
            savings,
            investment,
            loans,
            budget,
            cashFlow,
            netWorth
        };
    },

    getInvestmentRecords() {
        if (typeof window.getInvestmentRecords === "function") {
            return window.getInvestmentRecords() || [];
        }

        return [];
    },

    getBudgetRecords() {
        if (typeof BudgetService !== "object") {
            return [];
        }

        return BudgetService.loadBudgets() || [];
    },

    getLoanRecords() {
        if (typeof LoanService !== "object") {
            return [];
        }

        return LoanService.loadLoans() || [];
    },

    getCreditCardRecords() {
        if (typeof CreditCardService !== "object") {
            return [];
        }

        return CreditCardService.loadCards() || [];
    },

    getEMIRecords() {
        if (typeof EMIService !== "object") {
            return [];
        }

        return EMIService.loadEMIs() || [];
    },

    getRecurringRecords() {
        if (typeof RecurringManager !== "object") {
            return [];
        }

        return RecurringManager.load() || [];
    },

    getMonthKey(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
    },

    getMonthLabel(key) {
        const [year, month] = String(key || "").split("-");
        if (!year || !month) {
            return "N/A";
        }

        return new Date(Number(year), Number(month) - 1, 1)
            .toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    },

    getIncomeExpenseTrendData() {
        const incomes = this.getIncomeRecords();
        const expenses = this.getExpenseRecords();

        const monthMap = {};

        incomes.forEach(item => {
            const key = this.getMonthKey(item.date);
            if (!key) {
                return;
            }

            monthMap[key] = monthMap[key] || { income: 0, expense: 0 };
            monthMap[key].income += Number(item.amount || 0);
        });

        expenses.forEach(item => {
            const key = this.getMonthKey(item.date);
            if (!key) {
                return;
            }

            monthMap[key] = monthMap[key] || { income: 0, expense: 0 };
            monthMap[key].expense += Number(item.amount || 0);
        });

        const sortedKeys = Object.keys(monthMap).sort();

        return {
            labels: sortedKeys.map(key => this.getMonthLabel(key)),
            income: sortedKeys.map(key => Number(monthMap[key].income || 0)),
            expense: sortedKeys.map(key => Number(monthMap[key].expense || 0))
        };
    },

    getExpenseCategoryData() {
        const expenses = this.getExpenseRecords();
        const categoryMap = {};

        expenses.forEach(item => {
            const category = String(item.category || "Uncategorized");
            categoryMap[category] = Number(categoryMap[category] || 0) + Number(item.amount || 0);
        });

        return {
            labels: Object.keys(categoryMap),
            values: Object.keys(categoryMap).map(key => Number(categoryMap[key] || 0))
        };
    },

    getCashFlowTrendData() {
        const trend = this.getIncomeExpenseTrendData();

        return {
            labels: trend.labels,
            values: trend.income.map((income, index) => Number(income || 0) - Number(trend.expense[index] || 0))
        };
    },

    getInvestmentAllocationData() {
        if (typeof window.getPortfolioAllocation === "function") {
            const allocation = window.getPortfolioAllocation() || {};
            const labels = Object.keys(allocation);

            return {
                labels,
                values: labels.map(label => Number(allocation[label] || 0))
            };
        }

        const investments = this.getInvestmentRecords();
        const allocationMap = {};

        investments.forEach(item => {
            const type = String(item.type || "Other");
            const value = Number(item.current || item.currentValue || item.amount || 0);
            allocationMap[type] = Number(allocationMap[type] || 0) + value;
        });

        const labels = Object.keys(allocationMap);

        return {
            labels,
            values: labels.map(label => Number(allocationMap[label] || 0))
        };
    },

    getBudgetUtilizationChartData() {
        const budget = this.getBudgetTotal();
        const expense = this.getExpenseTotal();
        const utilized = Math.min(expense, budget);
        const remaining = Math.max(budget - utilized, 0);

        return {
            labels: ["Budget Utilization"],
            utilized,
            remaining
        };
    },

    toPercent(value) {
        return Number((Number(value || 0) * 100).toFixed(2));
    },

    getEMIData() {
        if (typeof EMIService !== "object") {
            return { totalOutstanding: 0 };
        }

        const summary = EMIService.getSummary();

        return {
            totalOutstanding: summary.totalOutstanding || 0
        };
    },

    getBudgetData() {

        if (typeof BudgetService !== "object") {
            return {
                remaining: 0,
                usage: 0
            };
        }

        const summary = BudgetService.getSummary(
            BudgetService.loadBudgets()
        );

        return {

            remaining:
                summary.remaining,

            usage:
                summary.utilization

        };

    },

    getFinancialAnalytics() {
        const income = this.getIncomeTotal();
        const expense = this.getExpenseTotal();
        const budget = this.getBudgetTotal();
        const loans = this.getLoanOutstanding();
        const creditOutstanding = this.getCreditCardOutstanding();
        const investments = this.getInvestmentValue();

        const cashFlow = income - expense;
        const netWorth = income + investments - loans - creditOutstanding;

        const savingsRate = income > 0
            ? ((income - expense) / income)
            : 0;

        const budgetUtilization = budget > 0
            ? (expense / budget)
            : 0;

        const loanIncomeRatio = income > 0
            ? (loans / income)
            : 0;

        return {
            netWorth,
            savingsRate: this.toPercent(savingsRate),
            cashFlow,
            budgetUtilization: this.toPercent(budgetUtilization),
            investmentGrowth: investments,
            loanIncomeRatio: this.toPercent(loanIncomeRatio)
        };
    },

    getSmartInsights() {
        const analytics = this.getFinancialAnalytics();
        const income = this.getIncomeTotal();
        const expense = this.getExpenseTotal();
        const creditOutstanding = this.getCreditCardOutstanding();
        const insights = [];

        if (income > 0 && expense > income * 0.8) {
            insights.push({
                type: "critical",
                icon: "fa-solid fa-triangle-exclamation",
                title: "High Expense Warning",
                message: "Expenses are above 80% of income."
            });
        }

        if (analytics.budgetUtilization > 90) {
            insights.push({
                type: "warning",
                icon: "fa-solid fa-wallet",
                title: "Budget Alert",
                message: "Budget utilization is above 90%."
            });
        }

        if (analytics.savingsRate > 20) {
            insights.push({
                type: "positive",
                icon: "fa-solid fa-piggy-bank",
                title: "Positive Savings",
                message: "Savings rate is healthy and above 20%."
            });
        }

        if (analytics.loanIncomeRatio > 40) {
            insights.push({
                type: "critical",
                icon: "fa-solid fa-building-columns",
                title: "High Loan Ratio",
                message: "Loan-to-income ratio is above 40%."
            });
        }

        if (income > 0 && creditOutstanding > income * 0.3) {
            insights.push({
                type: "warning",
                icon: "fa-regular fa-credit-card",
                title: "Credit Card Warning",
                message: "Credit card outstanding exceeds 30% of income."
            });
        }

        if (analytics.investmentGrowth > 0) {
            insights.push({
                type: "positive",
                icon: "fa-solid fa-seedling",
                title: "Investment Progress",
                message: "Investments are showing positive growth."
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: "positive",
                icon: "fa-solid fa-circle-check",
                title: "Healthy State",
                message: "Your finances look healthy."
            });
        }

        return insights;
    },

    getGoalRecords() {
        if (typeof GoalsPlanner !== "object") {
            return [];
        }

        return GoalsPlanner.load() || [];
    },

    getMonthsUntil(dateValue) {
        const target = new Date(`${dateValue}T00:00:00`);

        if (Number.isNaN(target.getTime())) {
            return 0;
        }

        const today = new Date();
        const monthDifference = (target.getFullYear() - today.getFullYear()) * 12 +
            (target.getMonth() - today.getMonth());

        return Math.max(monthDifference + (target.getDate() >= today.getDate() ? 1 : 0), 0);
    },

    getGoalPlan(goal) {
        const targetAmount = Number(goal?.targetAmount || 0);
        const currentSavedAmount = Math.min(Number(goal?.currentSavedAmount || 0), targetAmount);
        const monthlyContribution = Number(goal?.monthlyContribution || 0);
        const remainingAmount = Math.max(targetAmount - currentSavedAmount, 0);
        const progress = targetAmount > 0
            ? this.toPercent(currentSavedAmount / targetAmount)
            : 0;
        const monthsToTarget = monthlyContribution > 0 && remainingAmount > 0
            ? Math.ceil(remainingAmount / monthlyContribution)
            : 0;
        const estimatedCompletionDate = monthsToTarget > 0
            ? new Date(new Date().getFullYear(), new Date().getMonth() + monthsToTarget, 1)
                .toISOString()
                .slice(0, 10)
            : (remainingAmount === 0 ? new Date().toISOString().slice(0, 10) : "");
        const monthsUntilTarget = this.getMonthsUntil(goal?.targetDate);
        const suggestedContribution = remainingAmount > 0 && monthsUntilTarget > 0
            ? Math.ceil(remainingAmount / monthsUntilTarget)
            : remainingAmount;

        return {
            ...goal,
            targetAmount,
            currentSavedAmount,
            monthlyContribution,
            remainingAmount,
            progress,
            estimatedCompletionDate,
            suggestedContribution
        };
    },

    getFinancialGoals() {
        return this.getGoalRecords().map(goal => this.getGoalPlan(goal));
    },

    getDaysUntil(dateValue) {
        const date = new Date(`${dateValue}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    },

    getCurrentMonthTotals() {
        const monthKey = this.getMonthKey(new Date());
        const totalRecords = (records) => records.reduce((total, record) => {
            return this.getMonthKey(record.date) === monthKey
                ? total + Number(record.amount || 0)
                : total;
        }, 0);

        return {
            income: totalRecords(this.getIncomeRecords()),
            expense: totalRecords(this.getExpenseRecords())
        };
    },

    getMonthlySummary() {
        const monthlyIncome = typeof getMonthlyIncome === "function"
            ? Number(getMonthlyIncome() || 0)
            : Number(this.getCurrentMonthTotals().income || 0);

        const monthlyExpense = typeof getMonthlyExpense === "function"
            ? Number(getMonthlyExpense() || 0)
            : Number(this.getCurrentMonthTotals().expense || 0);

        return {
            monthlyIncome,
            monthlyExpense,
            monthlySavings: Math.max(monthlyIncome - monthlyExpense, 0)
        };
    },

    getNotifications() {
        const notifications = [];
        const today = new Date().toISOString().slice(0, 10);
        const addNotification = (notification) => notifications.push(notification);

        if (typeof EMIService === "object") {
            EMIService.loadEMIs().forEach(emi => {
                const daysUntilDue = this.getDaysUntil(emi.dueDate);
                const outstanding = Number(emi.outstandingAmount || 0);

                if (outstanding > 0 && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7) {
                    addNotification({
                        icon: "fa-solid fa-calendar-day",
                        title: "Upcoming EMI",
                        description: `${emi.name || "EMI payment"} is due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}.`,
                        severity: daysUntilDue <= 2 ? "critical" : "warning",
                        date: emi.dueDate,
                        source: "EMI"
                    });
                }
            });
        }

        if (typeof CreditCardService === "object") {
            CreditCardService.loadCards().forEach(card => {
                const daysUntilDue = this.getDaysUntil(card.dueDate);
                const outstanding = Number(card.outstanding || 0);

                if (outstanding > 0 && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7) {
                    addNotification({
                        icon: "fa-regular fa-credit-card",
                        title: "Credit Card Due",
                        description: `${card.cardName || "Credit card payment"} is due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}.`,
                        severity: daysUntilDue <= 2 ? "critical" : "warning",
                        date: card.dueDate,
                        source: "Credit Cards"
                    });
                }
            });
        }

        const analytics = this.getFinancialAnalytics();

        if (analytics.budgetUtilization > 90) {
            addNotification({
                icon: "fa-solid fa-wallet",
                title: "Budget Warning",
                description: `Budget utilization is ${analytics.budgetUtilization.toFixed(2)}%.`,
                severity: "warning",
                date: today,
                source: "Budget"
            });
        }

        this.getFinancialGoals().forEach(goal => {
            const milestones = [100, 75, 50, 25];
            const milestone = milestones.find(value => goal.progress >= value);

            if (milestone) {
                addNotification({
                    icon: "fa-solid fa-bullseye",
                    title: "Goal Milestone",
                    description: `${goal.name || "Financial goal"} has reached ${milestone}% progress.`,
                    severity: "info",
                    date: today,
                    source: "Financial Goals"
                });
            }
        });

        const monthly = this.getCurrentMonthTotals();

        if (monthly.income > 0 && monthly.expense > monthly.income * 0.8) {
            addNotification({
                icon: "fa-solid fa-triangle-exclamation",
                title: "High Expense Warning",
                description: "This month's expenses exceed 80% of income.",
                severity: "critical",
                date: today,
                source: "Expense"
            });
        }

        const savingsRate = monthly.income > 0
            ? this.toPercent((monthly.income - monthly.expense) / monthly.income)
            : 0;

        if (monthly.income > 0 && savingsRate < 10) {
            addNotification({
                icon: "fa-solid fa-piggy-bank",
                title: "Low Savings Warning",
                description: `This month's savings rate is ${savingsRate.toFixed(2)}%.`,
                severity: "warning",
                date: today,
                source: "Income"
            });
        }

        return typeof NotificationCenter === "object"
            ? NotificationCenter.sort(notifications)
            : notifications;
    },

    getCalendarEventStatus(daysRemaining) {
        if (daysRemaining < 0) {
            return "overdue";
        }

        if (daysRemaining === 0) {
            return "today";
        }

        return "upcoming";
    },

    getMonthEndDate() {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0)
            .toISOString()
            .slice(0, 10);
    },

    getFinancialCalendarEvents() {
        const events = [];
        const addEvent = (event) => {
            const daysRemaining = this.getDaysUntil(event.date);

            if (daysRemaining === null) {
                return;
            }

            events.push({
                ...event,
                daysRemaining,
                status: this.getCalendarEventStatus(daysRemaining)
            });
        };

        if (typeof EMIService === "object") {
            EMIService.loadEMIs().forEach(emi => {
                if (Number(emi.outstandingAmount || 0) > 0 && emi.dueDate) {
                    addEvent({
                        date: emi.dueDate,
                        title: `${emi.name || "EMI"} due`,
                        source: "EMI"
                    });
                }
            });
        }

        if (typeof CreditCardService === "object") {
            CreditCardService.loadCards().forEach(card => {
                if (Number(card.outstanding || 0) > 0 && card.dueDate) {
                    addEvent({
                        date: card.dueDate,
                        title: `${card.cardName || "Credit card"} payment due`,
                        source: "Credit Cards"
                    });
                }
            });
        }

        this.getFinancialGoals().forEach(goal => {
            if (goal.targetDate && Number(goal.remainingAmount || 0) > 0) {
                addEvent({
                    date: goal.targetDate,
                    title: `${goal.name || "Financial goal"} target date`,
                    source: "Financial Goals"
                });
            }
        });

        if (this.getBudgetTotal() > 0) {
            addEvent({
                date: this.getMonthEndDate(),
                title: "Budget month-end",
                source: "Budget"
            });
        }

        this.getInvestmentRecords().forEach(investment => {
            const maturityDate = investment.maturityDate || investment.maturity;

            if (maturityDate) {
                addEvent({
                    date: maturityDate,
                    title: `${investment.name || "Investment"} maturity`,
                    source: "Investments"
                });
            }
        });

        return typeof CalendarCenter === "object"
            ? CalendarCenter.sort(events)
            : events.sort((left, right) => new Date(left.date) - new Date(right.date));
    },

    getFinancialCalendarSummary(events) {
        const monthKey = this.getMonthKey(new Date());
        const list = Array.isArray(events) ? events : [];

        return list.reduce((summary, event) => {
            if (this.getMonthKey(event.date) === monthKey) {
                summary.monthEvents += 1;
            }

            if (event.status === "today") {
                summary.today += 1;
            }

            if (event.status === "upcoming") {
                summary.upcoming += 1;
            }

            if (event.status === "overdue") {
                summary.overdue += 1;
            }

            return summary;
        }, {
            monthEvents: 0,
            today: 0,
            upcoming: 0,
            overdue: 0
        });
    },

    formatDateValue(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    },

    calculateRecurringNextRunDate(startDate, frequency) {
        const start = new Date(`${startDate}T00:00:00`);

        if (Number.isNaN(start.getTime())) {
            return "";
        }

        const next = new Date(start);

        if (frequency === "Daily") {
            next.setDate(next.getDate() + 1);
        } else if (frequency === "Weekly") {
            next.setDate(next.getDate() + 7);
        } else if (frequency === "Monthly") {
            const targetMonth = next.getMonth() + 1;
            const lastDay = new Date(next.getFullYear(), targetMonth + 1, 0).getDate();
            next.setDate(Math.min(next.getDate(), lastDay));
            next.setMonth(targetMonth);
        } else if (frequency === "Yearly") {
            const targetYear = next.getFullYear() + 1;
            const lastDay = new Date(targetYear, next.getMonth() + 1, 0).getDate();
            next.setDate(Math.min(next.getDate(), lastDay));
            next.setFullYear(targetYear);
        } else {
            return "";
        }

        return this.formatDateValue(next);
    },

    getRecurringTemplates() {
        if (typeof RecurringManager !== "object") {
            return [];
        }

        return RecurringManager.load().map(template => {
            const daysRemaining = this.getDaysUntil(template.nextRunDate);
            const scheduleStatus = daysRemaining === null
                ? "upcoming"
                : this.getCalendarEventStatus(daysRemaining);

            return {
                ...template,
                daysRemaining,
                scheduleStatus
            };
        }).sort((left, right) => new Date(left.nextRunDate) - new Date(right.nextRunDate));
    },

    getRecurringSummary(templates) {
        return (Array.isArray(templates) ? templates : []).reduce((summary, template) => {
            summary.total += 1;

            if (template.status === "Paused") {
                summary.paused += 1;
            } else {
                summary.active += 1;
            }

            if (template.status === "Active" && template.scheduleStatus === "overdue") {
                summary.overdue += 1;
            }

            return summary;
        }, {
            total: 0,
            active: 0,
            paused: 0,
            overdue: 0
        });
    },

    getBackupSnapshot() {
        return {
            version: "v3.5",
            generatedAt: new Date().toISOString(),
            data: {
                income: this.getIncomeRecords(),
                expenses: this.getExpenseRecords(),
                budgets: this.getBudgetRecords(),
                loans: this.getLoanRecords(),
                creditcards: this.getCreditCardRecords(),
                investments: this.getInvestmentRecords(),
                emi: this.getEMIRecords(),
                goals: this.getGoalRecords(),
                recurring: this.getRecurringRecords()
            }
        };
    },

    getBackupSummary(data) {
        const source = data || {};
        const safeLength = (value) => Array.isArray(value) ? value.length : 0;

        return {
            income: safeLength(source.income),
            expenses: safeLength(source.expenses),
            budgets: safeLength(source.budgets),
            loans: safeLength(source.loans),
            creditcards: safeLength(source.creditcards),
            investments: safeLength(source.investments),
            emi: safeLength(source.emi),
            goals: safeLength(source.goals),
            recurring: safeLength(source.recurring)
        };
    },

    validateBackupPayload(payload) {
        const supportedVersions = ['v3.3', 'v3.4', 'v3.5'];
        const requiredModules = ['income', 'expenses', 'budgets', 'loans', 'creditcards', 'investments', 'emi', 'goals', 'recurring'];
        const allowedPayloadKeys = new Set(['version', 'generatedAt', 'data']);
        const allowedDataKeys = new Set(requiredModules);
        const dateFields = ['date', 'dueDate', 'startDate', 'targetDate', 'nextRunDate', 'billingDate'];
        const timestampFields = ['createdAt', 'updatedAt'];
        const isPlainObject = value => {
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                return false;
            }

            return Object.prototype.toString.call(value) === '[object Object]';
        };
        const hasUnsafeKeys = value => {
            if (Array.isArray(value)) {
                return value.some(item => hasUnsafeKeys(item));
            }

            if (!isPlainObject(value)) {
                return false;
            }

            return Object.keys(value).some(key => {
                if (['__proto__', 'prototype', 'constructor'].includes(key)) {
                    return true;
                }

                const child = value[key];
                return (Array.isArray(child) || isPlainObject(child)) && hasUnsafeKeys(child);
            });
        };
        const isText = value => typeof value === 'string' && value.trim() !== '';
        const isFiniteNumber = (value, minimum) => {
            const number = Number(value);
            return Number.isFinite(number) && number >= minimum;
        };
        const isValidDate = value => {
            if (!isText(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return false;
            }

            const [year, month, day] = value.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, day));
            return date.getUTCFullYear() === year &&
                date.getUTCMonth() === month - 1 &&
                date.getUTCDate() === day;
        };
        const isValidTimestamp = value => isText(value) &&
            /^\d{4}-\d{2}-\d{2}T/.test(value) &&
            !Number.isNaN(Date.parse(value));
        const moduleError = (module, index, message) => ({
            valid: false,
            error: 'Backup file has an invalid ' + module + ' record at position ' + (index + 1) + ': ' + message
        });
        const validateRecord = (module, record, index) => {
            if (!isPlainObject(record) || hasUnsafeKeys(record)) {
                return moduleError(module, index, 'object data is unsafe or malformed.');
            }

            const invalidValue = Object.values(record).some(value =>
                value === null ||
                typeof value === 'function' ||
                typeof value === 'symbol' ||
                (typeof value === 'number' && !Number.isFinite(value)) ||
                Array.isArray(value) ||
                (typeof value === 'object' && value !== null)
            );

            if (invalidValue) {
                return moduleError(module, index, 'values must be safe primitive values.');
            }

            for (const field of dateFields) {
                if (record[field] != null && !isValidDate(record[field])) {
                    return moduleError(module, index, field + ' is not a valid calendar date.');
                }
            }

            for (const field of timestampFields) {
                if (record[field] != null && !isValidTimestamp(record[field])) {
                    return moduleError(module, index, field + ' is not a valid timestamp.');
                }
            }

            if (module === 'income' &&
                (!isText(record.source) || !isText(record.category) || !isValidDate(record.date) || !isFiniteNumber(record.amount, Number.EPSILON))) {
                return moduleError(module, index, 'source, category, date, and a positive amount are required.');
            }

            if (module === 'expenses' &&
                (!isText(record.title) || !isText(record.category) || !isValidDate(record.date) || !isFiniteNumber(record.amount, Number.EPSILON))) {
                return moduleError(module, index, 'title, category, date, and a positive amount are required.');
            }

            if (module === 'budgets' &&
                (!isText(record.category) || !isFiniteNumber(record.amount, Number.EPSILON) ||
                    !/^(0?[1-9]|1[0-2])$/.test(String(record.month || '')) ||
                    !Number.isInteger(Number(record.year)) || Number(record.year) < 1900 || Number(record.year) > 3000)) {
                return moduleError(module, index, 'category, positive amount, month, and a valid year are required.');
            }

            if (module === 'loans' &&
                (!isText(record.loanName) || !isText(record.bank) || !isFiniteNumber(record.amount, Number.EPSILON) ||
                    !isFiniteNumber(record.interest, Number.EPSILON) || !isFiniteNumber(record.tenure, Number.EPSILON) ||
                    !isValidDate(record.startDate))) {
                return moduleError(module, index, 'name, bank, positive amounts, and start date are required.');
            }

            if (module === 'creditcards' &&
                (!isText(record.bankName) || !isText(record.cardName) || !isText(record.cardType) ||
                    !isFiniteNumber(record.limit, Number.EPSILON) || !isFiniteNumber(record.outstanding, 0) ||
                    !isValidDate(record.billingDate) || !isValidDate(record.dueDate))) {
                return moduleError(module, index, 'bank, card, limits, and billing dates are required.');
            }

            if (module === 'emi' &&
                (!isText(record.name) || !isFiniteNumber(record.monthlyAmount, Number.EPSILON) ||
                    !isFiniteNumber(record.totalAmount, Number.EPSILON) || !isFiniteNumber(record.paidAmount, 0) ||
                    Number(record.paidAmount) > Number(record.totalAmount) || !isValidDate(record.dueDate))) {
                return moduleError(module, index, 'name, amounts, and a valid due date are required.');
            }

            if (module === 'investments') {
                const investedAmount = record.investedAmount != null ? record.investedAmount : record.amount;
                const currentValue = record.currentValue != null ? record.currentValue : record.current;

                if (!isText(record.name) || !isFiniteNumber(investedAmount, Number.EPSILON) ||
                    !isFiniteNumber(currentValue, 0) || !isValidDate(record.date)) {
                    return moduleError(module, index, 'name, values, and investment date are required.');
                }
            }

            if (module === 'goals' &&
                (!isText(record.name) || !isFiniteNumber(record.targetAmount, Number.EPSILON) ||
                    !isFiniteNumber(record.currentSavedAmount, 0) || !isFiniteNumber(record.monthlyContribution, 0) ||
                    !isValidDate(record.targetDate))) {
                return moduleError(module, index, 'name, amounts, and target date are required.');
            }

            if (module === 'recurring' &&
                (!isText(record.name) || !isFiniteNumber(record.amount, Number.EPSILON) ||
                    !['Income', 'Expense', 'EMI Reminder', 'Credit Card Reminder', 'Savings Goal Contribution'].includes(record.type) ||
                    !['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(record.frequency) ||
                    !isValidDate(record.startDate) || !isValidDate(record.nextRunDate) ||
                    !['Active', 'Paused'].includes(record.status))) {
                return moduleError(module, index, 'template values, dates, and status are invalid.');
            }

            return { valid: true };
        };

        if (!isPlainObject(payload) || hasUnsafeKeys(payload)) {
            return { valid: false, error: 'Backup file is empty, unsafe, or unreadable.' };
        }

        if (!supportedVersions.includes(payload.version)) {
            return {
                valid: false,
                error: 'Unsupported backup version: ' + String(payload.version || 'unknown') + '. Supported versions are v3.3, v3.4, and v3.5.'
            };
        }

        if (!isValidTimestamp(payload.generatedAt)) {
            return { valid: false, error: 'Backup file has an invalid or missing generated timestamp.' };
        }

        if (Object.keys(payload).some(key => !allowedPayloadKeys.has(key))) {
            return { valid: false, error: 'Backup file contains unsupported top-level data.' };
        }

        if (!isPlainObject(payload.data) || hasUnsafeKeys(payload.data)) {
            return { valid: false, error: 'Backup file is missing safe data records.' };
        }

        if (Object.keys(payload.data).some(key => !allowedDataKeys.has(key))) {
            return { valid: false, error: 'Backup file contains unsupported module data.' };
        }

        for (const module of requiredModules) {
            const records = payload.data[module];

            if (module === 'recurring' && records == null && payload.version !== 'v3.5') {
                continue;
            }

            if (!Array.isArray(records)) {
                return { valid: false, error: 'Backup file has invalid or missing ' + module + ' records.' };
            }

            if (records.length > 50000) {
                return { valid: false, error: 'Backup file exceeds the safe record limit for ' + module + '.' };
            }

            const ids = new Set();

            for (let index = 0; index < records.length; index += 1) {
                const result = validateRecord(module, records[index], index);

                if (!result.valid) {
                    return result;
                }

                const id = records[index].id;

                if (id != null && !/^[A-Za-z0-9_-]{1,128}$/.test(String(id))) {
                    return moduleError(module, index, 'record identifiers contain unsupported characters.');
                }

                if (id != null && String(id).trim() !== '') {
                    const normalizedId = String(id);

                    if (ids.has(normalizedId)) {
                        return moduleError(module, index, 'duplicate record identifiers are not allowed.');
                    }

                    ids.add(normalizedId);
                }
            }
        }

        return { valid: true, version: payload.version };
    },

    validateBackupData(payload) {
        return this.validateBackupPayload(payload);
    }

};

console.log("✔ Dashboard Service Loaded");
