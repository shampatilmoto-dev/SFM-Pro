/* ==========================================================
   SFM PRO Enterprise v6.0
   Notification Manager
   File: js/managers/notification.manager.js
   ========================================================== */

(() => {
    "use strict";

    const NotificationManager = {

        initialized: false,
        container: null,

        init() {

            if (this.initialized) return;

            this.createContainer();

            this.initialized = true;

            console.log("[NotificationManager] Initialized");

        },

        createContainer() {

            this.container = document.getElementById("notification-container");

            if (!this.container) {

                this.container = document.createElement("div");

                this.container.id = "notification-container";

                this.container.className = "notification-container";

                document.body.appendChild(this.container);

            }

        },

        show(message, type = "info", duration = 3000) {

            if (!this.container) {
                this.createContainer();
            }

            const notification = document.createElement("div");

            notification.className = `notification ${type}`;

            notification.textContent = message;

            this.container.appendChild(notification);

            setTimeout(() => {
                notification.classList.add("show");
            }, 10);

            setTimeout(() => {

                notification.classList.remove("show");

                setTimeout(() => {

                    notification.remove();

                }, 300);

            }, duration);

        },

        success(message) {
            this.show(message, "success");
        },

        error(message) {
            this.show(message, "error");
        },

        warning(message) {
            this.show(message, "warning");
        },

        info(message) {
            this.show(message, "info");
        }

    };

    window.NotificationManager = NotificationManager;

})();