"use strict";

const LOGIN_CREDENTIALS = {
    username: "sham",
    password: "1234"
};

document.addEventListener("DOMContentLoaded", initializeLoginShell);

function initializeLoginShell() {

    const form = document.getElementById("loginForm");
    const toggle = document.getElementById("togglePassword");
    const passwordField = document.getElementById("password");
    const usernameField = document.getElementById("username");
    const rememberMe = document.getElementById("rememberMe");
    const status = document.getElementById("loginStatus");

    if (sessionStorage.getItem("sfmLoggedIn") === "true") {
        window.location.replace("dashboard.html");
        return;
    }

    if (toggle && passwordField) {
        const syncPasswordVisibility = () => {
            passwordField.type = toggle.checked ? "text" : "password";
        };

        toggle.addEventListener("change", syncPasswordVisibility);
        syncPasswordVisibility();
    }

    if (form) {
        form.addEventListener("submit", login);
    }

    if (sessionStorage.getItem("sfmRememberMe") === "true") {
        const rememberedUser = sessionStorage.getItem("sfmRememberedUsername");

        if (rememberedUser && usernameField && !usernameField.value) {
            usernameField.value = rememberedUser;
        }

        if (rememberMe) {
            rememberMe.checked = true;
        }
    }

    if (status) {
        status.hidden = true;
        status.textContent = "";
    }

}

function login(event) {

    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
    }

    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const status = document.getElementById("loginStatus");
    const button = document.getElementById("loginButton");

    if (!usernameField || !passwordField) {
        return false;
    }

    const username = usernameField.value.trim();
    const password = passwordField.value;
    const normalizedUsername = username.toLowerCase();

    clearFieldState(usernameField);
    clearFieldState(passwordField);
    updateLoginStatus(status, "", "info", true);
    setLoadingState(button, false);

    if (!username || !password) {
        markFieldState(usernameField, !username);
        markFieldState(passwordField, !password);
        updateLoginStatus(status, "Please enter your username and password.", "error", false);

        if (!username) {
            usernameField.focus();
        } else {
            passwordField.focus();
        }

        return false;
    }

    if (normalizedUsername === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password) {
        setLoadingState(button, true);
        updateLoginStatus(status, "Signing you in to SFM PRO Enterprise...", "success", false);

        sessionStorage.setItem("sfmLoggedIn", "true");
        sessionStorage.setItem("sfmUser", "Sham");

        if (rememberMe && rememberMe.checked) {
            sessionStorage.setItem("sfmRememberMe", "true");
            sessionStorage.setItem("sfmRememberedUsername", username);
        } else {
            sessionStorage.removeItem("sfmRememberMe");
            sessionStorage.removeItem("sfmRememberedUsername");
        }

        window.setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);

        return true;
    }

    markFieldState(usernameField, true);
    markFieldState(passwordField, true);
    setLoadingState(button, false);
    updateLoginStatus(status, "Invalid username or password. Please try again.", "error", false);
    passwordField.focus();

    if (typeof passwordField.select === "function") {
        passwordField.select();
    }

    return false;
}

function clearFieldState(field) {

    const wrapper = field?.closest(".field");

    if (!wrapper) {
        return;
    }

    wrapper.classList.remove("is-invalid", "is-valid");
    field.removeAttribute("aria-invalid");

}

function markFieldState(field, isInvalid) {

    const wrapper = field?.closest(".field");

    if (!wrapper) {
        return;
    }

    wrapper.classList.toggle("is-invalid", Boolean(isInvalid));
    wrapper.classList.toggle("is-valid", !isInvalid);
    field.setAttribute("aria-invalid", String(Boolean(isInvalid)));

}

function updateLoginStatus(status, message, variant, hide = false) {

    if (!status) {
        return;
    }

    status.className = "login-status";

    if (variant) {
        status.classList.add(`login-status--${variant}`);
    }

    status.textContent = message;
    status.hidden = hide || !message;

}

function setLoadingState(button, isLoading) {

    if (!button) {
        return;
    }

    const label = button.querySelector(".login-button__label");

    if (isLoading) {
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.classList.add("is-loading");

        if (label) {
            label.textContent = "SIGNING IN";
        }

        return;
    }

    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.classList.remove("is-loading");

    if (label) {
        label.textContent = "SIGN IN";
    }

}