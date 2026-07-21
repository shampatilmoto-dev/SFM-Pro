"use strict";

const CreditCardEngine = {
    validateCard(card) {
        const errors = [];

        if (!card || typeof card !== "object") {
            return { valid: false, error: "Invalid credit card data." };
        }

        if (!card.bankName || card.bankName.trim() === "") {
            errors.push("Bank Name is required.");
        }

        if (!card.cardName || card.cardName.trim() === "") {
            errors.push("Card Name is required.");
        }

        if (!card.cardType || card.cardType.trim() === "") {
            errors.push("Card Type is required.");
        }

        if (isNaN(Number(card.limit)) || Number(card.limit) <= 0) {
            errors.push("Credit Limit must be greater than zero.");
        }

        if (isNaN(Number(card.outstanding)) || Number(card.outstanding) < 0) {
            errors.push("Outstanding amount must be zero or more.");
        }

        if (!card.billingDate || card.billingDate.trim() === "") {
            errors.push("Billing Date is required.");
        }

        if (!card.dueDate || card.dueDate.trim() === "") {
            errors.push("Due Date is required.");
        }

        if (errors.length > 0) {
            return { valid: false, error: errors.join(" ") };
        }

        return { valid: true };
    },

    validateTransaction(transaction) {
        const errors = [];

        if (!transaction || typeof transaction !== "object") {
            return { valid: false, error: "Invalid transaction data." };
        }

        if (!transaction.transactionType || transaction.transactionType.trim() === "") {
            errors.push("Transaction type is required.");
        }

        if (isNaN(Number(transaction.amount)) || Number(transaction.amount) <= 0) {
            errors.push("Transaction amount must be greater than zero.");
        }

        if (!transaction.date || transaction.date.trim() === "") {
            errors.push("Transaction date is required.");
        }

        if (errors.length > 0) {
            return { valid: false, error: errors.join(" ") };
        }

        return { valid: true };
    },

    enhanceCard(card) {
        const limit = Number(card.limit || 0);
        const outstanding = Number(card.outstanding || 0);
        const availableLimit = Math.max(limit - outstanding, 0);
        const utilization = limit > 0 ? Number(((outstanding / limit) * 100).toFixed(2)) : 0;

        return {
            ...card,
            limit: Number(limit),
            outstanding: Number(outstanding),
            availableLimit,
            utilization,
            status: this.getCardStatus(utilization)
        };
    },

    applyTransaction(card, transaction) {
        const amount = Number(transaction.amount || 0);
        let outstanding = Number(card.outstanding || 0);

        switch (transaction.transactionType) {
            case "Purchase":
                outstanding += amount;
                break;
            case "Payment":
            case "Refund":
                outstanding = Math.max(outstanding - amount, 0);
                break;
            case "EMI Conversion":
                outstanding = outstanding;
                break;
            default:
                outstanding = outstanding;
        }

        return this.enhanceCard({
            ...card,
            outstanding
        });
    },

    calculateSummary(cards) {
        const enhancedCards = Array.isArray(cards)
            ? cards.map(card => this.enhanceCard(card))
            : [];

        const totalCreditLimit = enhancedCards.reduce((sum, card) => sum + Number(card.limit || 0), 0);
        const totalOutstanding = enhancedCards.reduce((sum, card) => sum + Number(card.outstanding || 0), 0);
        const availableCredit = enhancedCards.reduce((sum, card) => sum + Number(card.availableLimit || 0), 0);
        const utilization = totalCreditLimit > 0
            ? Number(((totalOutstanding / totalCreditLimit) * 100).toFixed(2))
            : 0;

        return {
            totalCreditLimit,
            totalOutstanding,
            availableCredit,
            utilization
        };
    },

    getCardStatus(utilization) {
        if (utilization > 70) {
            return "creditcard-high";
        }

        if (utilization >= 30) {
            return "creditcard-medium";
        }

        return "creditcard-safe";
    },

    getAlerts(cards) {
        const alerts = [];
        const now = new Date();

        (cards || []).forEach(card => {
            const outstanding = Number(card.outstanding || 0);
            const utilization = Number(card.utilization || 0);

            if (outstanding > 0 && card.dueDate) {
                const dueDate = new Date(card.dueDate);
                const dueDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

                if (dueDays >= 0 && dueDays <= 5) {
                    alerts.push(`Payment due for ${card.cardName} in ${dueDays} day${dueDays === 1 ? "" : "s"}.`);
                }
            }

            if (card.billingDate) {
                const billingDate = new Date(card.billingDate);
                const billingDays = Math.ceil((billingDate - now) / (1000 * 60 * 60 * 24));

                if (billingDays >= 0 && billingDays <= 7) {
                    alerts.push(`Billing reminder for ${card.cardName} in ${billingDays} day${billingDays === 1 ? "" : "s"}.`);
                }
            }

            if (utilization >= 80) {
                alerts.push(`Credit limit warning for ${card.cardName}: utilization at ${utilization}%`);
            }
        });

        return [...new Set(alerts)];
    },

    searchCards(cards, query) {
        if (!Array.isArray(cards)) {
            return [];
        }

        if (!query || typeof query !== "string" || query.trim() === "") {
            return cards.map(card => this.enhanceCard(card));
        }

        const normalized = query.trim().toLowerCase();

        return cards
            .filter(card => {
                return [
                    card.bankName,
                    card.cardName,
                    card.cardType,
                    String(card.limit),
                    String(card.outstanding),
                    card.notes
                ]
                    .filter(Boolean)
                    .some(value => value.toString().toLowerCase().includes(normalized));
            })
            .map(card => this.enhanceCard(card));
    },

    sortCards(cards, sortKey) {
        if (!Array.isArray(cards)) {
            return [];
        }

        const copy = [...cards].map(card => this.enhanceCard(card));

        switch (sortKey) {
            case "limit_asc":
                return copy.sort((a, b) => Number(a.limit) - Number(b.limit));
            case "limit_desc":
                return copy.sort((a, b) => Number(b.limit) - Number(a.limit));
            case "outstanding_asc":
                return copy.sort((a, b) => Number(a.outstanding) - Number(b.outstanding));
            case "outstanding_desc":
                return copy.sort((a, b) => Number(b.outstanding) - Number(a.outstanding));
            case "utilization_asc":
                return copy.sort((a, b) => Number(a.utilization) - Number(b.utilization));
            case "utilization_desc":
            default:
                return copy.sort((a, b) => Number(b.utilization) - Number(a.utilization));
        }
    }
};

console.log("✔ Credit Card Engine Loaded");
