"use strict";

/*==================================================
 SFM PRO Enterprise
 Dashboard Controller
 Version : v3.5 Stable
==================================================*/

const DashboardController = {

    goalsInitialized: false,

    recurringInitialized: false,

    backupInitialized: false,

    pendingBackupPayload: null,

    trendCharts: {
        incomeExpense: null,
        expenseCategory: null,
        cashFlow: null,
        investmentAllocation: null,
        budgetUtilization: null
    },

    initialize() {

        console.log("🚀 Dashboard Controller Started");

        initializeDashboard();
        this.initializeGoalsPlanner();
        this.initializeRecurringManager();
        this.initializeBackupManager();

        this.refresh();

    },

    refresh() {

        // Load latest finance data
        loadStoredData();

        // Refresh Dashboard Cards
        DashboardCards.refresh();

        // ==========================
        // Budget Dashboard Cards
        // ==========================

        const budget =
    DashboardService.getBudgetData();

const remaining =
    budget.remaining;

const usage =
    budget.usage;

const remainingCard =
    document.getElementById("budgetRemaining");

if (remainingCard) {

    remainingCard.textContent =
        "₹" + remaining;

}

const budgetRemainingCard =
    document.getElementById("budgetRemainingCard");

if (budgetRemainingCard) {

    budgetRemainingCard.textContent =
        "₹" + remaining;

}

const usageCard =
    document.getElementById("budgetUsage");

if (usageCard) {

    usageCard.textContent =
        usage + "%";

}

        const monthlySummary = typeof DashboardService.getMonthlySummary === "function"
            ? DashboardService.getMonthlySummary()
            : {
                monthlyIncome: 0,
                monthlyExpense: 0,
                monthlySavings: 0
            };

        const monthlyIncomeCard = document.getElementById("monthlyIncome");
        const monthlyExpenseCard = document.getElementById("monthlyExpense");
        const monthlySavingsCard = document.getElementById("monthlySavings");

        const monthlyCurrency = (value) => {
            const amount = Number(value || 0);

            if (typeof formatCurrency === "function") {
                return formatCurrency(amount);
            }

            return "₹" + amount;
        };

        if (monthlyIncomeCard) {
            monthlyIncomeCard.textContent = monthlyCurrency(monthlySummary.monthlyIncome);
        }

        if (monthlyExpenseCard) {
            monthlyExpenseCard.textContent = monthlyCurrency(monthlySummary.monthlyExpense);
        }

        if (monthlySavingsCard) {
            monthlySavingsCard.textContent = monthlyCurrency(monthlySummary.monthlySavings);
        }

        const emi =
            DashboardService.getEMIData();

        const emiOutstandingCard =
            document.getElementById("emiOutstandingCard");

        if (emiOutstandingCard) {

            emiOutstandingCard.textContent =
                "₹" + emi.totalOutstanding;

        }

        const analytics = DashboardService.getFinancialAnalytics();

        const setCurrency = (id, value) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            const amount = Number(value || 0);

            if (typeof formatCurrency === "function") {
                element.textContent = formatCurrency(amount);
                return;
            }

            element.textContent = "₹" + amount;
        };

        const setPercent = (id, value) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            element.textContent = Number(value || 0).toFixed(2) + "%";
        };

        setCurrency("analyticsNetWorth", analytics.netWorth);
        setPercent("analyticsSavingsRate", analytics.savingsRate);
        setCurrency("analyticsCashFlow", analytics.cashFlow);
        setPercent("analyticsBudgetUtilization", analytics.budgetUtilization);
        setCurrency("analyticsInvestmentGrowth", analytics.investmentGrowth);
        setPercent("analyticsLoanIncomeRatio", analytics.loanIncomeRatio);

        this.renderFinancialTrends();

        // Financial Health
        refreshHealth();

        // Recent Transactions
        loadRecentTransactions();

        this.renderSmartInsights();
        this.renderFinancialGoals();
        this.renderNotifications();
        this.renderFinancialCalendar();
        this.renderRecurringTemplates();
        this.renderBackupSummary();

        console.log("✔ Dashboard Refreshed");

    }

    ,

    destroyTrendCharts() {
        Object.keys(this.trendCharts).forEach(key => {
            const chart = this.trendCharts[key];

            if (chart && typeof chart.destroy === "function") {
                chart.destroy();
            }

            this.trendCharts[key] = null;
        });
    },

    toggleEmptyState(canvasId, emptyId, hasData) {
        const canvas = document.getElementById(canvasId);
        const emptyState = document.getElementById(emptyId);

        if (canvas) {
            canvas.style.display = hasData ? "block" : "none";
        }

        if (emptyState) {
            emptyState.style.display = hasData ? "none" : "block";
        }
    },

    createTrendChart(chartKey, canvasId, emptyId, type, data, options) {
        const canvas = document.getElementById(canvasId);

        if (!canvas || typeof Chart !== "function") {
            this.toggleEmptyState(canvasId, emptyId, false);
            return;
        }

        const datasets = Array.isArray(data?.datasets) ? data.datasets : [];
        const hasData = datasets.some(set =>
            Array.isArray(set.data) && set.data.some(value => Number(value || 0) !== 0)
        );

        if (!hasData) {
            this.toggleEmptyState(canvasId, emptyId, false);
            return;
        }

        this.toggleEmptyState(canvasId, emptyId, true);

        const context = canvas.getContext("2d");
        this.trendCharts[chartKey] = new Chart(context, {
            type,
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                ...options
            }
        });
    },

    renderFinancialTrends() {
        this.destroyTrendCharts();

        const trend = DashboardService.getIncomeExpenseTrendData();
        this.createTrendChart(
            "incomeExpense",
            "trendsIncomeExpenseChart",
            "trendsIncomeExpenseEmpty",
            "line",
            {
                labels: trend.labels,
                datasets: [
                    {
                        label: "Income",
                        data: trend.income,
                        borderColor: "#22c55e",
                        backgroundColor: "rgba(34, 197, 94, 0.18)",
                        fill: true,
                        tension: 0.35
                    },
                    {
                        label: "Expense",
                        data: trend.expense,
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.12)",
                        fill: true,
                        tension: 0.35
                    }
                ]
            },
            {
                scales: { y: { beginAtZero: true } }
            }
        );

        const expenseByCategory = DashboardService.getExpenseCategoryData();
        this.createTrendChart(
            "expenseCategory",
            "trendsExpenseCategoryChart",
            "trendsExpenseCategoryEmpty",
            "doughnut",
            {
                labels: expenseByCategory.labels,
                datasets: [
                    {
                        data: expenseByCategory.values,
                        backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#14b8a6", "#ec4899"]
                    }
                ]
            },
            {
                plugins: { legend: { position: "bottom" } }
            }
        );

        const cashFlow = DashboardService.getCashFlowTrendData();
        this.createTrendChart(
            "cashFlow",
            "trendsCashFlowChart",
            "trendsCashFlowEmpty",
            "bar",
            {
                labels: cashFlow.labels,
                datasets: [
                    {
                        label: "Cash Flow",
                        data: cashFlow.values,
                        backgroundColor: cashFlow.values.map(value => Number(value || 0) >= 0 ? "#16a34a" : "#dc2626")
                    }
                ]
            },
            {
                scales: { y: { beginAtZero: true } }
            }
        );

        const investmentAllocation = DashboardService.getInvestmentAllocationData();
        this.createTrendChart(
            "investmentAllocation",
            "trendsInvestmentAllocationChart",
            "trendsInvestmentAllocationEmpty",
            "pie",
            {
                labels: investmentAllocation.labels,
                datasets: [
                    {
                        data: investmentAllocation.values,
                        backgroundColor: ["#06b6d4", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"]
                    }
                ]
            },
            {
                plugins: { legend: { position: "bottom" } }
            }
        );

        const budgetData = DashboardService.getBudgetUtilizationChartData();
        this.createTrendChart(
            "budgetUtilization",
            "trendsBudgetUtilizationChart",
            "trendsBudgetUtilizationEmpty",
            "bar",
            {
                labels: budgetData.labels,
                datasets: [
                    {
                        label: "Utilized",
                        data: [budgetData.utilized],
                        backgroundColor: "#f97316"
                    },
                    {
                        label: "Remaining",
                        data: [budgetData.remaining],
                        backgroundColor: "#22c55e"
                    }
                ]
            },
            {
                indexAxis: "y",
                scales: {
                    x: {
                        beginAtZero: true,
                        stacked: true
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        );
    },

    renderSmartInsights() {
        const container = document.getElementById("financialInsight");

        if (!container) {
            return;
        }

        const insights = DashboardService.getSmartInsights();

        const styles = {
            positive: {
                border: "#16a34a",
                bg: "#f0fdf4",
                color: "#14532d"
            },
            warning: {
                border: "#f59e0b",
                bg: "#fffbeb",
                color: "#78350f"
            },
            critical: {
                border: "#dc2626",
                bg: "#fef2f2",
                color: "#7f1d1d"
            }
        };

        container.innerHTML = insights.map(item => {
            const tone = styles[item.type] || styles.positive;

            return `
                <div class="kpi-card" style="border-left: 4px solid ${tone.border}; background: ${tone.bg};">
                    <i class="${item.icon}" style="color:${tone.border};"></i>
                    <span style="color:${tone.color}; font-weight:600;">${this.escapeText(item.title)}</span>
                    <h2 style="font-size:1rem; line-height:1.4; color:${tone.color};">${this.escapeText(item.message)}</h2>
                </div>
            `;
        }).join("");
    },

    escapeText(value) {
        const node = document.createElement("div");
        node.textContent = String(value || "");
        return node.innerHTML;
    },

    initializeGoalsPlanner() {
        if (this.goalsInitialized) {
            return;
        }

        const form = document.getElementById("financialGoalForm");
        const list = document.getElementById("financialGoalsList");
        const cancelButton = document.getElementById("cancelFinancialGoalEditBtn");

        if (form) {
            form.addEventListener("submit", event => {
                event.preventDefault();
                this.saveFinancialGoal();
            });
        }

        if (list) {
            list.addEventListener("click", event => {
                const button = event.target.closest("button[data-goal-action]");

                if (!button) {
                    return;
                }

                if (button.dataset.goalAction === "edit") {
                    this.editFinancialGoal(button.dataset.goalId);
                }

                if (button.dataset.goalAction === "delete") {
                    this.deleteFinancialGoal(button.dataset.goalId);
                }
            });
        }

        if (cancelButton) {
            cancelButton.addEventListener("click", () => this.resetFinancialGoalForm());
        }

        this.goalsInitialized = true;
    },

    getGoalFormData() {
        return {
            id: document.getElementById("financialGoalId")?.value || "",
            type: document.getElementById("financialGoalType")?.value || "Custom",
            name: document.getElementById("financialGoalName")?.value || "",
            targetAmount: document.getElementById("financialGoalTarget")?.value || 0,
            currentSavedAmount: document.getElementById("financialGoalSaved")?.value || 0,
            monthlyContribution: document.getElementById("financialGoalContribution")?.value || 0,
            targetDate: document.getElementById("financialGoalDate")?.value || ""
        };
    },

    saveFinancialGoal() {
        if (typeof GoalsPlanner !== "object") {
            return;
        }

        const goal = this.getGoalFormData();
        const result = GoalsPlanner.save(goal.id, goal);

        if (result.error) {
            window.alert(result.error);
            return;
        }

        this.resetFinancialGoalForm();
        this.refresh();
    },

    editFinancialGoal(id) {
        if (typeof GoalsPlanner !== "object") {
            return;
        }

        const goal = GoalsPlanner.getById(id);

        if (!goal) {
            return;
        }

        document.getElementById("financialGoalId").value = goal.id;
        document.getElementById("financialGoalType").value = goal.type || "Custom";
        document.getElementById("financialGoalName").value = goal.name || "";
        document.getElementById("financialGoalTarget").value = goal.targetAmount || "";
        document.getElementById("financialGoalSaved").value = goal.currentSavedAmount || 0;
        document.getElementById("financialGoalContribution").value = goal.monthlyContribution || 0;
        document.getElementById("financialGoalDate").value = goal.targetDate || "";

        const saveButton = document.getElementById("saveFinancialGoalBtn");
        const cancelButton = document.getElementById("cancelFinancialGoalEditBtn");

        if (saveButton) {
            saveButton.textContent = "Update Goal";
        }

        if (cancelButton) {
            cancelButton.style.display = "inline-flex";
        }

        document.getElementById("financialGoalName")?.focus();
    },

    deleteFinancialGoal(id) {
        if (typeof GoalsPlanner !== "object" || !window.confirm("Delete this financial goal?")) {
            return;
        }

        const result = GoalsPlanner.remove(id);

        if (result.error) {
            window.alert(result.error);
            return;
        }

        this.resetFinancialGoalForm();
        this.refresh();
    },

    resetFinancialGoalForm() {
        const form = document.getElementById("financialGoalForm");
        const saveButton = document.getElementById("saveFinancialGoalBtn");
        const cancelButton = document.getElementById("cancelFinancialGoalEditBtn");

        form?.reset();

        if (saveButton) {
            saveButton.textContent = "Save Goal";
        }

        if (cancelButton) {
            cancelButton.style.display = "none";
        }
    },

    renderFinancialGoals() {
        const container = document.getElementById("financialGoalsList");

        if (!container) {
            return;
        }

        const goals = DashboardService.getFinancialGoals();

        if (goals.length === 0) {
            container.innerHTML = `
                <div class="kpi-card">
                    <i class="fa-solid fa-bullseye"></i>
                    <span>No financial goals created yet.</span>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => {
            const progress = Math.min(Math.max(Number(goal.progress || 0), 0), 100);
            const targetDate = goal.targetDate || "-";
            const estimatedDate = goal.estimatedCompletionDate || "Not available";

            return `
                <div class="kpi-card" data-goal-id="${this.escapeText(goal.id)}">
                    <i class="fa-solid fa-bullseye"></i>
                    <span>${this.escapeText(goal.type)} Goal</span>
                    <h2>${this.escapeText(goal.name)}</h2>
                    <div class="progress-bar" style="margin:0.75rem 0;">
                        <div class="progress-fill" style="width:${progress}%;"></div>
                    </div>
                    <small>${progress.toFixed(2)}% complete</small>
                    <small>Saved: ${this.formatGoalCurrency(goal.currentSavedAmount)} of ${this.formatGoalCurrency(goal.targetAmount)}</small>
                    <small>Remaining: ${this.formatGoalCurrency(goal.remainingAmount)}</small>
                    <small>Target date: ${this.escapeText(targetDate)}</small>
                    <small>Estimated completion: ${this.escapeText(estimatedDate)}</small>
                    <small>Suggested monthly contribution: ${this.formatGoalCurrency(goal.suggestedContribution)}</small>
                    <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
                        <button type="button" data-goal-action="edit" data-goal-id="${this.escapeText(goal.id)}">Edit</button>
                        <button type="button" data-goal-action="delete" data-goal-id="${this.escapeText(goal.id)}">Delete</button>
                    </div>
                </div>
            `;
        }).join("");
    },

    renderNotifications() {
        const container = document.getElementById("notificationList");
        const badge = document.getElementById("notificationCountBadge");

        if (!container) {
            return;
        }

        const notifications = DashboardService.getNotifications();

        if (badge) {
            badge.textContent = notifications.length;
            badge.style.display = notifications.length > 0 ? "inline-flex" : "none";
        }

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="kpi-card">
                    <i class="fa-solid fa-bell-slash"></i>
                    <span>No notifications.</span>
                </div>
            `;
            return;
        }

        const tones = {
            critical: { border: "#dc2626", background: "#fef2f2", color: "#7f1d1d" },
            warning: { border: "#f59e0b", background: "#fffbeb", color: "#78350f" },
            info: { border: "#2563eb", background: "#eff6ff", color: "#1e3a8a" }
        };

        container.innerHTML = notifications.map(notification => {
            const tone = tones[notification.severity] || tones.info;
            const date = notification.date
                ? new Date(`${notification.date}T00:00:00`).toLocaleDateString("en-IN")
                : "-";

            return `
                <div class="kpi-card" style="border-left:4px solid ${tone.border}; background:${tone.background};">
                    <i class="${this.escapeText(notification.icon)}" style="color:${tone.border};"></i>
                    <span style="color:${tone.color}; font-weight:600;">${this.escapeText(notification.title)}</span>
                    <h2 style="font-size:1rem; line-height:1.4; color:${tone.color};">${this.escapeText(notification.description)}</h2>
                    <small style="color:${tone.color};">${this.escapeText(notification.severity)} | ${this.escapeText(date)} | ${this.escapeText(notification.source)}</small>
                </div>
            `;
        }).join("");
    },

    renderFinancialCalendar() {
        const summaryContainer = document.getElementById("financialCalendarSummary");
        const listContainer = document.getElementById("financialCalendarList");

        if (!summaryContainer || !listContainer) {
            return;
        }

        const events = DashboardService.getFinancialCalendarEvents();
        const summary = DashboardService.getFinancialCalendarSummary(events);

        summaryContainer.innerHTML = [
            { icon: "fa-solid fa-calendar", label: "This Month", value: summary.monthEvents },
            { icon: "fa-solid fa-calendar-day", label: "Today", value: summary.today },
            { icon: "fa-solid fa-clock", label: "Upcoming", value: summary.upcoming },
            { icon: "fa-solid fa-triangle-exclamation", label: "Overdue", value: summary.overdue }
        ].map(item => `
            <div class="kpi-card">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
                <h2>${item.value}</h2>
            </div>
        `).join("");

        if (events.length === 0) {
            listContainer.innerHTML = `
                <div class="kpi-card">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    <span>No upcoming financial events.</span>
                </div>
            `;
            return;
        }

        const tones = {
            upcoming: { border: "#2563eb", background: "#eff6ff", color: "#1e3a8a" },
            today: { border: "#16a34a", background: "#f0fdf4", color: "#14532d" },
            overdue: { border: "#dc2626", background: "#fef2f2", color: "#7f1d1d" }
        };

        listContainer.innerHTML = events.map(event => {
            const tone = tones[event.status] || tones.upcoming;
            const date = new Date(`${event.date}T00:00:00`).toLocaleDateString("en-IN");
            const daysRemaining = event.daysRemaining === 0
                ? "Today"
                : `${Math.abs(event.daysRemaining)} day${Math.abs(event.daysRemaining) === 1 ? "" : "s"} ${event.daysRemaining < 0 ? "overdue" : "remaining"}`;

            return `
                <div class="kpi-card" style="border-left:4px solid ${tone.border}; background:${tone.background};">
                    <i class="fa-solid fa-calendar-day" style="color:${tone.border};"></i>
                    <span style="color:${tone.color}; font-weight:600;">${this.escapeText(event.title)}</span>
                    <h2 style="font-size:1rem; line-height:1.4; color:${tone.color};">${this.escapeText(date)} | ${this.escapeText(event.source)}</h2>
                    <small style="color:${tone.color};">${this.escapeText(daysRemaining)} | ${this.escapeText(event.status)}</small>
                </div>
            `;
        }).join("");
    },

    initializeRecurringManager() {
        if (this.recurringInitialized) {
            return;
        }

        const form = document.getElementById("recurringTemplateForm");
        const list = document.getElementById("recurringTemplateList");
        const cancelButton = document.getElementById("cancelRecurringTemplateEditBtn");

        form?.addEventListener("submit", event => {
            event.preventDefault();
            this.saveRecurringTemplate();
        });

        list?.addEventListener("click", event => {
            const button = event.target.closest("button[data-recurring-action]");

            if (!button) {
                return;
            }

            const id = button.dataset.recurringId;

            if (button.dataset.recurringAction === "edit") {
                this.editRecurringTemplate(id);
            } else if (button.dataset.recurringAction === "toggle") {
                this.toggleRecurringTemplate(id);
            } else if (button.dataset.recurringAction === "delete") {
                this.deleteRecurringTemplate(id);
            }
        });

        cancelButton?.addEventListener("click", () => this.resetRecurringTemplateForm());
        this.recurringInitialized = true;
    },

    getRecurringTemplateFormData() {
        return {
            id: document.getElementById("recurringTemplateId")?.value || "",
            name: document.getElementById("recurringTemplateName")?.value || "",
            type: document.getElementById("recurringTemplateType")?.value || "Income",
            amount: document.getElementById("recurringTemplateAmount")?.value || 0,
            frequency: document.getElementById("recurringTemplateFrequency")?.value || "Monthly",
            startDate: document.getElementById("recurringTemplateStartDate")?.value || "",
            status: "Active"
        };
    },

    saveRecurringTemplate() {
        if (typeof RecurringManager !== "object") {
            return;
        }

        const template = this.getRecurringTemplateFormData();
        const existing = template.id ? RecurringManager.getById(template.id) : null;
        const result = RecurringManager.save(template.id, {
            ...template,
            status: existing?.status || "Active"
        });

        if (result.error) {
            window.alert(result.error);
            return;
        }

        this.resetRecurringTemplateForm();
        this.refresh();
    },

    editRecurringTemplate(id) {
        if (typeof RecurringManager !== "object") {
            return;
        }

        const template = RecurringManager.getById(id);

        if (!template) {
            return;
        }

        document.getElementById("recurringTemplateId").value = template.id;
        document.getElementById("recurringTemplateName").value = template.name || "";
        document.getElementById("recurringTemplateType").value = template.type || "Income";
        document.getElementById("recurringTemplateAmount").value = template.amount || "";
        document.getElementById("recurringTemplateFrequency").value = template.frequency || "Monthly";
        document.getElementById("recurringTemplateStartDate").value = template.startDate || "";

        const saveButton = document.getElementById("saveRecurringTemplateBtn");
        const cancelButton = document.getElementById("cancelRecurringTemplateEditBtn");

        if (saveButton) {
            saveButton.textContent = "Update Template";
        }

        if (cancelButton) {
            cancelButton.style.display = "inline-flex";
        }

        document.getElementById("recurringTemplateName")?.focus();
    },

    toggleRecurringTemplate(id) {
        if (typeof RecurringManager !== "object") {
            return;
        }

        const result = RecurringManager.toggleStatus(id);

        if (result.error) {
            window.alert(result.error);
            return;
        }

        this.refresh();
    },

    deleteRecurringTemplate(id) {
        if (typeof RecurringManager !== "object" || !window.confirm("Delete this recurring template?")) {
            return;
        }

        const result = RecurringManager.remove(id);

        if (result.error) {
            window.alert(result.error);
            return;
        }

        this.resetRecurringTemplateForm();
        this.refresh();
    },

    resetRecurringTemplateForm() {
        const form = document.getElementById("recurringTemplateForm");
        const saveButton = document.getElementById("saveRecurringTemplateBtn");
        const cancelButton = document.getElementById("cancelRecurringTemplateEditBtn");

        form?.reset();

        if (saveButton) {
            saveButton.textContent = "Save Template";
        }

        if (cancelButton) {
            cancelButton.style.display = "none";
        }
    },

    renderRecurringTemplates() {
        const summaryContainer = document.getElementById("recurringSummary");
        const listContainer = document.getElementById("recurringTemplateList");

        if (!summaryContainer || !listContainer) {
            return;
        }

        const templates = DashboardService.getRecurringTemplates();
        const summary = DashboardService.getRecurringSummary(templates);

        summaryContainer.innerHTML = [
            { icon: "fa-solid fa-repeat", label: "Total", value: summary.total },
            { icon: "fa-solid fa-circle-play", label: "Active", value: summary.active },
            { icon: "fa-solid fa-circle-pause", label: "Paused", value: summary.paused },
            { icon: "fa-solid fa-triangle-exclamation", label: "Overdue", value: summary.overdue }
        ].map(item => `
            <div class="kpi-card">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
                <h2>${item.value}</h2>
            </div>
        `).join("");

        if (templates.length === 0) {
            listContainer.innerHTML = `
                <div class="kpi-card">
                    <i class="fa-solid fa-rotate"></i>
                    <span>No recurring transactions.</span>
                </div>
            `;
            return;
        }

        const scheduleTones = {
            upcoming: { border: "#2563eb", background: "#eff6ff", color: "#1e3a8a" },
            today: { border: "#16a34a", background: "#f0fdf4", color: "#14532d" },
            overdue: { border: "#dc2626", background: "#fef2f2", color: "#7f1d1d" }
        };

        listContainer.innerHTML = templates.map(template => {
            const tone = template.status === "Paused"
                ? { border: "#6b7280", background: "#f9fafb", color: "#374151" }
                : (scheduleTones[template.scheduleStatus] || scheduleTones.upcoming);
            const nextRun = template.nextRunDate
                ? new Date(`${template.nextRunDate}T00:00:00`).toLocaleDateString("en-IN")
                : "Not available";
            const scheduleLabel = template.scheduleStatus === "today"
                ? "Today"
                : template.scheduleStatus === "overdue"
                    ? `${Math.abs(template.daysRemaining)} day${Math.abs(template.daysRemaining) === 1 ? "" : "s"} overdue`
                    : `${template.daysRemaining} day${template.daysRemaining === 1 ? "" : "s"} remaining`;

            return `
                <div class="kpi-card" data-recurring-id="${this.escapeText(template.id)}" style="border-left:4px solid ${tone.border}; background:${tone.background};">
                    <i class="fa-solid fa-rotate" style="color:${tone.border};"></i>
                    <span style="color:${tone.color}; font-weight:600;">${this.escapeText(template.type)} | ${this.escapeText(template.frequency)}</span>
                    <h2 style="font-size:1rem; line-height:1.4; color:${tone.color};">${this.escapeText(template.name)}</h2>
                    <small style="color:${tone.color};">Amount: ${this.formatGoalCurrency(template.amount)} | Next run: ${this.escapeText(nextRun)}</small>
                    <small style="color:${tone.color};">${this.escapeText(template.status)} | ${this.escapeText(scheduleLabel)}</small>
                    <div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap;">
                        <button type="button" data-recurring-action="edit" data-recurring-id="${this.escapeText(template.id)}">Edit</button>
                        <button type="button" data-recurring-action="toggle" data-recurring-id="${this.escapeText(template.id)}">${template.status === "Paused" ? "Resume" : "Pause"}</button>
                        <button type="button" data-recurring-action="delete" data-recurring-id="${this.escapeText(template.id)}">Delete</button>
                    </div>
                </div>
            `;
        }).join("");
    },

    formatGoalCurrency(value) {
        const amount = Number(value || 0);

        return typeof formatCurrency === "function"
            ? formatCurrency(amount)
            : "₹" + amount;
    },

    initializeBackupManager() {
        if (this.backupInitialized) {
            return;
        }

        document.getElementById("exportBackupBtn")?.addEventListener("click", () => this.exportBackup());
        document.getElementById("importBackupBtn")?.addEventListener("click", () => this.handleImportBackupClick());
        document.getElementById("confirmBackupRestoreBtn")?.addEventListener("click", () => this.confirmBackupRestore());
        document.getElementById("cancelBackupRestoreBtn")?.addEventListener("click", () => this.cancelBackupRestore());

        this.backupInitialized = true;
    },

    showBackupMessage(text, tone) {
        const container = document.getElementById("backupMessage");

        if (!container) {
            return;
        }

        const tones = {
            success: "#16a34a",
            error: "#dc2626",
            info: "#2563eb"
        };

        container.style.color = tones[tone] || tones.info;
        container.textContent = text;

        if (tone === "error" && typeof ErrorHandler === "object" && typeof ErrorHandler.notify === "function") {
            ErrorHandler.notify(text, "error", { duration: 2600 });
        }
    },

    exportBackup() {
        if (typeof BackupManager !== "object") {
            return;
        }

        const payload = BackupManager.createExportPayload();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = payload.generatedAt.replace(/[:.]/g, "-");

        link.href = url;
        link.download = `sfm-backup-${payload.version}-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        this.showBackupMessage("Backup exported successfully.", "success");
    },

    handleImportBackupClick() {
        const fileInput = document.getElementById("backupFileInput");
        const file = fileInput?.files?.[0];

        if (file && typeof BackupManager === 'object' &&
            typeof BackupManager.isFileSizeAllowed === 'function' &&
            !BackupManager.isFileSizeAllowed(file.size)) {
            this.showBackupMessage('Backup file is too large. The maximum supported size is 5 MB.', 'error');
            return;
        }

        if (!file) {
            this.showBackupMessage("Select a backup file before importing.", "error");
            return;
        }

        const reader = new FileReader();

        this.showBackupMessage('Reading and validating backup file...', 'info');

        reader.onprogress = event => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                this.showBackupMessage('Reading and validating backup file... ' + percent + '%', 'info');
            }
        };

        reader.onload = () => {
            this.processImportedBackupText(String(reader.result || ""));
        };

        reader.onerror = () => {
            this.showBackupMessage("Unable to read the selected file.", "error");
        };

        reader.readAsText(file);
    },

    processImportedBackupText(text) {
        const execute = () => {
            if (typeof BackupManager !== "object" || typeof DashboardService !== "object") {
                return;
            }

            const parsed = BackupManager.parseBackupFile(text);

            if (parsed.error) {
                this.showBackupMessage(parsed.error, "error");
                this.hideBackupPreview();
                return;
            }

            const validation = DashboardService.validateBackupData(parsed.payload);

            if (!validation.valid) {
                this.showBackupMessage(validation.error, "error");
                this.hideBackupPreview();
                return;
            }

            this.pendingBackupPayload = parsed.payload;
            this.renderBackupImportPreview(parsed.payload);
            this.showBackupMessage("Backup file validated. Review the preview before restoring.", "info");
        };

        if (typeof ErrorHandler === "object" && typeof ErrorHandler.run === "function") {
            ErrorHandler.run("dashboard.backup.import", execute, {
                notify: true,
                fallbackValue: null,
                fallbackMessage: "Backup validation failed due to an unexpected error."
            });
            return;
        }

        execute();
    },

    buildBackupSummaryCards(summary, overrides) {
        const items = [
            { key: "income", icon: "fa-solid fa-sack-dollar", label: "Income" },
            { key: "expenses", icon: "fa-solid fa-receipt", label: "Expense" },
            { key: "budgets", icon: "fa-solid fa-wallet", label: "Budget" },
            { key: "loans", icon: "fa-solid fa-building-columns", label: "Loans" },
            { key: "creditcards", icon: "fa-regular fa-credit-card", label: "Credit Cards" },
            { key: "investments", icon: "fa-solid fa-seedling", label: "Investments" },
            { key: "emi", icon: "fa-solid fa-calendar-day", label: "EMI" },
            { key: "goals", icon: "fa-solid fa-bullseye", label: "Goals" },
            { key: "recurring", icon: "fa-solid fa-rotate", label: "Recurring Templates" },
            { key: "notifications", icon: "fa-solid fa-bell", label: "Notifications" },
            { key: "calendarEvents", icon: "fa-solid fa-calendar-days", label: "Calendar Events" }
        ];

        return items.map(item => {
            const overrideText = overrides && overrides[item.key];
            const value = overrideText || summary[item.key] || 0;

            return `
                <div class="kpi-card">
                    <i class="${item.icon}"></i>
                    <span>${this.escapeText(item.label)}</span>
                    <h2 style="font-size:${overrideText ? "0.85rem" : "1.5rem"};">${this.escapeText(String(value))}</h2>
                </div>
            `;
        }).join("");
    },

    renderBackupImportPreview(payload) {
        const previewContainer = document.getElementById("backupImportPreview");
        const summaryContainer = document.getElementById("backupImportSummary");

        if (!previewContainer || !summaryContainer) {
            return;
        }

        const summary = DashboardService.getBackupSummary(payload.data);

        summaryContainer.innerHTML = this.buildBackupSummaryCards(summary, {
            notifications: "Recalculated after restore",
            calendarEvents: "Recalculated after restore"
        });

        previewContainer.style.display = "block";
    },

    hideBackupPreview() {
        const previewContainer = document.getElementById("backupImportPreview");

        if (previewContainer) {
            previewContainer.style.display = "none";
        }

        this.pendingBackupPayload = null;

        const fileInput = document.getElementById("backupFileInput");

        if (fileInput) {
            fileInput.value = "";
        }
    },

    confirmBackupRestore() {
        const execute = () => {
            if (!this.pendingBackupPayload || typeof BackupManager !== "object") {
                this.showBackupMessage("No validated backup is ready to restore.", "error");
                return;
            }

            const result = BackupManager.restore(this.pendingBackupPayload);

            if (result.error) {
                this.showBackupMessage(result.error, "error");
                return;
            }

            this.hideBackupPreview();
            this.showBackupMessage("Backup restored successfully.", "success");
            this.refresh();
        };

        if (typeof ErrorHandler === "object" && typeof ErrorHandler.run === "function") {
            ErrorHandler.run("dashboard.backup.restore", execute, {
                notify: true,
                fallbackValue: null,
                fallbackMessage: "Backup restore failed due to an unexpected error."
            });
            return;
        }

        execute();
    },

    cancelBackupRestore() {
        this.hideBackupPreview();
        this.showBackupMessage("Restore cancelled.", "info");
    },

    renderBackupSummary() {
        const container = document.getElementById("backupSummary");

        if (!container) {
            return;
        }

        const snapshot = DashboardService.getBackupSnapshot();
        const summary = DashboardService.getBackupSummary(snapshot.data);
        const liveSummary = {
            ...summary,
            notifications: DashboardService.getNotifications().length,
            calendarEvents: DashboardService.getFinancialCalendarEvents().length
        };

        container.innerHTML = this.buildBackupSummaryCards(liveSummary);
    }

};

console.log("✔ Dashboard Controller Loaded");

DashboardController.loadSettings = function () {

    const settings = DashboardService.getSettings();

    document.getElementById("currency").value =
        settings.currency;

    document.getElementById("theme").value =
        settings.theme;

    document.getElementById("dateFormat").value =
        settings.dateFormat;

    document.getElementById("decimalPlaces").value =
        settings.decimalPlaces;
};

DashboardController.saveSettings = function () {

    DashboardService.saveSettings({

        currency:
            document.getElementById("currency").value,

        theme:
            document.getElementById("theme").value,

        dateFormat:
            document.getElementById("dateFormat").value,

        decimalPlaces:
            Number(document.getElementById("decimalPlaces").value)

    });

    alert("Settings Saved");
};
