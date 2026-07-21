"use strict";

/*==================================================
 SFM PRO Enterprise
 Budget State Module
 Version : 1.0
==================================================*/

const BudgetState = {

    budgets: [],

    selectedBudgetId: null,

    filters: {

        category: "All",

        search: "",

        startDate: "",

        endDate: ""

    },

    summary: {

        totalBudget: 0,

        totalUsed: 0,

        remaining: 0,

        percentage: 0

    }

};

console.log("✔ Budget State Loaded");