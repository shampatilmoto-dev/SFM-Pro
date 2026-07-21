"use strict";

const CreditCardController = {
    currentCardId: null,
    cards: [],

    elements: {
        form: null,
        bankName: null,
        cardName: null,
        cardType: null,
        creditLimit: null,
        outstandingAmount: null,
        interestRate: null,
        billingDate: null,
        dueDate: null,
        annualFee: null,
        notes: null,
        saveButton: null,
        messageBox: null,
        search: null,
        sort: null,
        tableBody: null,
        totalLimit: null,
        totalOutstanding: null,
        totalAvailable: null,
        totalUtilization: null,
        alertBox: null,
        transactionForm: null,
        transactionCardSelect: null,
        transactionType: null,
        transactionAmount: null,
        transactionDate: null,
        transactionNotes: null,
        transactionMessage: null,
        transactionTableBody: null
    },

    initialize() {
        this.cacheElements();
        this.bindEvents();
        this.loadCards();
    },

    cacheElements() {
        this.elements.form = document.getElementById("creditCardForm");
        this.elements.bankName = document.getElementById("bankName");
        this.elements.cardName = document.getElementById("cardName");
        this.elements.cardType = document.getElementById("cardType");
        this.elements.creditLimit = document.getElementById("creditLimit");
        this.elements.outstandingAmount = document.getElementById("outstandingAmount");
        this.elements.interestRate = document.getElementById("interestRate");
        this.elements.billingDate = document.getElementById("billingDate");
        this.elements.dueDate = document.getElementById("dueDate");
        this.elements.annualFee = document.getElementById("annualFee");
        this.elements.notes = document.getElementById("cardNotes");
        this.elements.saveButton = document.getElementById("saveCreditCardBtn");
        this.elements.messageBox = document.getElementById("creditCardMessage");
        this.elements.search = document.getElementById("creditCardSearch");
        this.elements.sort = document.getElementById("creditCardSort");
        this.elements.tableBody = document.getElementById("creditCardTableBody");
        this.elements.totalLimit = document.getElementById("creditLimitTotal");
        this.elements.totalOutstanding = document.getElementById("creditOutstandingTotal");
        this.elements.totalAvailable = document.getElementById("creditAvailableTotal");
        this.elements.totalUtilization = document.getElementById("creditUtilizationTotal");
        this.elements.alertBox = document.getElementById("creditCardAlerts");
        this.elements.transactionForm = document.getElementById("creditCardTransactionForm");
        this.elements.transactionCardSelect = document.getElementById("transactionCardSelect");
        this.elements.transactionType = document.getElementById("transactionType");
        this.elements.transactionAmount = document.getElementById("transactionAmount");
        this.elements.transactionDate = document.getElementById("transactionDate");
        this.elements.transactionNotes = document.getElementById("transactionNotes");
        this.elements.transactionMessage = document.getElementById("transactionMessage");
        this.elements.transactionTableBody = document.getElementById("creditCardTransactionTableBody");
    },

    bindEvents() {
        if (this.elements.form) {
            this.elements.form.addEventListener("submit", event => {
                event.preventDefault();
                this.handleSave();
            });
        }

        if (this.elements.transactionForm) {
            this.elements.transactionForm.addEventListener("submit", event => {
                event.preventDefault();
                this.handleTransactionSave();
            });
        }

        if (this.elements.search) {
            this.elements.search.addEventListener("input", () => this.render());
        }

        if (this.elements.sort) {
            this.elements.sort.addEventListener("change", () => this.render());
        }

        if (this.elements.transactionCardSelect) {
            this.elements.transactionCardSelect.addEventListener("change", () => {
                this.renderTransactionHistory(this.elements.transactionCardSelect.value);
            });
        }

        if (this.elements.tableBody) {
            this.elements.tableBody.addEventListener("click", event => {
                const button = event.target.closest("button[data-action]");
                if (!button) {
                    return;
                }

                const action = button.dataset.action;
                const id = button.dataset.id;

                if (action === "edit") {
                    this.editCard(id);
                    return;
                }

                if (action === "delete") {
                    this.deleteCard(id);
                }
            });
        }
    },

    loadCards() {
        this.cards = CreditCardService.loadCards();
        this.render();
    },

    render() {
        const query = this.elements.search?.value || "";
        const sortKey = this.elements.sort?.value || "utilization_desc";

        let results = CreditCardService.searchCards(this.cards, query);
        results = CreditCardService.sortCards(results, sortKey);

        this.renderTable(results);
        this.renderSummary(this.cards);
        this.renderAlerts(this.cards);
        this.renderTransactionOptions(this.cards);

        const selectedCardId = this.elements.transactionCardSelect?.value;
        if (selectedCardId) {
            this.renderTransactionHistory(selectedCardId);
        }
    },

    renderTable(cards) {
        if (!this.elements.tableBody) {
            return;
        }

        if (!Array.isArray(cards) || cards.length === 0) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="10">No credit cards found.</td>
                </tr>
            `;
            return;
        }

        this.elements.tableBody.innerHTML = cards
            .map(card => this.renderTableRow(card))
            .join("");
    },

    renderTableRow(card) {
        return `
            <tr class="${card.status}">
                <td>${this.escapeHtml(card.bankName)}</td>
                <td>${this.escapeHtml(card.cardName)}</td>
                <td>${this.escapeHtml(card.cardType)}</td>
                <td>${typeof formatCurrency === "function" ? formatCurrency(card.limit) : card.limit}</td>
                <td>${typeof formatCurrency === "function" ? formatCurrency(card.outstanding) : card.outstanding}</td>
                <td>${typeof formatCurrency === "function" ? formatCurrency(card.availableLimit) : card.availableLimit}</td>
                <td>${Number(card.utilization || 0).toFixed(2)}%</td>
                <td>${this.formatDate(card.billingDate)}</td>
                <td>${this.formatDate(card.dueDate)}</td>
                <td>
                    <button type="button" data-action="edit" data-id="${card.id}">Edit</button>
                    <button type="button" data-action="delete" data-id="${card.id}">Delete</button>
                </td>
            </tr>
        `;
    },

    handleSave() {
        const card = this.getFormData();
        let result;

        if (this.currentCardId) {
            result = CreditCardService.updateCard(this.currentCardId, card);
        } else {
            result = CreditCardService.addCard(card);
        }

        if (result && result.error) {
            this.showMessage(result.error, "error");
            return;
        }

        this.showMessage(this.currentCardId ? "Credit card updated successfully." : "Credit card added successfully.", "success");
        this.clearForm();
        this.loadCards();
        this.refreshDashboard();
    },

    getFormData() {
        return {
            bankName: this.elements.bankName?.value.trim() || "",
            cardName: this.elements.cardName?.value.trim() || "",
            cardType: this.elements.cardType?.value || "",
            limit: Number(this.elements.creditLimit?.value || 0),
            outstanding: Number(this.elements.outstandingAmount?.value || 0),
            interestRate: Number(this.elements.interestRate?.value || 0),
            billingDate: this.elements.billingDate?.value || "",
            dueDate: this.elements.dueDate?.value || "",
            annualFee: Number(this.elements.annualFee?.value || 0),
            notes: this.elements.notes?.value.trim() || ""
        };
    },

    editCard(id) {
        const card = CreditCardService.getCardById(id);
        if (!card) {
            this.showMessage("Credit card not found.", "error");
            return;
        }

        this.currentCardId = id;
        this.elements.bankName.value = card.bankName || "";
        this.elements.cardName.value = card.cardName || "";
        this.elements.cardType.value = card.cardType || "";
        this.elements.creditLimit.value = card.limit || "";
        this.elements.outstandingAmount.value = card.outstanding || "";
        this.elements.interestRate.value = card.interestRate || "";
        this.elements.billingDate.value = card.billingDate || "";
        this.elements.dueDate.value = card.dueDate || "";
        this.elements.annualFee.value = card.annualFee || "";
        this.elements.notes.value = card.notes || "";
        this.elements.saveButton.textContent = "Update Card";
        this.showMessage("Editing credit card. Save to apply changes.", "info");
    },

    deleteCard(id) {
        if (!window.confirm("Are you sure you want to delete this credit card?")) {
            return;
        }

        const result = CreditCardService.deleteCard(id);
        if (result && result.error) {
            this.showMessage(result.error, "error");
            return;
        }

        this.showMessage("Credit card deleted.", "success");
        this.clearForm();
        this.loadCards();
        this.refreshDashboard();
    },

    renderSummary(cards) {
        const summary = CreditCardService.getSummary(cards);

        if (this.elements.totalLimit) {
            this.elements.totalLimit.textContent = typeof formatCurrency === "function"
                ? formatCurrency(summary.totalCreditLimit)
                : summary.totalCreditLimit;
        }

        if (this.elements.totalOutstanding) {
            this.elements.totalOutstanding.textContent = typeof formatCurrency === "function"
                ? formatCurrency(summary.totalOutstanding)
                : summary.totalOutstanding;
        }

        if (this.elements.totalAvailable) {
            this.elements.totalAvailable.textContent = typeof formatCurrency === "function"
                ? formatCurrency(summary.availableCredit)
                : summary.availableCredit;
        }

        if (this.elements.totalUtilization) {
            this.elements.totalUtilization.textContent = `${Number(summary.utilization || 0).toFixed(2)}%`;
        }
    },

    renderAlerts(cards) {
        if (!this.elements.alertBox) {
            return;
        }

        const alerts = CreditCardService.getAlerts(cards);

        if (!alerts || alerts.length === 0) {
            this.elements.alertBox.style.display = "none";
            this.elements.alertBox.innerHTML = "";
            return;
        }

        this.elements.alertBox.style.display = "block";
        this.elements.alertBox.innerHTML = alerts
            .map(alert => `<div class="alert-item">${this.escapeHtml(alert)}</div>`)
            .join("");
    },

    renderTransactionOptions(cards) {
        if (!this.elements.transactionCardSelect) {
            return;
        }

        const selectedValue = this.elements.transactionCardSelect.value || "";
        const options = [`
            <option value="">Choose a card</option>
        `].concat(
            cards.map(card => `
                <option value="${card.id}">${this.escapeHtml(card.bankName)} - ${this.escapeHtml(card.cardName)}</option>
            `)
        );

        this.elements.transactionCardSelect.innerHTML = options.join("");
        if (selectedValue) {
            this.elements.transactionCardSelect.value = selectedValue;
        }
    },

    renderTransactionHistory(cardId) {
        if (!this.elements.transactionTableBody) {
            return;
        }

        if (!cardId) {
            this.elements.transactionTableBody.innerHTML = `
                <tr>
                    <td colspan="5">Select a card to view transactions.</td>
                </tr>
            `;
            return;
        }

        const transactions = CreditCardService.loadTransactions(cardId);

        if (!Array.isArray(transactions) || transactions.length === 0) {
            this.elements.transactionTableBody.innerHTML = `
                <tr>
                    <td colspan="5">No transactions found.</td>
                </tr>
            `;
            return;
        }

        this.elements.transactionTableBody.innerHTML = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(tx => `
                <tr>
                    <td>${this.formatDate(tx.date)}</td>
                    <td>${this.escapeHtml(tx.cardName || "")}</td>
                    <td>${this.escapeHtml(tx.transactionType || "")}</td>
                    <td>${typeof formatCurrency === "function" ? formatCurrency(tx.amount) : tx.amount}</td>
                    <td>${this.escapeHtml(tx.notes || "")}</td>
                </tr>
            `)
            .join("");
    },

    handleTransactionSave() {
        const cardId = this.elements.transactionCardSelect?.value;
        const transaction = {
            transactionType: this.elements.transactionType?.value || "",
            amount: Number(this.elements.transactionAmount?.value || 0),
            date: this.elements.transactionDate?.value || "",
            notes: this.elements.transactionNotes?.value.trim() || ""
        };

        const result = CreditCardService.addTransaction(cardId, transaction);
        if (result && result.error) {
            this.showTransactionMessage(result.error, "error");
            return;
        }

        this.showTransactionMessage("Transaction recorded successfully.", "success");
        this.clearTransactionForm();
        this.loadCards();
        this.renderTransactionHistory(cardId);
        this.refreshDashboard();
    },

    clearForm() {
        if (this.elements.form) {
            this.elements.form.reset();
        }

        this.currentCardId = null;

        if (this.elements.saveButton) {
            this.elements.saveButton.textContent = "Save Card";
        }
    },

    clearTransactionForm() {
        if (this.elements.transactionForm) {
            this.elements.transactionForm.reset();
        }
    },

    showMessage(message, type = "info") {
        if (!this.elements.messageBox) {
            return;
        }

        this.elements.messageBox.textContent = message;
        this.elements.messageBox.className = `message-box ${type}`;
    },

    showTransactionMessage(message, type = "info") {
        if (!this.elements.transactionMessage) {
            return;
        }

        this.elements.transactionMessage.textContent = message;
        this.elements.transactionMessage.className = `message-box ${type}`;
    },

    formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return this.escapeHtml(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    },

    refreshDashboard() {
        if (typeof DashboardController !== "undefined" && typeof DashboardController.refresh === "function") {
            DashboardController.refresh();
            return;
        }

        if (typeof refreshDashboard === "function") {
            refreshDashboard();
        }
    },

    escapeHtml(value) {
        if (typeof value !== "string") {
            return value || "";
        }

        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

console.log("✔ Credit Card Controller Loaded");
