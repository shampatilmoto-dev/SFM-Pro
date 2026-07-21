// ==========================================
// SFM PRO Enterprise
// Expense Module v2.0
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Finance Engine Loaded");

    if (typeof loadExpenseTable === "function") {
        loadExpenseTable();
    }

    const saveBtn = document.getElementById("saveExpenseBtn");

    if (saveBtn && typeof saveExpenseRecord === "function") {
        saveBtn.addEventListener("click", saveExpenseRecord);
    }

});

// ==========================================
// Save Expense
// ==========================================

function saveExpenseRecord() {
    
    console.log("Save Button Clicked");

    const title = document.getElementById("expenseTitle").value.trim();

    const category = document.getElementById("expenseCategory").value;

    const amount = document.getElementById("expenseAmount").value;

    const date = document.getElementById("expenseDate").value;

    const notes = document.getElementById("expenseNotes").value.trim();

    // ---------------- Validation ----------------

    if (title === "") {
        alert("Please enter Expense Title.");
        return;
    }

    if (amount === "" || Number(amount) <= 0) {
        alert("Please enter valid Amount.");
        return;
    }

    if (date === "") {
        alert("Please select Date.");
        return;
    }

    // ---------------- Create Object ----------------

    const expense = {

        title: title,

        category: category,

        amount: Number(amount),

        date: date,

        notes: notes

    };

    // ---------------- Save ----------------

    createRecord("expenses", expense);

    // ---------------- Refresh ----------------

    document.getElementById("expenseForm").reset();

    loadExpenseTable();

    if (typeof synchronizeApplication === "function") {
        synchronizeApplication();
    }

    alert("Expense Saved Successfully.");

}

// ==========================================
// Load Expense Table
// ==========================================

function escapeLegacyExpenseHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split(String.fromCharCode(34)).join('&quot;')
        .replace(/'/g, '&#39;');
}

function loadExpenseTable() {

    const table = document.getElementById("expenseTable");

    if (!table) return;

    table.innerHTML = "";

    const expenseList = getExpense();

    if (!expenseList || expenseList.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No Expense Found
                </td>
            </tr>
        `;

        return;

    }

    expenseList
        .slice()
        .reverse()
        .forEach(item => {

            table.innerHTML += `
                <tr>
                    <td>${escapeLegacyExpenseHtml(item.title)}</td>
                    <td>${escapeLegacyExpenseHtml(item.category)}</td>
                    <td>${formatCurrency(item.amount)}</td>
                    <td>${escapeLegacyExpenseHtml(item.date)}</td>
                    <td>
                        <button
                            class="delete-btn"
                            onclick="deleteExpense(${item.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;

        });

}

// ==========================================
// Delete Expense
// ==========================================

function deleteExpense(id) {

    if (!confirm("Delete this expense?")) return;

    let expenseList = getExpense();

    expenseList = expenseList.filter(item => item.id !== id);

    replaceModule("expenses", expenseList);

    loadExpenseTable();

    if (typeof synchronizeApplication === "function") {
        synchronizeApplication();
    }

    alert("Expense Deleted Successfully.");

}
