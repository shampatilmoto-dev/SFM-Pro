"use strict";

const CreditCardStorage = {
    moduleName: "creditcards",
    transactionModule: "transactions",

    load() {
        if (typeof loadDatabase === "function") {
            loadDatabase();
        }

        return typeof getAllRecords === "function"
            ? getAllRecords(this.moduleName)
            : [];
    },

    getById(id) {
        return typeof getRecordById === "function"
            ? getRecordById(this.moduleName, id)
            : null;
    },

    add(card) {
        if (!card || typeof card !== "object") {
            return null;
        }

        return typeof createRecord === "function"
            ? createRecord(this.moduleName, card)
            : null;
    },

    update(id, card) {
        return typeof updateRecord === "function"
            ? updateRecord(this.moduleName, id, card)
            : false;
    },

    remove(id) {
        return typeof deleteRecord === "function"
            ? deleteRecord(this.moduleName, id)
            : false;
    },

    loadTransactions(cardId) {
        if (typeof loadDatabase === "function") {
            loadDatabase();
        }

        if (typeof getAllRecords !== "function") {
            return [];
        }

        return getAllRecords(this.transactionModule)
            .filter(record => record && record.cardId === cardId);
    },

    addTransaction(transaction) {
        if (!transaction || typeof transaction !== "object") {
            return null;
        }

        return typeof createRecord === "function"
            ? createRecord(this.transactionModule, transaction)
            : null;
    },

    commitTransaction(cardId, updatedCard, transaction) {
        if (!cardId || !updatedCard || !transaction ||
            typeof getAllRecords !== "function" ||
            typeof generateId !== "function" ||
            typeof saveDatabase !== "function") {
            return null;
        }

        const cards = getAllRecords(this.moduleName);
        const cardIndex = cards.findIndex(card => card.id == cardId);

        if (cardIndex === -1) {
            return null;
        }

        const transactions = getAllRecords(this.transactionModule);
        const timestamp = new Date().toISOString();
        const savedTransaction = {
            id: generateId(),
            createdAt: timestamp,
            updatedAt: timestamp,
            ...transaction
        };
        const previousCards = database[this.moduleName];
        const previousTransactions = database[this.transactionModule];
        const previousMetadata = { ...database.metadata };

        database[this.moduleName] = cards.map((card, index) =>
            index === cardIndex
                ? {
                    ...card,
                    ...updatedCard,
                    updatedAt: timestamp
                }
                : card
        );
        database[this.transactionModule] = [...transactions, savedTransaction];

        try {
            const saved = saveDatabase();
            if (!saved?.success) {
                throw new Error("Credit card transaction storage failed.");
            }
            if (typeof queueFirebaseSynchronization === "function") {
                queueFirebaseSynchronization(this.moduleName, "update", database[this.moduleName][cardIndex]);
                queueFirebaseSynchronization(this.transactionModule, "create", savedTransaction);
            }
            return savedTransaction;
        } catch (error) {
            database[this.moduleName] = previousCards;
            database[this.transactionModule] = previousTransactions;
            database.metadata = previousMetadata;
            return null;
        }
    }
};

console.log("✔ Credit Card Storage Loaded");
