"use strict";

const ReportsEngine = {
    reportTypes: [
        "income",
        "expense",
        "budget",
        "loans",
        "creditcards",
        "investments",
        "emi",
        "overall"
    ],

    normalizeFilters(filters) {
        const reportType = String(filters?.reportType || "overall").toLowerCase();

        return {
            from: filters?.from || "",
            to: filters?.to || "",
            reportType: this.reportTypes.includes(reportType) ? reportType : "overall"
        };
    },

    getRecordDate(record, reportType) {
        if (!record || typeof record !== "object") {
            return "";
        }

        if (reportType === "budget") {
            const month = String(record.month || "").padStart(2, "0");
            const year = String(record.year || "");
            return month && year ? `${year}-${month}-01` : "";
        }

        if (reportType === "loans") {
            return String(record.startDate || "");
        }

        if (reportType === "creditcards") {
            return String(record.dueDate || record.billingDate || "");
        }

        if (reportType === "emi") {
            return String(record.dueDate || "");
        }

        return String(record.date || "");
    },

    inRange(dateValue, from, to) {
        if (!dateValue) {
            return !from && !to;
        }

        if (from && dateValue < from) {
            return false;
        }

        if (to && dateValue > to) {
            return false;
        }

        return true;
    },

    filterByDate(records, reportType, filters) {
        if (!Array.isArray(records)) {
            return [];
        }

        const normalized = this.normalizeFilters(filters);

        return records.filter(record => {
            const dateValue = this.getRecordDate(record, reportType);
            return this.inRange(dateValue, normalized.from, normalized.to);
        });
    },

    getInvestmentSummary(investments) {
        const list = Array.isArray(investments) ? investments : [];
        const invested = list.reduce((sum, item) => sum + Number(item.amount || item.investedAmount || 0), 0);
        const current = list.reduce((sum, item) => sum + Number(item.current || item.currentValue || 0), 0);

        return {
            totalRecords: list.length,
            invested,
            current,
            profit: current - invested
        };
    },

    toRows(items) {
        return items.map(item => ({
            label: item.label,
            value: item.value
        }));
    },

    buildReport(filters, modules, summaries) {
        const normalized = this.normalizeFilters(filters);

        const totalIncome = Number(summaries?.income?.totalIncome || 0);
        const totalExpense = Number(summaries?.expense?.total || 0);
        const totalInvestments = Number(summaries?.investments?.current || 0);

        const summary = {
            totalIncome,
            totalExpense,
            netSavings: totalIncome - totalExpense,
            totalInvestments
        };

        const table = this.buildTableData(normalized.reportType, modules, summaries);
        const chart = this.getChartPlaceholder(normalized, table.title);

        return {
            filters: normalized,
            summary,
            table,
            chart
        };
    },

    buildTableData(reportType, modules, summaries) {
        if (reportType === "income") {
            return {
                title: "Income Report",
                rows: this.toRows([
                    { label: "Total Entries", value: summaries.income.totalEntries || 0 },
                    { label: "Total Income", value: this.formatMoney(summaries.income.totalIncome) }
                ])
            };
        }

        if (reportType === "expense") {
            return {
                title: "Expense Report",
                rows: this.toRows([
                    { label: "Total Entries", value: summaries.expense.count || 0 },
                    { label: "Total Expense", value: this.formatMoney(summaries.expense.total) }
                ])
            };
        }

        if (reportType === "budget") {
            return {
                title: "Budget Report",
                rows: this.toRows([
                    { label: "Budget Records", value: modules.budget.length },
                    { label: "Total Budget", value: this.formatMoney(summaries.budget.totalBudget) },
                    { label: "Budget Used", value: this.formatMoney(summaries.budget.totalUsed) },
                    { label: "Remaining Budget", value: this.formatMoney(summaries.budget.remaining) }
                ])
            };
        }

        if (reportType === "loans") {
            return {
                title: "Loans Report",
                rows: this.toRows([
                    { label: "Total Loans", value: summaries.loans.totalLoans || 0 },
                    { label: "Total Outstanding", value: this.formatMoney(summaries.loans.totalOutstanding) },
                    { label: "Total EMI", value: this.formatMoney(summaries.loans.totalEMI) }
                ])
            };
        }

        if (reportType === "creditcards") {
            return {
                title: "Credit Cards Report",
                rows: this.toRows([
                    { label: "Total Cards", value: modules.creditcards.length },
                    { label: "Total Credit Limit", value: this.formatMoney(summaries.creditcards.totalCreditLimit) },
                    { label: "Total Outstanding", value: this.formatMoney(summaries.creditcards.totalOutstanding) },
                    { label: "Utilization", value: `${Number(summaries.creditcards.utilization || 0).toFixed(2)}%` }
                ])
            };
        }

        if (reportType === "investments") {
            return {
                title: "Investments Report",
                rows: this.toRows([
                    { label: "Total Records", value: summaries.investments.totalRecords || 0 },
                    { label: "Total Invested", value: this.formatMoney(summaries.investments.invested) },
                    { label: "Current Value", value: this.formatMoney(summaries.investments.current) },
                    { label: "Profit / Loss", value: this.formatMoney(summaries.investments.profit) }
                ])
            };
        }

        if (reportType === "emi") {
            return {
                title: "EMI Report",
                rows: this.toRows([
                    { label: "Total Records", value: modules.emi.length },
                    { label: "Monthly EMI", value: this.formatMoney(summaries.emi.monthlyEMI) },
                    { label: "Paid", value: this.formatMoney(summaries.emi.totalPaid) },
                    { label: "Outstanding", value: this.formatMoney(summaries.emi.totalOutstanding) }
                ])
            };
        }

        return {
            title: "Overall Summary",
            rows: this.toRows([
                { label: "Income Records", value: modules.income.length },
                { label: "Expense Records", value: modules.expense.length },
                { label: "Budget Records", value: modules.budget.length },
                { label: "Loan Records", value: modules.loans.length },
                { label: "Credit Card Records", value: modules.creditcards.length },
                { label: "Investment Records", value: modules.investments.length },
                { label: "EMI Records", value: modules.emi.length },
                { label: "Total Income", value: this.formatMoney(summaries.income.totalIncome) },
                { label: "Total Expense", value: this.formatMoney(summaries.expense.total) },
                { label: "Net Savings", value: this.formatMoney((summaries.income.totalIncome || 0) - (summaries.expense.total || 0)) },
                { label: "Total Investments", value: this.formatMoney(summaries.investments.current) }
            ])
        };
    },

    formatMoney(value) {
        const amount = Number(value || 0);
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(amount);
    },

    getChartPlaceholder(filters, tableTitle) {
        const normalized = this.normalizeFilters(filters);
        const rangeLabel = normalized.from || normalized.to
            ? `${normalized.from || "Start"} to ${normalized.to || "Today"}`
            : "All Dates";
        return {
            title: "Chart Placeholder",
            subtitle: `${tableTitle} | ${rangeLabel}`
        };
    }
};
