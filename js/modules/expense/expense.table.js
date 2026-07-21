"use strict";

/*=========================================
 Expense Table
=========================================*/

const ExpenseTable = {

    load() {

        const tableBody = document.getElementById("expenseTableBody");

        if (!tableBody) return;

        tableBody.innerHTML = "";

        const expenses = ExpenseStorage.load();

        if (expenses.length === 0) {

            tableBody.innerHTML = `

<tr>

<td colspan="5" style="text-align:center;">

No expense records found.

</td>

</tr>

`;

            return;

        }

        expenses
            .sort((a, b) => b.id - a.id)
            .forEach(expense => {

                tableBody.innerHTML += this.createRow(expense);

            });

    },

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .split(String.fromCharCode(34)).join('&quot;')
            .replace(/'/g, '&#39;');
    },

    createRow(expense) {

        return `

<tr>

<td>${this.escapeHtml(expense.title)}</td>

<td>${this.escapeHtml(expense.category)}</td>

<td>₹${Number(expense.amount).toLocaleString()}</td>

<td>${this.escapeHtml(expense.date)}</td>

<td>

<button
class="delete-btn"
onclick="ExpenseTable.delete(${expense.id})">

🗑 Delete

</button>

</td>

</tr>

`;

    },

    delete(id) {

        if (!confirm("Delete this expense?")) {

            return;

        }

        ExpenseStorage.delete(id);

        this.load();

        if (typeof DashboardController !== "undefined") {

            DashboardController.refresh();

        }

    }

};

console.log("✔ Expense Table Loaded");
