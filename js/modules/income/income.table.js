"use strict";

/*=========================================
 Income Table Module
=========================================*/

const IncomeTable = {

    load() {

        this.render(IncomeState.records);

    },

    render(records) {

        const tableBody =
            document.getElementById("incomeTableBody");

        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (records.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No Income Records
                    </td>
                </tr>
            `;

            return;

        }

        records.forEach(record => {

            tableBody.appendChild(
                this.createRow(record)
            );

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

    createRow(record) {

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>${this.escapeHtml(record.date)}</td>

            <td>${this.escapeHtml(record.source)}</td>

            <td>${this.escapeHtml(record.category)}</td>

            <td>${formatCurrency(record.amount)}</td>

            <td>${this.escapeHtml(record.notes || "-")}</td>

            <td>

                <button onclick="IncomeTable.edit(${record.id})">
                    Edit
                </button>

                <button onclick="IncomeTable.remove(${record.id})">
                    Delete
                </button>

            </td>

        `;

        return tr;

    },

    edit(id) {

    const record =

        IncomeState.records.find(

            item => item.id === id

        );

    if (!record) return;

    IncomeForm.load(record);

},
    remove(id) {

        if (!confirm("Delete this income?")) {

            return;

        }

        IncomeStorage.delete(id);

        IncomeController.refresh();

    }

};

console.log("✔ Income Table Loaded");
