"use strict";

/*==================================================
 SFM PRO Enterprise v5.0 Production Release
 Router
==================================================*/

const Router = {

    page: "",

    initialize() {

        this.page =
            document.body.dataset.page || "";

        console.log("Current Page :", this.page);

        switch (this.page) {

            case "dashboard":

                if (typeof DashboardController !== "undefined") {

                    DashboardController.initialize();

                }

                break;

            case "income":

                if (typeof IncomeController !== "undefined") {

                    IncomeController.initialize();

                }

                break;

            case "expense":

                if (typeof ExpenseController !== "undefined") {

                    ExpenseController.initialize();

                }

                break;

            case "budget":

                if (typeof BudgetController !== "undefined") {

                    BudgetController.initialize();

                }

                break;

            case "loans":

                if (typeof LoanController !== "undefined") {

                    LoanController.initialize();

                }

                break;

            case "investments":

                if (typeof InvestmentController !== "undefined") {

                    InvestmentController.initialize();

                }

                break;

            default:

                console.log("No controller found.");

        }

    }

};

console.log("âœ” Router Loaded");

