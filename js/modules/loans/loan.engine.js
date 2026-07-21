
"use strict";

const LoanEngine = {
    calculateEMI(principal, annualRate, months) {
        const p = Number(principal || 0);
        const r = Number(annualRate || 0) / 12 / 100;
        const n = Number(months || 0);

        if (n <= 0 || isNaN(p) || isNaN(r)) {
            return 0;
        }

        if (r === 0) {
            return Number((p / n).toFixed(2));
        }

        const emi = (p * r * Math.pow(1 + r, n)) /
            (Math.pow(1 + r, n) - 1);

        return Number(emi.toFixed(2));
    },

    validateLoan(loan) {
        const errors = [];

        if (!loan || typeof loan !== "object") {
            errors.push("Loan data is invalid.");
            return { valid: false, errors };
        }

        if (!loan.loanName || String(loan.loanName).trim() === "") {
            errors.push("Loan Name is required.");
        }

        if (!loan.bank || String(loan.bank).trim() === "") {
            errors.push("Bank Name is required.");
        }

        if (!loan.amount || Number(loan.amount) <= 0) {
            errors.push("Loan Amount must be greater than zero.");
        }

        if (!loan.interest || Number(loan.interest) <= 0) {
            errors.push("Interest Rate must be greater than zero.");
        }

        if (!loan.tenure || Number(loan.tenure) <= 0) {
            errors.push("Tenure must be greater than zero.");
        }

        if (!loan.startDate || String(loan.startDate).trim() === "") {
            errors.push("Start Date is required.");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    calculateLoan(loan) {
        const amount = Number(loan.amount || 0);
        const interest = Number(loan.interest || 0);
        const tenure = Number(loan.tenure || 0);

        const emi = this.calculateEMI(amount, interest, tenure);
        const outstanding = Number(
            loan.outstanding != null ? loan.outstanding : amount
        );

        return {
            ...loan,
            amount,
            interest,
            tenure,
            emi,
            outstanding,
            status: outstanding <= 0 ? "Closed" : "Active",
            updatedAt: new Date().toISOString()
        };
    },

    getLoanSummary(loans) {
        if (!Array.isArray(loans)) {
            return {
                totalLoans: 0,
                totalOutstanding: 0,
                totalEMI: 0
            };
        }

        const totalOutstanding = loans.reduce(
            (sum, loan) => sum + Number(loan.outstanding || 0),
            0
        );

        const totalEMI = loans.reduce(
            (sum, loan) => sum + Number(loan.emi || 0),
            0
        );

        return {
            totalLoans: loans.length,
            totalOutstanding,
            totalEMI
        };
    }
};
