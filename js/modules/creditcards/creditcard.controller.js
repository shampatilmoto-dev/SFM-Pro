"use strict";

const CreditCardController = {
    currentCardId: null,
    cards: [],
    isInitialized: false,
    currentPage: 1,
    pageSize: 6,

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
        filter: null,
        sort: null,
        tableBody: null,
        totalLimit: null,
        usedLimit: null,
        totalOutstanding: null,
        totalAvailable: null,
        totalUtilization: null,
        dueAmount: null,
        monthlySpending: null,
        paymentStatus: null,
        rewardPoints: null,
        alertBox: null,
        dueDatesList: null,
        recentTransactionsList: null,
        analyticsList: null,
        paginationInfo: null,
        previousPage: null,
        nextPage: null,
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
        if (this.isInitialized) {
            this.loadCards();
            return;
        }

        this.cacheElements();
        this.bindEvents();
        this.loadCards();
        this.isInitialized = true;
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
        this.elements.filter = document.getElementById("creditCardFilter");
        this.elements.sort = document.getElementById("creditCardSort");
        this.elements.tableBody = document.getElementById("creditCardTableBody");
        this.elements.totalLimit = document.getElementById("creditLimitTotal");
        this.elements.usedLimit = document.getElementById("creditUsedLimitTotal");
        this.elements.totalOutstanding = document.getElementById("creditOutstandingTotal");
        this.elements.totalAvailable = document.getElementById("creditAvailableTotal");
        this.elements.totalUtilization = document.getElementById("creditUtilizationTotal");
        this.elements.dueAmount = document.getElementById("creditDueAmountTotal");
        this.elements.monthlySpending = document.getElementById("creditMonthlySpendingTotal");
        this.elements.paymentStatus = document.getElementById("creditPaymentStatusTotal");
        this.elements.rewardPoints = document.getElementById("creditRewardPointsTotal");
        this.elements.alertBox = document.getElementById("creditCardAlerts");
        this.elements.dueDatesList = document.getElementById("upcomingDueDatesList");
        this.elements.recentTransactionsList = document.getElementById("recentTransactionsList");
        this.elements.analyticsList = document.getElementById("cardAnalyticsList");
        this.elements.paginationInfo = document.getElementById("creditCardPageInfo");
        this.elements.previousPage = document.getElementById("creditCardPrevPage");
        this.elements.nextPage = document.getElementById("creditCardNextPage");
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
            this.elements.search.addEventListener("input", () => {
                this.currentPage = 1;
                this.render();
            });
        }

        if (this.elements.filter) {
            this.elements.filter.addEventListener("change", () => {
                this.currentPage = 1;
                this.render();
            });
        }

        if (this.elements.sort) {
            this.elements.sort.addEventListener("change", () => {
                this.currentPage = 1;
                this.render();
            });
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

        if (this.elements.previousPage) {
            this.elements.previousPage.addEventListener("click", () => {
                if (this.currentPage > 1) {
                    this.currentPage -= 1;
                    this.render();
                }
            });
        }

        if (this.elements.nextPage) {
            this.elements.nextPage.addEventListener("click", () => {
                this.currentPage += 1;
                this.render();
            });
        }
    },

    // Enterprise integration: route controller feedback through NotificationManager while keeping existing UI messages intact.
    notify(type, message) {
        const text = String(message || "").trim();

        if (!text) {
            return;
        }

        if (window.NotificationManager && typeof NotificationManager[type] === "function") {
            NotificationManager[type](text);
            return;
        }

        this.showMessage(text, type);
    },

    // Enterprise integration: show global loader before save/update/delete operations.
    showOperationLoader(message) {
        if (window.LoaderManager && typeof LoaderManager.show === "function") {
            LoaderManager.show(message);
        }
    },

    // Enterprise integration: always hide global loader when operations finish.
    hideOperationLoader() {
        if (window.LoaderManager && typeof LoaderManager.hide === "function") {
            LoaderManager.hide();
        }
    },

    loadCards() {
        this.cards = CreditCardService.loadCards();
        this.render();
    },

    render() {
        const query = this.elements.search?.value || "";
        const filter = this.elements.filter?.value || "all";
        const sortKey = this.elements.sort?.value || "utilization_desc";

        let results = CreditCardService.searchCards(this.cards, query);
        results = this.filterCards(results, filter);
        results = CreditCardService.sortCards(results, sortKey);

        this.renderTable(results);
        this.renderSummary(this.cards);
        this.renderAlerts(this.cards);
        this.renderTransactionOptions(this.cards);
        this.renderDueDates(this.cards);
        this.renderRecentTransactions(this.cards);
        this.renderAnalytics(this.cards);

        const selectedCardId = this.elements.transactionCardSelect?.value;
        if (selectedCardId) {
            this.renderTransactionHistory(selectedCardId);
        }
    },

    filterCards(cards, filter) {
        if (!Array.isArray(cards) || filter === "all") {
            return cards;
        }

        if (filter === "due-soon") {
            return cards.filter(card => {
                const daysUntilDue = this.getDaysUntil(card.dueDate);
                return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;
            });
        }

        if (filter === "high-utilization") {
            return cards.filter(card => Number(card.utilization || 0) >= 80);
        }

        return cards.filter(card => String(card.cardType || "") === filter);
    },

    renderTable(cards) {
        if (!this.elements.tableBody) {
            return;
        }

        const list = Array.isArray(cards) ? cards : [];
        const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
        this.currentPage = Math.min(this.currentPage, totalPages);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const pagedCards = list.slice(startIndex, startIndex + this.pageSize);

        this.renderPagination(list.length, totalPages);

        if (pagedCards.length === 0) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="10">No credit cards found.</td>
                </tr>
            `;
            return;
        }

        this.elements.tableBody.innerHTML = pagedCards
            .map(card => this.renderTableRow(card))
            .join("");
    },

    renderPagination(totalItems, totalPages) {
        if (this.elements.paginationInfo) {
            this.elements.paginationInfo.textContent = `Page ${this.currentPage} of ${totalPages} | ${totalItems} cards`;
        }

        if (this.elements.previousPage) {
            this.elements.previousPage.disabled = this.currentPage <= 1;
        }

        if (this.elements.nextPage) {
            this.elements.nextPage.disabled = this.currentPage >= totalPages;
        }
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

        // Enterprise integration: show loader before save/update starts.
        this.showOperationLoader(this.currentCardId ? "Updating credit card..." : "Saving credit card...");

        try {

            if (this.currentCardId) {
                result = CreditCardService.updateCard(this.currentCardId, card);
            } else {
                result = CreditCardService.addCard(card);
            }

            if (result && result.error) {
                this.showMessage(result.error, "error");
                this.notify("error", result.error);
                return;
            }

            const successMessage = this.currentCardId ? "Credit card updated successfully." : "Credit card added successfully.";
            this.showMessage(successMessage, "success");
            this.notify("success", successMessage);
            this.clearForm();
            this.loadCards();
            this.refreshDashboard();
        } finally {
            // Enterprise integration: hide loader in finally to guarantee cleanup.
            this.hideOperationLoader();
        }
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
            this.notify("error", "Credit card not found.");
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
        this.notify("info", "Editing credit card. Save to apply changes.");
    },

    deleteCard(id) {
        if (!window.confirm("Are you sure you want to delete this credit card?")) {
            return;
        }

        // Enterprise integration: show loader before delete starts.
        this.showOperationLoader("Deleting credit card...");

        try {

            const result = CreditCardService.deleteCard(id);
            if (result && result.error) {
                this.showMessage(result.error, "error");
                this.notify("error", result.error);
                return;
            }

            this.showMessage("Credit card deleted.", "success");
            this.notify("success", "Credit card deleted.");
            this.clearForm();
            this.loadCards();
            this.refreshDashboard();
        } finally {
            // Enterprise integration: hide loader in finally to guarantee cleanup.
            this.hideOperationLoader();
        }
    },

    renderSummary(cards) {
        const summary = CreditCardService.getSummary(cards);
        const dueAmount = this.calculateDueAmount(cards);
        const monthlySpending = this.calculateMonthlySpending(cards);
        const rewardPoints = Math.floor(monthlySpending / 100);
        const paymentStatus = this.getPaymentStatus(cards);

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

        if (this.elements.usedLimit) {
            this.elements.usedLimit.textContent = typeof formatCurrency === "function"
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

        if (this.elements.dueAmount) {
            this.elements.dueAmount.textContent = typeof formatCurrency === "function"
                ? formatCurrency(dueAmount)
                : dueAmount;
        }

        if (this.elements.monthlySpending) {
            this.elements.monthlySpending.textContent = typeof formatCurrency === "function"
                ? formatCurrency(monthlySpending)
                : monthlySpending;
        }

        if (this.elements.paymentStatus) {
            this.elements.paymentStatus.textContent = paymentStatus;
        }

        if (this.elements.rewardPoints) {
            this.elements.rewardPoints.textContent = rewardPoints.toString();
        }
    },

    calculateDueAmount(cards) {
        return (cards || []).reduce((total, card) => {
            const daysUntilDue = this.getDaysUntil(card.dueDate);
            return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7
                ? total + Number(card.outstanding || 0)
                : total;
        }, 0);
    },

    calculateMonthlySpending(cards) {
        const monthKey = this.getMonthKey(new Date());

        return this.collectTransactions(cards).reduce((total, transaction) => {
            const transactionKey = this.getMonthKey(transaction.date);
            const isSpend = ["Purchase", "EMI Conversion"].includes(transaction.transactionType);

            return transactionKey === monthKey && isSpend
                ? total + Number(transaction.amount || 0)
                : total;
        }, 0);
    },

    getPaymentStatus(cards) {
        const dueSoon = (cards || []).some(card => {
            const daysUntilDue = this.getDaysUntil(card.dueDate);
            return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3 && Number(card.outstanding || 0) > 0;
        });

        if (dueSoon) {
            return "Attention Needed";
        }

        return "On Track";
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

    renderDueDates(cards) {
        if (!this.elements.dueDatesList) {
            return;
        }

        const items = (cards || [])
            .filter(card => card.dueDate)
            .map(card => ({
                bankName: card.bankName,
                cardName: card.cardName,
                dueDate: card.dueDate,
                outstanding: Number(card.outstanding || 0),
                daysUntilDue: this.getDaysUntil(card.dueDate)
            }))
            .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))
            .slice(0, 5);

        if (items.length === 0) {
            this.elements.dueDatesList.innerHTML = `<div class="empty-state-mini">No due dates available.</div>`;
            return;
        }

        this.elements.dueDatesList.innerHTML = items.map(item => `
            <div class="mini-list-item ${item.daysUntilDue !== null && item.daysUntilDue <= 3 ? "is-warning" : ""}">
                <div>
                    <strong>${this.escapeHtml(item.bankName)} - ${this.escapeHtml(item.cardName)}</strong>
                    <span>${this.formatDate(item.dueDate)}</span>
                </div>
                <div>
                    <strong>${typeof formatCurrency === "function" ? formatCurrency(item.outstanding) : item.outstanding}</strong>
                    <span>${item.daysUntilDue === null ? "N/A" : `${item.daysUntilDue} day${item.daysUntilDue === 1 ? "" : "s"}`}</span>
                </div>
            </div>
        `).join("");
    },

    renderRecentTransactions(cards) {
        if (!this.elements.recentTransactionsList) {
            return;
        }

        const transactions = this.collectTransactions(cards)
            .sort((left, right) => new Date(right.date) - new Date(left.date))
            .slice(0, 5);

        if (transactions.length === 0) {
            this.elements.recentTransactionsList.innerHTML = `<div class="empty-state-mini">No recent transactions found.</div>`;
            return;
        }

        this.elements.recentTransactionsList.innerHTML = transactions.map(transaction => `
            <div class="mini-list-item">
                <div>
                    <strong>${this.escapeHtml(transaction.cardName || "Card Transaction")}</strong>
                    <span>${this.escapeHtml(transaction.transactionType || "Transaction")}</span>
                </div>
                <div>
                    <strong>${typeof formatCurrency === "function" ? formatCurrency(transaction.amount) : transaction.amount}</strong>
                    <span>${this.formatDate(transaction.date)}</span>
                </div>
            </div>
        `).join("");
    },

    renderAnalytics(cards) {
        if (!this.elements.analyticsList) {
            return;
        }

        const totalCards = (cards || []).length;
        const highUtilization = (cards || []).filter(card => Number(card.utilization || 0) >= 80).length;
        const dueSoon = (cards || []).filter(card => {
            const daysUntilDue = this.getDaysUntil(card.dueDate);
            return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;
        }).length;

        const items = [
            { label: "Active Cards", value: totalCards, tone: "primary" },
            { label: "High Utilization", value: highUtilization, tone: highUtilization > 0 ? "danger" : "success" },
            { label: "Upcoming Due Dates", value: dueSoon, tone: dueSoon > 0 ? "warning" : "success" }
        ];

        this.elements.analyticsList.innerHTML = items.map(item => `
            <div class="analytics-pill analytics-${item.tone}">
                <span>${this.escapeHtml(item.label)}</span>
                <strong>${this.escapeHtml(String(item.value))}</strong>
            </div>
        `).join("");
    },

    collectTransactions(cards) {
        return (cards || []).flatMap(card => CreditCardService.loadTransactions(card.id) || []);
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
            this.notify("error", result.error);
            return;
        }

        this.showTransactionMessage("Transaction recorded successfully.", "success");
        this.notify("success", "Transaction recorded successfully.");
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

    getMonthKey(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    },

    getDaysUntil(value) {
        if (!value) {
            return null;
        }

        const targetDate = new Date(`${value}T00:00:00`);

        if (Number.isNaN(targetDate.getTime())) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
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
