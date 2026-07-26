"use strict";

import { AuthenticationManager } from "./managers/authentication.manager.js";
import { firebaseConfigurationStatus } from "./firebase/firebase-config.js";

document.addEventListener("DOMContentLoaded", initializeLoginShell);

function initializeLoginShell() {

    const form = document.getElementById("loginForm");
    const toggle = document.getElementById("togglePassword");
    const passwordField = document.getElementById("password");
    const status = document.getElementById("loginStatus");
    const button = document.getElementById("loginButton");

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

    if (status) {
        status.hidden = true;
        status.textContent = "";
    }

    if (!firebaseConfigurationStatus.configured) {
        if (button) {
            button.disabled = true;
            button.dataset.firebaseUnavailable = "true";
            button.setAttribute("aria-disabled", "true");
        }
        updateLoginStatus(
            status,
            "⚠ Firebase is not configured. Please configure firebase.local.config.js",
            "error",
            false
        );
    }

}

async function login(event) {

    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
    }

    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const status = document.getElementById("loginStatus");
    const button = document.getElementById("loginButton");

    if (!firebaseConfigurationStatus.configured) {
        updateLoginStatus(status, "⚠ Firebase is not configured. Please configure firebase.local.config.js", "error", false);
        return false;
    }

    if (!usernameField || !passwordField) {
        return false;
    }

    const email = usernameField.value.trim();
    const password = passwordField.value;

    clearFieldState(usernameField);
    clearFieldState(passwordField);
    updateLoginStatus(status, "", "info", true);
    setLoadingState(button, false);

    if (!email || !password) {
        markFieldState(usernameField, !email);
        markFieldState(passwordField, !password);
        updateLoginStatus(status, "Please enter your username and password.", "error", false);

        if (!email) {
            usernameField.focus();
        } else {
            passwordField.focus();
        }

        return false;
    }

    setLoadingState(button, true);
    updateLoginStatus(status, "Signing you in to SFM PRO Enterprise...", "info", false);

    try {
        await AuthenticationManager.login(email, password, {
            remember: rememberMe?.checked !== false
        });

        markFieldState(usernameField, false);
        markFieldState(passwordField, false);
        updateLoginStatus(status, "Signing you in to SFM PRO Enterprise...", "success", false);
        return true;
    } catch (error) {
        const normalizedError = AuthenticationManager.normalizeError(error);

        markFieldState(usernameField, true);
        markFieldState(passwordField, true);
        setLoadingState(button, false);
        updateLoginStatus(status, normalizedError.message, "error", false);
        passwordField.focus();

        if (typeof passwordField.select === "function") {
            passwordField.select();
        }

        return false;
    }
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

    button.disabled = button.dataset.firebaseUnavailable === "true";
    button.removeAttribute("aria-busy");
    button.classList.remove("is-loading");

    if (label) {
        label.textContent = "SIGN IN";
    }

}
