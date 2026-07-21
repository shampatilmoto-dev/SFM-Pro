"use strict";

const ReportsController = {
    initialized: false,
    elements: {},
    currentView: null,
    charts: {
        incomeExpense: null,
        cashFlow: null,
        savingsTrend: null
    },

    initialize() {
        if (this.initialized) {
            return;
        }

        if (typeof ReportsService !== "object") {
            console.error("ReportsService is required.");
            return;
        }

        this.cacheElements();
        this.bindEvents();
        this.render();
        this.initialized = true;
    },

    cacheElements() {
        this.elements = {
            form: document.getElementById("reportsForm"),
            from: document.getElementById("reportFrom"),
            to: document.getElementById("reportTo"),
            reportType: document.getElementById("reportType"),
            totalIncome: document.getElementById("reportTotalIncome"),
            totalExpense: document.getElementById("reportTotalExpense"),
            netSavings: document.getElementById("reportNetSavings"),
            totalInvestments: document.getElementById("reportTotalInvestments"),
            tableTitle: document.getElementById("reportsTableTitle"),
            tableBody: document.getElementById("reportsTableBody"),
            chartTitle: document.getElementById("reportsChartTitle"),
            chartSubtitle: document.getElementById("reportsChartSubtitle"),
            chartsGrid: document.getElementById("reportsChartsGrid"),
            chartsEmptyState: document.getElementById("reportsChartsEmptyState"),
            incomeExpenseCanvas: document.getElementById("incomeExpenseChart"),
            cashFlowCanvas: document.getElementById("cashFlowChart"),
            savingsTrendCanvas: document.getElementById("savingsTrendChart"),
            exportPdf: document.getElementById("exportPdfBtn"),
            exportExcel: document.getElementById("exportExcelBtn"),
            exportCsv: document.getElementById("exportCsvBtn")
        };
    },

    bindEvents() {
        if (this.elements.form) {
            this.elements.form.addEventListener("submit", event => {
                event.preventDefault();
                this.render();
            });
        }

        if (this.elements.reportType) {
            this.elements.reportType.addEventListener("change", () => this.render());
        }

        if (this.elements.from) {
            this.elements.from.addEventListener("change", () => this.render());
        }

        if (this.elements.to) {
            this.elements.to.addEventListener("change", () => this.render());
        }

        if (this.elements.exportPdf) {
            this.elements.exportPdf.addEventListener("click", () => this.handleExport("pdf"));
        }

        if (this.elements.exportExcel) {
            this.elements.exportExcel.addEventListener("click", () => this.handleExport("excel"));
        }

        if (this.elements.exportCsv) {
            this.elements.exportCsv.addEventListener("click", () => this.handleExport("csv"));
        }
    },

    readFilters() {
        return {
            from: this.elements.from?.value || "",
            to: this.elements.to?.value || "",
            reportType: this.elements.reportType?.value || "overall"
        };
    },

    render() {
        const data = ReportsService.getReportData(this.readFilters());
        this.currentView = data;
        this.renderSummary(data.summary);
        this.renderTable(data.table);
        this.renderChartPlaceholder(data.chart);
        this.renderCharts(data);
    },

    handleExport(type) {
        if (typeof ReportsExport !== "object") {
            window.alert("Export module not available.");
            return;
        }

        const view = this.currentView;
        if (!view || !view.table) {
            window.alert("No report data available.");
            return;
        }

        if (type === "pdf") {
            ReportsExport.exportPDF(view);
            return;
        }

        if (type === "excel") {
            ReportsExport.exportExcel(view);
            return;
        }

        if (type === "csv") {
            ReportsExport.exportCSV(view);
        }
    },

    renderSummary(summary) {
        if (this.elements.totalIncome) {
            this.elements.totalIncome.textContent = this.formatCurrency(summary.totalIncome);
        }

        if (this.elements.totalExpense) {
            this.elements.totalExpense.textContent = this.formatCurrency(summary.totalExpense);
        }

        if (this.elements.netSavings) {
            this.elements.netSavings.textContent = this.formatCurrency(summary.netSavings);
        }

        if (this.elements.totalInvestments) {
            this.elements.totalInvestments.textContent = this.formatCurrency(summary.totalInvestments);
        }
    },

    renderTable(table) {
        if (!this.elements.tableBody) {
            return;
        }

        if (this.elements.tableTitle) {
            this.elements.tableTitle.textContent = table?.title || "Report Table";
        }

        const rows = Array.isArray(table?.rows) ? table.rows : [];

        if (!Array.isArray(rows) || rows.length === 0) {
            this.elements.tableBody.innerHTML = "<tr><td colspan=\"2\">No data available.</td></tr>";
            return;
        }

        this.elements.tableBody.innerHTML = rows
            .map(row => `<tr><td>${this.escape(row.label)}</td><td>${this.escape(row.value)}</td></tr>`)
            .join("");
    },

    renderChartPlaceholder(chart) {
        if (this.elements.chartTitle) {
            this.elements.chartTitle.textContent = chart.title;
        }

        if (this.elements.chartSubtitle) {
            this.elements.chartSubtitle.textContent = chart.subtitle;
        }
    },

    renderCharts(data) {
        const hasRenderableData = this.hasRenderableData(data?.summary);
        const chartLibraryReady = typeof Chart === "function";

        if (!chartLibraryReady) {
            this.destroyCharts();
            this.showChartEmptyState("Chart library is unavailable.");
            return;
        }

        if (!hasRenderableData) {
            this.destroyCharts();
            this.showChartEmptyState("No chart data available for the selected filters.");
            return;
        }

        this.hideChartEmptyState();
        this.destroyCharts();

        const chartData = this.buildChartData(data);

        this.charts.incomeExpense = this.createChart(
            this.elements.incomeExpenseCanvas,
            "doughnut",
            {
                labels: ["Income", "Expense"],
                datasets: [{
                    data: [chartData.income, chartData.expense],
                    backgroundColor: ["#2e8b57", "#d9534f"]
                }]
            }
        );

        this.charts.cashFlow = this.createChart(
            this.elements.cashFlowCanvas,
            "bar",
            {
                labels: ["Inflow", "Outflow", "Net"],
                datasets: [{
                    label: "Cash Flow",
                    data: [chartData.income, chartData.expense, chartData.savings],
                    backgroundColor: ["#4caf50", "#f44336", "#2196f3"]
                }]
            }
        );

        this.charts.savingsTrend = this.createChart(
            this.elements.savingsTrendCanvas,
            "line",
            {
                labels: ["Income", "Expense", "Savings"],
                datasets: [{
                    label: "Savings Trend",
                    data: [chartData.income, chartData.expense, chartData.savings],
                    borderColor: "#0d6efd",
                    backgroundColor: "rgba(13, 110, 253, 0.12)",
                    fill: true,
                    tension: 0.35
                }]
            }
        );
    },

    createChart(canvas, type, configData) {
        if (!canvas) {
            return null;
        }

        const context = canvas.getContext("2d");
        if (!context) {
            return null;
        }

        return new Chart(context, {
            type,
            data: configData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom"
                    }
                },
                scales: type === "doughnut"
                    ? undefined
                    : {
                        y: {
                            beginAtZero: true
                        }
                    }
            }
        });
    },

    buildChartData(data) {
        const summary = data?.summary || {};

        return {
            income: Number(summary.totalIncome || 0),
            expense: Number(summary.totalExpense || 0),
            savings: Number(summary.netSavings || 0)
        };
    },

    hasRenderableData(summary) {
        const income = Number(summary?.totalIncome || 0);
        const expense = Number(summary?.totalExpense || 0);
        const investments = Number(summary?.totalInvestments || 0);

        return income > 0 || expense > 0 || investments > 0;
    },

    showChartEmptyState(message) {
        if (this.elements.chartsEmptyState) {
            this.elements.chartsEmptyState.textContent = message;
            this.elements.chartsEmptyState.style.display = "block";
        }

        if (this.elements.chartsGrid) {
            this.elements.chartsGrid.style.display = "none";
        }
    },

    hideChartEmptyState() {
        if (this.elements.chartsEmptyState) {
            this.elements.chartsEmptyState.style.display = "none";
        }

        if (this.elements.chartsGrid) {
            this.elements.chartsGrid.style.display = "grid";
        }
    },

    destroyCharts() {
        const keys = Object.keys(this.charts);

        keys.forEach(key => {
            if (this.charts[key] && typeof this.charts[key].destroy === "function") {
                this.charts[key].destroy();
            }

            this.charts[key] = null;
        });
    },

    formatCurrency(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(value || 0));
    },

    escape(value) {
        const node = document.createElement("div");
        node.textContent = String(value ?? "");
        return node.innerHTML;
    }
};

function initializeReportsController() {
    ReportsController.initialize();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeReportsController, { once: true });
} else {
    initializeReportsController();
}
