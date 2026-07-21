"use strict";

const CreditCardService = {
    loadCards() {
        return CreditCardStorage.load() || [];
    },

    getCardById(id) {
        if (!id) {
            return null;
        }

        return CreditCardStorage.getById(id);
    },

    addCard(card) {
        const validation = CreditCardEngine.validateCard(card);
        if (!validation.valid) {
            return { error: validation.error };
        }

        const enhanced = CreditCardEngine.enhanceCard(card);
        const saved = CreditCardStorage.add(enhanced);

        if (!saved) {
            return { error: "Unable to save credit card." };
        }

        return { success: true, card: saved };
    },

    updateCard(id, card) {
        if (!id) {
            return { error: "Credit card ID is required." };
        }

        const validation = CreditCardEngine.validateCard(card);
        if (!validation.valid) {
            return { error: validation.error };
        }

        const enhanced = CreditCardEngine.enhanceCard(card);
        const updated = CreditCardStorage.update(id, enhanced);

        if (!updated) {
            return { error: "Unable to update credit card." };
        }

        return { success: true };
    },

    deleteCard(id) {
        if (!id) {
            return { error: "Credit card ID is required." };
        }

        const removed = CreditCardStorage.remove(id);
        if (!removed) {
            return { error: "Unable to delete credit card." };
        }

        return { success: true };
    },

    searchCards(cards, query) {
        return CreditCardEngine.searchCards(cards, query);
    },

    sortCards(cards, sortKey) {
        return CreditCardEngine.sortCards(cards, sortKey);
    },

    getSummary(cards) {
        return CreditCardEngine.calculateSummary(cards);
    },

    addTransaction(cardId, transaction) {
        if (!cardId) {
            return { error: "Credit card is required for transaction." };
        }

        const validation = CreditCardEngine.validateTransaction(transaction);
        if (!validation.valid) {
            return { error: validation.error };
        }

        const card = this.getCardById(cardId);
        if (!card) {
            return { error: "Credit card not found." };
        }

        const updatedCard = CreditCardEngine.applyTransaction(card, transaction);
        const saved = CreditCardStorage.commitTransaction(cardId, updatedCard, {
            cardId,
            bankName: card.bankName,
            cardName: card.cardName,
            transactionType: transaction.transactionType,
            amount: Number(transaction.amount || 0),
            date: transaction.date,
            notes: transaction.notes || ""
        });

        if (!saved) {
            return { error: "Unable to save credit card transaction." };
        }

        return { success: true, transaction: saved };
    },

    loadTransactions(cardId) {
        return CreditCardStorage.loadTransactions(cardId);
    },

    getAlerts(cards) {
        return CreditCardEngine.getAlerts(cards);
    }
};

console.log("✔ Credit Card Service Loaded");
