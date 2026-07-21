"use strict";

/*==================================================
 SFM PRO Enterprise
 File: common.js
 Version: v3.5 Stable
 Description:
 Common utility functions used across the application.
==================================================*/

/*==================================================
 Global DOM Helpers
==================================================*/

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/*==================================================
 Common Utility Object
==================================================*/

const Common = {

    /**
     * Format Currency (INR)
     */
    formatCurrency(amount = 0) {
        return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
            style: "currency",
            currency: APP_CONFIG.CURRENCY,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    },

    /**
     * Format Date
     */
    formatDate(date = new Date()) {
        return new Date(date).toLocaleDateString(APP_CONFIG.LOCALE);
    },

    /**
     * Get Element by ID
     */
    get(id) {
        return document.getElementById(id);
    },

    /**
     * Reset Form
     */
    resetForm(formId) {
        const form = document.getElementById(formId);

        if (form) {
            form.reset();
        }
    },

    /**
     * Validate Required Field
     */
    validateRequired(value) {
        return (
            value !== null &&
            value !== undefined &&
            value.toString().trim() !== ""
        );
    },

    /**
     * Generate UUID
     */
    generateUUID() {

        if (window.crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return Date.now().toString();
    },

    /**
     * Success Message
     */
    success(message) {
        alert("✅ " + message);
    },

    /**
     * Error Message
     */
    error(message) {
        alert("❌ " + message);
    },

    /**
     * Warning Message
     */
    warning(message) {
        alert("⚠️ " + message);
    },

    /**
     * Confirmation Dialog
     */
    confirmDelete() {
        return confirm(
            "Are you sure you want to delete this record?"
        );
    }

};

console.log("✔ Common Utilities Loaded");
