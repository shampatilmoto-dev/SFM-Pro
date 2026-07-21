"use strict";

/*==================================================
 SFM PRO Enterprise
 Bootstrap
 Version : v5.0 Production Release
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

            console.log("âœ” APP_CONFIG Loaded");

        } else {

            console.error("âŒ APP_CONFIG Not Loaded");

        }

        if (typeof Common !== "undefined") {

            console.log("âœ” Common Loaded");

        } else {

            console.error("âŒ Common Not Loaded");

        }

        if (typeof EventBus !== "undefined") {

            console.log("âœ” EventBus Loaded");

        } else {

            console.error("âŒ EventBus Not Loaded");

        }

        if (typeof Router !== "undefined") {

            console.log("âœ” Router Loaded");

        } else {

            console.error("âŒ Router Not Loaded");

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

            console.error("âŒ Router Not Available");

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

