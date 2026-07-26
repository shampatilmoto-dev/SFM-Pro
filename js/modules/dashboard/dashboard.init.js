"use strict";

/*==================================================
 SFM PRO Enterprise
 Dashboard Initialization Module
==================================================*/

/*==================================================
 Initialize Dashboard
==================================================*/

function initializeDashboard() {

    console.log("Initializing Dashboard...");

    if (!hasActiveSession()) {
        return;
    }

    // Greeting & Date
    setGreeting();
    setCurrentDate();

    /*----------------------------------------------
      Step 1 - Enterprise Layout Manager
    ----------------------------------------------*/
    if (window.LayoutManager?.refresh) {
        LayoutManager.refresh();
    } else {
        initializeSidebar();
    }

    /*----------------------------------------------
      Step 2 - Keep Existing Dark Mode
      (ThemeManager integration will be done later)
    ----------------------------------------------*/
    initializeDarkMode();

    /*----------------------------------------------
      Step 3 - Profile Menu
    ----------------------------------------------*/
    initializeProfileMenu();

    /*----------------------------------------------
      Step 4 - Enterprise Notification Manager
    ----------------------------------------------*/
    if (window.NotificationManager?.init) {
        NotificationManager.init();
    } else {
        initializeNotifications();
    }

    /*----------------------------------------------
      Step 5 - Enterprise Loader
    ----------------------------------------------*/
    if (window.LoaderManager?.show) {
        LoaderManager.show("Loading Dashboard...");
    }

    // Dashboard Data
    refreshFinance();
    refreshDashboard();

    // Dashboard Events
    initializeDashboardEvents();

    // Utilities
    initializeUtilities();

    /*----------------------------------------------
      Step 6 - Hide Loader
    ----------------------------------------------*/
    if (window.LoaderManager?.hide) {
        LoaderManager.hide();
    }

    /*----------------------------------------------
      Step 7 - Dashboard Ready Notification
    ----------------------------------------------*/
    if (window.NotificationManager?.info) {
        NotificationManager.info("Dashboard Loaded Successfully");
    }

    console.log("✔ Dashboard Ready");
}

/*==================================================
 Greeting
==================================================*/

function setGreeting() {

    const greeting = $("#greeting");

    if (!greeting) return;

    const hour = new Date().getHours();

    const userName = sessionStorage.getItem("sfmUser") || "Sham";

    let message = "Welcome";

    if (hour >= 5 && hour < 12) {
        message = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        message = "Good Afternoon";
    } else {
        message = "Good Evening";
    }

    greeting.textContent = `${message}, ${userName}`;

    const welcomeUser = $("#userName");

    if (welcomeUser) {

        welcomeUser.textContent = userName;

    }
}
/*==================================================
 Current Date
==================================================*/

function setCurrentDate() {

    const date = $("#todayDate");

    if (!date) return;

    date.textContent = new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

/*==================================================
 Sidebar
==================================================*/

function initializeSidebar() {

    const menuButton = $(".menu-btn");
    const sidebar = $(".sidebar");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("sidebar-open");
    });
}

/*==================================================
 Dark Mode
==================================================*/

function initializeDarkMode() {

    const darkButton = $(".dark-mode-btn");

    const savedMode = localStorage.getItem("sfm_dark_mode");

    if (savedMode === "true") {
        document.body.classList.add("dark");
        dashboardState.settings.darkMode = true;
    }

    if (!darkButton) return;

    darkButton.addEventListener("click", toggleDarkMode);
}

function toggleDarkMode() {

    document.body.classList.toggle("dark");

    dashboardState.settings.darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "sfm_dark_mode",
        dashboardState.settings.darkMode
    );

    if (window.SettingsManager) {
        window.SettingsManager.save({
            theme: dashboardState.settings.darkMode ? 'dark' : 'light'
        });
    }
}

/*==================================================
 Profile
==================================================*/

function initializeProfileMenu() {

    const profile = $(".profile-menu");
    const logoutButton = document.getElementById("logoutBtn");

    if (!profile) return;

    const toggleProfileMenu = () => {
        profile.classList.toggle("active");
    };

    logoutButton?.addEventListener("click", event => {
        event.stopPropagation();
        logout();
    });

    profile.addEventListener("click", toggleProfileMenu);

    profile.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
            event.preventDefault();
            toggleProfileMenu();
        }
    });
}

function hasActiveSession() {

    try {
        if (sessionStorage.getItem("sfmLoggedIn") === "true") {
            return true;
        }

        window.location.href = "login.html";
        return false;
    } catch (error) {
        return true;
    }
}

function logout() {

    try {
        sessionStorage.removeItem("sfmLoggedIn");
        sessionStorage.removeItem("sfmUser");
        sessionStorage.removeItem("sfmRememberMe");
        sessionStorage.removeItem("sfmRememberedUsername");
    } catch (error) {
        // The redirect still gives the user a safe way to exit the dashboard.
    }

    window.location.href = "login.html";
}

/*==================================================
 Notifications
==================================================*/

function initializeNotifications() {

    $$(".badge").forEach((badge) => {

        if (badge.textContent.trim() === "0") {
            badge.style.display = "none";
        }

    });

}

console.log("✔ Dashboard Init Loaded");
