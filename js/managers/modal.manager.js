/* ==========================================================
   SFM PRO Enterprise v6.0
   Modal Manager
   ========================================================== */

(() => {
    "use strict";

    const ModalManager = {

        initialized: false,

        activeModal: null,

        init() {

            if (this.initialized) return;

            this.bindEvents();

            this.initialized = true;

            console.log("[ModalManager] Initialized");

        },

        bindEvents() {

            document.addEventListener("click", (e) => {

                const openBtn = e.target.closest("[data-modal]");

                if (openBtn) {

                    const modal = document.querySelector(
                        openBtn.dataset.modal
                    );

                    if (modal) {

                        this.open(modal);

                    }

                }

                const closeBtn = e.target.closest("[data-close-modal]");

                if (closeBtn) {

                    const modal = closeBtn.closest(".modal");

                    if (modal) {

                        this.close(modal);

                    }

                }

            });

        },

        open(modal) {

            modal.classList.add("show");

            this.activeModal = modal;

            document.body.classList.add("modal-open");

        },

        close(modal) {

            modal.classList.remove("show");

            if (this.activeModal === modal) {

                this.activeModal = null;

            }

            document.body.classList.remove("modal-open");

        },

        closeAll() {

            document.querySelectorAll(".modal.show")
                .forEach(modal => {

                    modal.classList.remove("show");

                });

            this.activeModal = null;

            document.body.classList.remove("modal-open");

        }

    };

    window.ModalManager = ModalManager;

})();