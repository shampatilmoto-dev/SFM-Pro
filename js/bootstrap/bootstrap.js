/* ==========================================================
   SFM PRO Enterprise v6.0
   Core Bootstrap
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("=================================");
    console.log("SFM PRO Enterprise");
    console.log("Core Bootstrap");
    console.log("=================================");

    if (window.AppManager?.init) {
        AppManager.init();
    }

});