"use strict";

/*==================================================
 SFM PRO Enterprise
 Bootstrap
 Version : v3.5 Stable
==================================================*/

const Bootstrap = {

    initialized: false,

    start() {

        if (this.initialized) {

            console.warn("Application already initialized.");

            return;

        }

        console.log("====================================");
        console.log(APP_CONFIG.APP_NAME);
        console.log("Version :", APP_CONFIG.VERSION);
        console.log("====================================");

        this.checkDependencies();

        this.initializeModules();

        this.initialized = true;

        console.log("====================================");
        console.log("SFM PRO Started Successfully");
        console.log("====================================");

    },

    /*==================================================
        Dependency Check
    ==================================================*/

    checkDependencies() {

        console.log("Checking Dependencies...");

        if (typeof APP_CONFIG !== "undefined") {

            console.log("✔ APP_CONFIG Loaded");

        } else {

            console.error("❌ APP_CONFIG Not Loaded");

        }

        if (typeof Common !== "undefined") {

            console.log("✔ Common Loaded");

        } else {

            console.error("❌ Common Not Loaded");

        }

        if (typeof EventBus !== "undefined") {

            console.log("✔ EventBus Loaded");

        } else {

            console.error("❌ EventBus Not Loaded");

        }

        if (typeof Router !== "undefined") {

            console.log("✔ Router Loaded");

        } else {

            console.error("❌ Router Not Loaded");

        }

    },

    /*==================================================
        Initialize Modules
    ==================================================*/

    initializeModules() {

        console.log("Initializing Modules...");

        // Finance Engine
        if (typeof initializeFinanceEngine === "function") {

            initializeFinanceEngine();

        }

        // Enterprise Router
        if (typeof Router !== "undefined") {

            Router.initialize();

        } else {

            console.error("❌ Router Not Available");

        }

        console.log("Modules Ready");

    }

};

/*==================================================
    Application Start
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    Bootstrap.start();

});
