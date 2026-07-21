"use strict";

/*=========================================
 Income Search Module
=========================================*/

const IncomeSearch = {

    initialize() {

        const searchBox =
            document.getElementById("incomeSearch");

        const categoryFilter =
            document.getElementById("incomeFilter");

        if (searchBox) {

            searchBox.addEventListener(
                "input",
                () => this.filter()
            );

        }

        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                () => this.filter()
            );

        }

    },

    filter() {

        const keyword =

            document.getElementById("incomeSearch")

            ?.value

            .toLowerCase()

            .trim() || "";

        const category =

            document.getElementById("incomeFilter")

            ?.value || "All";

        const records =

            IncomeState.records.filter(record => {

                const matchText =

                    record.source.toLowerCase().includes(keyword)

                    ||

                    record.notes.toLowerCase().includes(keyword);

                const matchCategory =

                    category === "All"

                    ||

                    record.category === category;

                return matchText && matchCategory;

            });

        IncomeTable.render(records);

    }

};

console.log("✔ Income Search Loaded");