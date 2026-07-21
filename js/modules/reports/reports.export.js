"use strict";

const ReportsExport = {
    safeFileName(value) {
        return String(value || "report")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "report";
    },

    downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    },

    exportCSV(viewModel) {
        const table = viewModel?.table;
        const rows = Array.isArray(table?.rows) ? table.rows : [];

        const csvLines = ["Metric,Value"];

        rows.forEach(row => {
            const metric = this.escapeCSV(row.label);
            const value = this.escapeCSV(row.value);
            csvLines.push(`${metric},${value}`);
        });

        const csv = `\uFEFF${csvLines.join("\n")}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const baseName = this.safeFileName(table?.title || "report");
        this.downloadBlob(blob, `${baseName}.csv`);
    },

    escapeCSV(value) {
        const text = String(value ?? "").replace(/"/g, '""');
        return `"${text}"`;
    },

    exportPDF(viewModel) {
        const jsPDFCtor = window.jspdf?.jsPDF || window.jsPDF;

        if (typeof jsPDFCtor !== "function") {
            window.alert("PDF export library not available.");
            return;
        }

        const doc = new jsPDFCtor();
        const summary = viewModel.summary || {};
        const table = viewModel.table || { title: "Report", rows: [] };
        const filters = viewModel.filters || {};

        let y = 16;

        doc.setFontSize(16);
        doc.text(table.title || "Report", 14, y);
        y += 8;

        doc.setFontSize(10);
        const from = filters.from || "Start";
        const to = filters.to || "Today";
        doc.text(`Date Range: ${from} to ${to}`, 14, y);
        y += 6;

        doc.text(`Generated On: ${new Date().toLocaleString("en-IN")}`, 14, y);
        y += 8;

        doc.setFontSize(11);
        doc.text("Summary", 14, y);
        y += 6;

        const summaryLines = [
            `Total Income: ${this.formatMoney(summary.totalIncome)}`,
            `Total Expense: ${this.formatMoney(summary.totalExpense)}`,
            `Net Savings: ${this.formatMoney(summary.netSavings)}`,
            `Total Investments: ${this.formatMoney(summary.totalInvestments)}`
        ];

        summaryLines.forEach(line => {
            doc.text(line, 14, y);
            y += 6;
        });

        y += 2;
        doc.setFontSize(11);
        doc.text("Report Table", 14, y);
        y += 6;

        doc.setFontSize(10);
        doc.text("Metric", 14, y);
        doc.text("Value", 110, y);
        y += 5;

        const rows = Array.isArray(table.rows) ? table.rows : [];
        rows.forEach(row => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }

            doc.text(String(row.label || ""), 14, y);
            doc.text(String(row.value || ""), 110, y);
            y += 5;
        });

        const baseName = this.safeFileName(table.title || "report");
        doc.save(`${baseName}.pdf`);
    },

    exportExcel(viewModel) {
        const xlsx = window.XLSX;

        if (!xlsx || typeof xlsx.utils?.book_new !== "function") {
            window.alert("Excel export library not available.");
            return;
        }

        const table = viewModel?.table;
        const rows = Array.isArray(table?.rows) ? table.rows : [];
        const sheetRows = [["Metric", "Value"]];

        rows.forEach(row => {
            sheetRows.push([String(row.label ?? ""), String(row.value ?? "")]);
        });

        const worksheet = xlsx.utils.aoa_to_sheet(sheetRows);
        const workbook = xlsx.utils.book_new();
        const sheetName = this.normalizeSheetName(viewModel?.filters?.reportType || "report");

        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

        const baseName = this.safeFileName(table?.title || "report");
        xlsx.writeFile(workbook, `${baseName}.xlsx`);
    },

    normalizeSheetName(value) {
        const name = String(value || "report").trim() || "report";
        return name.slice(0, 31);
    },

    formatMoney(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(value || 0));
    }
};
