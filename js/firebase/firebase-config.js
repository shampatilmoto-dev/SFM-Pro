"use strict";

/**
 * SFM PRO Firebase application configuration.
 *
 * A host may assign the Firebase web configuration object to
 * `globalThis.SFM_FIREBASE_CONFIG` before importing this module. On Firebase
 * Hosting, the configuration is otherwise loaded from the reserved
 * `/__/firebase/init.json` endpoint. This keeps environment-specific values out
 * of source control while supporting deployment-time configuration.
 */

import {
    getApp,
    getApps,
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

const REQUIRED_CONFIG_KEYS = Object.freeze([
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId"
]);
const LOCAL_HOSTNAMES = Object.freeze(new Set(["localhost", "127.0.0.1", "::1", "[::1]"]));
let localConfigurationWarningLogged = false;

function validateFirebaseConfig(config) {
    const candidate = config && typeof config === "object" && !Array.isArray(config) ? config : {};
    const normalizedConfig = { ...candidate };

    if (typeof normalizedConfig.messagingSenderId === "number" &&
        Number.isFinite(normalizedConfig.messagingSenderId)) {
        normalizedConfig.messagingSenderId = String(normalizedConfig.messagingSenderId);
    }

    const missingKeys = REQUIRED_CONFIG_KEYS.filter(key => {
        const value = normalizedConfig[key];
        return typeof value !== "string" || !value.trim() ||
            /^(YOUR_|sfm-pro-unconfigured|1:0:web:sfm-pro-unconfigured)/i.test(value.trim());
    });
    return { valid: missingKeys.length === 0, config: normalizedConfig, missingKeys };
}

function parseFirebaseConsoleConfig(source) {
    if (typeof source !== "string" || !source.includes("firebaseConfig")) return null;

    const config = {};
    for (const key of REQUIRED_CONFIG_KEYS) {
        const match = source.match(new RegExp(`\\b${key}\\s*:\\s*["']([^"']+)["']`));
        if (match) config[key] = match[1].trim();
    }

    return validateFirebaseConfig(config).valid ? config : null;
}

async function loadLocalFirebaseConfig() {
    try {
        const localModule = await import("./firebase.local.config.js");
        const exportedConfig = localModule.default ??
            localModule.firebaseLocalConfig ??
            localModule.firebaseConfig ??
            localModule.config;
        if (validateFirebaseConfig(exportedConfig).valid) return exportedConfig;
    } catch (_error) {
        // Firebase Console snippets are handled as source text below.
    }

    try {
        const localUrl = new URL("./firebase.local.config.js", import.meta.url);
        const response = await fetch(localUrl, { cache: "no-store", credentials: "same-origin" });
        return response.ok ? parseFirebaseConsoleConfig(await response.text()) : null;
    } catch (_error) {
        return null;
    }
}

function warnLocalConfigurationMissing() {
    if (localConfigurationWarningLogged) return;
    localConfigurationWarningLogged = true;
    globalThis.console?.warn?.("Firebase Local Configuration Missing");
}

/**
 * Resolve the environment-specific Firebase web configuration.
 * @returns {Promise<Record<string, string>>}
 */
async function resolveFirebaseConfig() {
    const injectedConfig = globalThis.SFM_FIREBASE_CONFIG;

    if (injectedConfig && typeof injectedConfig === "object") {
        return { ...validateFirebaseConfig(injectedConfig), source: "runtime" };
    }

    if (LOCAL_HOSTNAMES.has(globalThis.location?.hostname)) {
        const localConfig = await loadLocalFirebaseConfig();
        const validated = validateFirebaseConfig(localConfig);
        if (validated.valid) {
            return { ...validated, source: "local-module" };
        }

        warnLocalConfigurationMissing();
        return {
            config: {}, valid: false, missingKeys: [...REQUIRED_CONFIG_KEYS],
            source: "local-config-missing",
            message: "Firebase Local Configuration Missing"
        };
    }

    try {
        const response = await fetch("/__/firebase/init.json", {
            cache: "no-store",
            credentials: "same-origin"
        });
        if (response.ok) {
            return { ...validateFirebaseConfig(await response.json()), source: "firebase-hosting" };
        }
    } catch (_error) {
        // The application remains bootable and reports an unconfigured cloud state.
    }

    return {
        config: {}, valid: false, missingKeys: [...REQUIRED_CONFIG_KEYS],
        source: "hosting-config-unavailable",
        message: "Firebase Hosting configuration is unavailable."
    };
}

/** @type {Readonly<Record<string, string>>} */
const resolvedFirebaseConfig = await resolveFirebaseConfig();
const firebaseConfig = Object.freeze(resolvedFirebaseConfig.config);

const missingConfigKeys = resolvedFirebaseConfig.missingKeys ?? REQUIRED_CONFIG_KEYS;

const firebaseConfigurationStatus = Object.freeze({
    configured: resolvedFirebaseConfig.valid === true,
    source: resolvedFirebaseConfig.source,
    missingKeys: Object.freeze([...missingConfigKeys]),
    message: resolvedFirebaseConfig.message ?? null
});

/** The single Firebase application instance used by SFM PRO. */
const firebaseApp = firebaseConfigurationStatus.configured
    ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
    : null;

export {
    firebaseApp,
    firebaseConfig,
    firebaseConfigurationStatus,
    parseFirebaseConsoleConfig,
    resolveFirebaseConfig,
    validateFirebaseConfig
};
