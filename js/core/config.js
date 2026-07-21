"use strict";

/*==================================================
 SFM PRO Enterprise
 File: config.js
 Version: v3.5 Stable
 Description:
 Central configuration for the entire application.
==================================================*/

const APP_CONFIG = Object.freeze({

    // ==============================
    // Application Information
    // ==============================
    APP_NAME: "SFM PRO Enterprise",
    VERSION: "3.5 Stable",
    COMPANY: "Sham Patil",
    BUILD: "001",

    // ==============================
    // Regional Settings
    // ==============================
    CURRENCY: "INR",
    LOCALE: "en-IN",
    DATE_FORMAT: "DD-MM-YYYY",

    // ==============================
    // Theme
    // ==============================
    DEFAULT_THEME: "light",

    // ==============================
    // Storage Keys
    // ==============================
    STORAGE: {

        DATABASE: "SFM_DATABASE",

        SETTINGS: "SFM_SETTINGS",

        USER: "SFM_USER",

        SESSION: "SFM_SESSION"

    },

    // ==============================
    // Dashboard
    // ==============================
    DASHBOARD: {

        AUTO_REFRESH: true,

        REFRESH_INTERVAL: 60000

    },

    // ==============================
    // Validation
    // ==============================
    VALIDATION: {

        MIN_AMOUNT: 0,

        MAX_AMOUNT: 999999999

    },

    // ==============================
    // Application Features
    // ==============================
    FEATURES: {

        AUTO_SAVE: true,

        BACKUP: true,

        EXPORT: true,

        IMPORT: true,

        REPORTS: true

    }

});

console.log(
    `${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION} Loaded`
);
