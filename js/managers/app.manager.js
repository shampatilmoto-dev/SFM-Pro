/* ==========================================================
   SFM PRO Enterprise v6.0
   Application Manager
   File: js/managers/app.manager.js
   ========================================================== */

(() => {
    "use strict";

    /**
     * ======================================================
     * Application Manager
     * ======================================================
     */

    const AppManager = {

        version: "6.0.0",

        appName: "SFM PRO Enterprise",

        initialized: false,

        currentPage: null,

        /**
         * Initialize Application
         */
        init() {

            if (this.initialized) {
                console.warn("[AppManager] Already initialized.");
                return;
            }

            console.log("======================================");
            console.log(this.appName);
            console.log("Version :", this.version);
            console.log("======================================");

            this.detectPage();

            this.initializeManagers();

            this.initialized = true;

            console.log("[AppManager] Application Initialized.");
        },

        /**
         * Detect Current Page
         */
        detectPage() {

            const body = document.body;

            this.currentPage = body.dataset.page || "unknown";

            console.log(
                "[AppManager] Current Page:",
                this.currentPage
            );

        },

        /**
         * Initialize Managers
         */
        initializeManagers() {

            this.initializeTheme();

            this.initializeLayout();

            this.initializeNavigation();

            this.initializeNotifications();

            this.initializeLoader();

            this.initializeModal();

        },

        initializeTheme() {

            if (window.ThemeManager?.init) {
                ThemeManager.init();
            }

        },

        initializeLayout() {

            if (window.LayoutManager?.init) {
                LayoutManager.init();
            }

        },

        initializeNavigation() {

            if (window.NavigationManager?.init) {
                NavigationManager.init();
            }

        },

        initializeNotifications() {

            if (window.NotificationManager?.init) {
                NotificationManager.init();
            }

        },

        initializeLoader() {

            if (window.LoaderManager?.init) {
                LoaderManager.init();
            }

        },

        initializeModal() {

            if (window.ModalManager?.init) {
                ModalManager.init();
            }

        }

    };

    window.AppManager = AppManager;

})();