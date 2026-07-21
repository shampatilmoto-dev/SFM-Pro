// ==========================================
// SFM PRO
// Loans Module
// Release 1.7
// Part 5A
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const saveLoanBtn = document.getElementById("saveLoanBtn");

    if (saveLoanBtn) {

        loadLoanTable();

        updateLoanSummary();

        saveLoanBtn.addEventListener("click", saveLoan);

    }

});

// ==========================================
// Save Loan
// ==========================================

function saveLoan() {

    const loanName = document.getElementById("loanName").value.trim();

    const bankName = document.getElementById("bankName").value.trim();

    const amount = Number(document.getElementById("loanAmount").value);

    const interest = Number(document.getElementById("loanInterest").value);

    const tenure = Number(document.getElementById("loanTenure").value);

    const startDate = document.getElementById("loanDate").value;

    if (

        loanName === "" ||

        bankName === "" ||

        amount <= 0 ||

        interest <= 0 ||

        tenure <= 0 ||

        startDate === ""

    ) {

        alert("Please fill all fields.");

        return;

    }

    const emi = calculateEMI(

        amount,

        interest,

        tenure

    );

    const loans = getLoans();

    loans.push({

        id: Date.now(),

        loanName,

        bank: bankName,

        amount,

        interest,

        tenure,

        emi,

        outstanding: amount,

        startDate

    });

    saveLoans(loans);

    document.getElementById("loanForm").reset();

    loadLoanTable();

    updateLoanSummary();

}

// ==========================================
// EMI Formula
// ==========================================

function calculateEMI(

    principal,

    annualRate,

    months

) {

    const r = annualRate / 12 / 100;

    const emi =

        (principal * r * Math.pow(1 + r, months)) /

        (Math.pow(1 + r, months) - 1);

    return Math.round(emi);

}// ==========================================
// Load Loan Table
// ==========================================

function escapeLegacyLoanHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split(String.fromCharCode(34)).join('&quot;')
        .replace(/'/g, '&#39;');
}

function loadLoanTable() {

    const table = document.getElementById("loanTable");

    if (!table) return;

    const loans = getLoans();

    table.innerHTML = "";

    if (loans.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="6">No Loans Found</td>
        </tr>
        `;

        return;
    }

    loans.forEach(loan => {

        table.innerHTML += `
        <tr>

            <td>${escapeLegacyLoanHtml(loan.loanName)}</td>

            <td>${escapeLegacyLoanHtml(loan.bank)}</td>

            <td>${formatCurrency(loan.amount)}</td>

            <td>${formatCurrency(loan.emi)}</td>

            <td>${formatCurrency(loan.outstanding)}</td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteLoan(${loan.id})">

                    Delete

                </button>

            </td>

        </tr>
        `;

    });

}

// ==========================================
// Delete Loan
// ==========================================

function deleteLoan(id) {

    if (!confirm("Delete this loan?")) return;

    let loans = getLoans();

    loans = loans.filter(loan => loan.id !== id);

    saveLoans(loans);

    loadLoanTable();

    updateLoanSummary();

}

// ==========================================
// Loan Summary
// ==========================================

function updateLoanSummary() {

    const loans = getLoans();

    const loanCount = document.getElementById("loanCount");

    const loanOutstanding = document.getElementById("loanOutstanding");

    const loanEMI = document.getElementById("loanEMI");

    if (loanCount)
        loanCount.innerHTML = loans.length;

    if (loanOutstanding)
        loanOutstanding.innerHTML =
            formatCurrency(getOutstandingLoans());

    if (loanEMI)
        loanEMI.innerHTML =
            formatCurrency(getMonthlyEMI());

}

// ==========================================
// Refresh Dashboard Automatically
// ==========================================

function refreshDashboard() {

    if (typeof loadDashboard === "function") {

        loadDashboard();

    }

}
