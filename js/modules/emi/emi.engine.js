"use strict";

const EMIEngine = {
	toAmount(value) {
		const amount = Number(value);
		return Number.isFinite(amount) ? amount : 0;
	},

	validateEMI(emi) {
		if (!emi || typeof emi !== "object") {
			return { valid: false, error: "Invalid EMI data." };
		}

		if (!String(emi.name || "").trim()) {
			return { valid: false, error: "EMI name is required." };
		}

		if (this.toAmount(emi.monthlyAmount) <= 0) {
			return { valid: false, error: "Monthly EMI must be greater than zero." };
		}

		if (this.toAmount(emi.totalAmount) <= 0) {
			return { valid: false, error: "Total amount must be greater than zero." };
		}

		if (this.toAmount(emi.paidAmount) < 0 ||
			this.toAmount(emi.paidAmount) > this.toAmount(emi.totalAmount)) {
			return { valid: false, error: "Paid amount must be between zero and the total amount." };
		}

		if (!emi.dueDate) {
			return { valid: false, error: "Due date is required." };
		}

		return { valid: true };
	},

	normalizeEMI(emi) {
		const totalAmount = this.toAmount(emi.totalAmount);
		const paidAmount = this.toAmount(emi.paidAmount);

		return {
			...emi,
			name: String(emi.name || "").trim(),
			monthlyAmount: this.toAmount(emi.monthlyAmount),
			totalAmount,
			paidAmount,
			outstandingAmount: Math.max(totalAmount - paidAmount, 0),
			status: paidAmount >= totalAmount ? "Paid" : "Pending"
		};
	},

	calculateSummary(records) {
		const list = Array.isArray(records) ? records : [];

		return list.reduce((summary, record) => {
			const emi = this.normalizeEMI(record);

			summary.monthlyEMI += emi.monthlyAmount;
			summary.totalPaid += emi.paidAmount;
			summary.pendingAmount += emi.outstandingAmount;
			summary.totalOutstanding += emi.outstandingAmount;

			return summary;
		}, {
			monthlyEMI: 0,
			totalPaid: 0,
			pendingAmount: 0,
			totalOutstanding: 0
		});
	},

	search(records, query) {
		if (!Array.isArray(records)) {
			return [];
		}

		const normalizedQuery = String(query || "").trim().toLowerCase();

		if (!normalizedQuery) {
			return records;
		}

		return records.filter(record => {
			return [record.name, record.status, record.dueDate]
				.some(value => String(value || "").toLowerCase().includes(normalizedQuery));
		});
	}
};