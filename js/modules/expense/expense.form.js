"use strict";

/*=========================================
 Expense Form
=========================================*/

const ExpenseForm = {

    initialize() {

        console.log("✔ Expense Form Loaded");

        const saveButton = document.getElementById("saveExpenseBtn");

        if (!saveButton) {

            console.error("❌ Save Expense Button Not Found");

            return;

        }

        saveButton.addEventListener("click", () => {

            this.saveExpense();

        });

    },

    saveExpense() {

        const title = document.getElementById("expenseTitle")?.value.trim();
        const category = document.getElementById("expenseCategory")?.value;
        const amount = parseFloat(document.getElementById("expenseAmount")?.value);
        const date = document.getElementById("expenseDate")?.value;
        const notes = document.getElementById("expenseNotes")?.value.trim();

        if (!title || !category || !amount || !date) {

            alert("Please fill all required fields.");

            return;

        }

        const expense = {

            id: Date.now(),

            title,

            category,

            amount,

            date,

            notes

        };

        ExpenseStorage.add(expense);

        alert("Expense Saved Successfully.");

        document.getElementById("expenseForm").reset();

        if (typeof ExpenseController !== "undefined") {

            ExpenseController.refresh();

        }

    }

};

console.log("✔ Expense Form Loaded");