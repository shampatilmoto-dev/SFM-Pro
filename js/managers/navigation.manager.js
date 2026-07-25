/* ==========================================================
   SFM PRO Enterprise v6.0
   Navigation Manager
   File: js/managers/navigation.manager.js
   ========================================================== */

(() => {
    "use strict";

    const NavigationManager = {

        initialized: false,

        currentPage: "",

        navLinks: [],

        init() {

            if (this.initialized) {
                return;
            }

            this.cacheElements();

            this.detectCurrentPage();

            this.highlightActiveLink();

            this.bindEvents();

            this.initialized = true;

            console.log("[NavigationManager] Initialized");

        },

        cacheElements() {

            this.navLinks = Array.from(
                document.querySelectorAll(".sidebar-menu a")
            );

        },

        detectCurrentPage() {

            this.currentPage =
                document.body.dataset.page ||
                window.location.pathname.split("/").pop() ||
                "";

        },

        highlightActiveLink() {

            this.navLinks.forEach(link => {

                link.classList.remove("active");

                const href = link.getAttribute("href") || "";

                if (
                    href.includes(this.currentPage) ||
                    (this.currentPage === "dashboard" &&
                        href.includes("dashboard.html"))
                ) {
                    link.classList.add("active");
                }

            });

        },

        bindEvents() {

            this.navLinks.forEach(link => {

                link.addEventListener("click", () => {

                    this.navLinks.forEach(item =>
                        item.classList.remove("active")
                    );

                    link.classList.add("active");

                });

            });

        },

        refresh() {

            this.cacheElements();

            this.detectCurrentPage();

            this.highlightActiveLink();

        }

    };

    window.NavigationManager = NavigationManager;

})();