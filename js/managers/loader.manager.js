/* ==========================================================
   SFM PRO Enterprise v6.0
   Loader Manager
   File: js/managers/loader.manager.js
   ========================================================== */

(() => {
    "use strict";

    const LoaderManager = {

        initialized: false,
        loader: null,
        message: null,

        init() {

            if (this.initialized) return;

            this.createLoader();

            this.initialized = true;

            console.log("[LoaderManager] Initialized");

        },

        createLoader() {

            this.loader = document.getElementById("app-loader");

            if (this.loader) {
                this.message = this.loader.querySelector(".loader-message");
                return;
            }

            this.loader = document.createElement("div");
            this.loader.id = "app-loader";
            this.loader.className = "app-loader";

            this.loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-message">Loading...</div>
                </div>
            `;

            document.body.appendChild(this.loader);

            this.message = this.loader.querySelector(".loader-message");

        },

        show(text = "Loading...") {

            if (!this.loader) {
                this.createLoader();
            }

            if (this.message) {
                this.message.textContent = text;
            }

            this.loader.classList.add("show");

        },

        hide() {

            if (!this.loader) return;

            this.loader.classList.remove("show");

        },

        setMessage(text) {

            if (!this.message) return;

            this.message.textContent = text;

        }

    };

    window.LoaderManager = LoaderManager;

})();