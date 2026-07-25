/* ==========================================================
   SFM PRO Enterprise v6.0
   Layout Manager
   File: js/managers/layout.manager.js
   ========================================================== */

(() => {
    "use strict";

    const LayoutManager = {

        initialized: false,

        sidebar: null,
        header: null,
        footer: null,
        menuButton: null,

        init() {

            if (this.initialized) {
                return;
            }

            this.cacheElements();
            this.bindEvents();
            this.handleResize();

            this.initialized = true;

            console.log("[LayoutManager] Initialized");

        },

        cacheElements() {

            this.sidebar = document.querySelector(".sidebar");
            this.header = document.querySelector(".top-header");
            this.footer = document.querySelector(".dashboard-footer");
            this.menuButton = document.querySelector(".menu-btn");

        },

        bindEvents() {

            if (this.menuButton) {

                this.menuButton.addEventListener("click", () => {
                    this.toggleSidebar();
                });

            }

            window.addEventListener("resize", () => {
                this.handleResize();
            });

        },

        toggleSidebar() {

            if (!this.sidebar) return;

            this.sidebar.classList.toggle("open");

        },

        handleResize() {

            if (!this.sidebar) return;

            if (window.innerWidth > 992) {
                this.sidebar.classList.remove("open");
            }

        },

        refresh() {

            this.cacheElements();

            console.log("[LayoutManager] Layout Refreshed");

        }

    };

    window.LayoutManager = LayoutManager;

})();