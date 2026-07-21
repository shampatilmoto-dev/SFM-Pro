"use strict";

/*=========================================
 Income Form Module
=========================================*/

const IncomeForm = {

    initialize() {

        const saveButton = document.getElementById("saveIncomeBtn");

        if (!saveButton) return;

        saveButton.addEventListener("click", () => {

            this.save();

        });

    },

    load(record) {

        document.getElementById("incomeDate").value =
            record.date;

        document.getElementById("incomeSource").value =
            record.source;

        document.getElementById("incomeCategory").value =
            record.category;

        document.getElementById("incomeAmount").value =
            record.amount;

        document.getElementById("incomeNotes").value =
            record.notes || "";

        IncomeState.selectedId = record.id;

    },

    save() {

        const date =
            document.getElementById("incomeDate")?.value;

        const source =
            document.getElementById("incomeSource")?.value.trim();

        const category =
            document.getElementById("incomeCategory")?.value;

        const amount =
            Number(document.getElementById("incomeAmount")?.value);

        const notes =
            document.getElementById("incomeNotes")?.value.trim();

        if (!date || !source || !category || amount <= 0) {

            alert("Please fill all required fields.");

            return;

        }

        const income = {

            id: IncomeState.selectedId || Date.now(),

            date,

            source,

            category,

            amount,

            notes

        };

        if (IncomeState.selectedId) {

            IncomeStorage.update(

                IncomeState.selectedId,

                income

            );

            alert("Income Updated Successfully.");

        } else {

            IncomeStorage.add(income);

            alert("Income Saved Successfully.");

        }

        IncomeState.selectedId = null;

        document.getElementById("incomeForm")?.reset();

        IncomeController.refresh();

    }

};

console.log("✔ Income Form Loaded");