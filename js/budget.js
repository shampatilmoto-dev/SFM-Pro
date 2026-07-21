// ==========================================
// SFM PRO Enterprise v3.5 Stable
// Budget Planner
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadBudgets();

    const btn = document.getElementById("saveBudgetBtn");

    if (btn) {
        btn.addEventListener("click", saveBudget);
    }

});

// ==========================================
// Save Budget
// ==========================================

function saveBudget() {

    const category =
        document.getElementById("budgetCategory").value;

    const amount =
        Number(document.getElementById("budgetAmount").value);

    if (amount <= 0) {

        alert("Please enter a valid budget amount.");

        return;

    }

    addBudget({

        id: Date.now(),

        category,

        amount

    });

    clearBudgetForm();

    loadBudgets();

    // Refresh dashboard only if available
    if (typeof refreshDashboard === "function") {
        refreshDashboard();
    }

    alert("Budget Saved Successfully.");

}

// ==========================================
// Load Budgets
// ==========================================

function loadBudgets() {

    const budgets = getBudgets();

    loadBudgetSummary(budgets);

    loadBudgetTable(budgets);

}

// ==========================================
// Budget Summary
// ==========================================

function loadBudgetSummary(list) {

    let totalBudget = 0;

    let totalSpent = 0;

    const expenses = getExpense();

    list.forEach(budget => {

        totalBudget += Number(budget.amount);

        const spent = expenses
            .filter(exp => exp.category === budget.category)
            .reduce((sum, exp) => sum + Number(exp.amount), 0);

        totalSpent += spent;

    });

    const remaining = totalBudget - totalSpent;

    const usage = totalBudget > 0
        ? Math.round((totalSpent / totalBudget) * 100)
        : 0;

    const totalBudgetCard =
        document.getElementById("totalBudget");

    const totalSpentCard =
        document.getElementById("totalSpent");

    const remainingCard =
        document.getElementById("remainingBudget");

    const usageCard =
        document.getElementById("budgetUsage");

    if (totalBudgetCard)
        totalBudgetCard.innerHTML = formatCurrency(totalBudget);

    if (totalSpentCard)
        totalSpentCard.innerHTML = formatCurrency(totalSpent);

    if (remainingCard)
        remainingCard.innerHTML = formatCurrency(remaining);

    if (usageCard)
        usageCard.innerHTML = usage + "%";

}

// ==========================================
// Budget Table
// ==========================================

function escapeLegacyBudgetHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split(String.fromCharCode(34)).join('&quot;')
        .replace(/'/g, '&#39;');
}

function loadBudgetTable(list) {

    const table =
        document.getElementById("budgetTable");

    if (!table)
        return;

    table.innerHTML = "";

    if (list.length === 0) {

        table.innerHTML = `

<tr>
<td colspan="6">
No Budget Added
</td>
</tr>

`;

        return;

    }

    const expenses = getExpense();

    list.forEach(item => {

        const spent = expenses
            .filter(exp => exp.category === item.category)
            .reduce((sum, exp) => sum + Number(exp.amount), 0);

        const remaining =
            Number(item.amount) - spent;

        const status =
            remaining >= 0
                ? "Within Budget"
                : "Over Budget";

        const color =
            remaining >= 0
                ? "#16a34a"
                : "#dc2626";

        table.innerHTML += `

<tr>

<td>${escapeLegacyBudgetHtml(item.category)}</td>

<td>${formatCurrency(item.amount)}</td>

<td>${formatCurrency(spent)}</td>

<td style="color:${color};font-weight:bold;">
${formatCurrency(remaining)}
</td>

<td style="color:${color};font-weight:bold;">
${status}
</td>

<td>

<button
class="delete-btn"
onclick="deleteBudget(${item.id})">

Delete

</button>

</td>

</tr>

`;

    });

}

// ==========================================
// Delete Budget
// ==========================================

function deleteBudget(id) {

    if (!confirm("Delete this budget?"))
        return;

    const list =
        getBudgets().filter(item => item.id !== id);

    saveBudgets(list);

    loadBudgets();

}

// ==========================================
// Clear Form
// ==========================================

function clearBudgetForm() {

    document.getElementById("budgetAmount").value = "";

}

// ==========================================
// Refresh
// ==========================================

function refreshBudget() {

    loadBudgets();

}
