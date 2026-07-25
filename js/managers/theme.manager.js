/* ==========================================================
   SFM PRO Enterprise v6.0
   Theme Manager
   File: js/managers/theme.manager.js
   ========================================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "sfm-theme";

    const ThemeManager = {

        initialized: false,

        currentTheme: "light",

        toggleButton: null,

        init() {

            if (this.initialized) return;

            this.toggleButton = document.querySelector(".dark-mode-btn");

            this.loadTheme();

            this.bindEvents();

            this.initialized = true;

            console.log("[ThemeManager] Initialized");

        },

        loadTheme() {

            const savedTheme = localStorage.getItem(STORAGE_KEY);

            this.currentTheme = savedTheme || "light";

            document.documentElement.setAttribute(
                "data-theme",
                this.currentTheme
            );

            this.updateIcon();

        },

        bindEvents() {

            if (!this.toggleButton) return;

            this.toggleButton.addEventListener("click", () => {
                this.toggleTheme();
            });

        },

        toggleTheme() {

            this.currentTheme =
                this.currentTheme === "light"
                    ? "dark"
                    : "light";

            document.documentElement.setAttribute(
                "data-theme",
                this.currentTheme
            );

            localStorage.setItem(
                STORAGE_KEY,
                this.currentTheme
            );

            this.updateIcon();

            console.log(
                "[ThemeManager] Theme:",
                this.currentTheme
            );

        },

        updateIcon() {

            if (!this.toggleButton) return;

            const icon = this.toggleButton.querySelector("i");

            if (!icon) return;

            icon.className =
                this.currentTheme === "dark"
                    ? "fa-solid fa-sun"
                    : "fa-solid fa-moon";

        }

    };

    window.ThemeManager = ThemeManager;

})();