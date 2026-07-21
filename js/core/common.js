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

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const DomHelper = {
    get(selector, root = document) {
        if (!root || typeof root.querySelector !== "function") {
            return null;
        }

        return root.querySelector(selector);
    },

    getAll(selector, root = document) {
        if (!root || typeof root.querySelectorAll !== "function") {
            return [];
        }

        return Array.from(root.querySelectorAll(selector));
    },

    text(element, value) {
        if (!element) {
            return;
        }

        element.textContent = String(value ?? "");
    },

    html(element, value) {
        if (!element) {
            return;
        }

        element.innerHTML = escapeHtml(value);
    },

    replaceChildren(element, nodes = []) {
        if (!element) {
            return 0;
        }

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        let appended = 0;
        (Array.isArray(nodes) ? nodes : []).forEach(node => {
            if (node) {
                element.appendChild(node);
                appended += 1;
            }
        });

        return appended;
    },

    setAttributes(element, attributes = {}) {
        if (!element || !attributes || typeof attributes !== "object") {
            return;
        }

        Object.entries(attributes).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                element.removeAttribute(key);
                return;
            }

            element.setAttribute(key, String(value));
        });
    },

    createFragment(nodes = []) {
        const fragment = document.createDocumentFragment();

        nodes.forEach(node => {
            if (node) {
                fragment.appendChild(node);
            }
        });

        return fragment;
    },

    on(target, eventName, handler, options) {
        if (!target || typeof target.addEventListener !== "function" || typeof handler !== "function") {
            return null;
        }

        target.addEventListener(eventName, handler, options);

        return {
            target,
            eventName,
            handler,
            options: options || false
        };
    },

    off(binding) {
        if (!binding || !binding.target || typeof binding.target.removeEventListener !== "function") {
            return;
        }

        binding.target.removeEventListener(
            binding.eventName,
            binding.handler,
            binding.options || false
        );
    }
};

const Notification = {
    containerId: "sfmNotificationContainer",
    maxTextLength: 400,

    normalizeType(type) {
        const safeType = String(type || "info").toLowerCase();
        return ["success", "error", "warning", "info"].includes(safeType)
            ? safeType
            : "info";
    },

    normalizeText(message) {
        let text = String(message ?? "");
        text = text.replace(/[\u0000-\u001F\u007F]/g, " ");
        text = text.replace(/\s+/g, " ").trim();

        if (text.length > this.maxTextLength) {
            text = text.slice(0, this.maxTextLength);
        }

        return text;
    },

    ensureContainer() {
        let container = document.getElementById(this.containerId);

        if (container) {
            return container;
        }

        if (!document.body) {
            return null;
        }

        container = document.createElement("div");
        container.id = this.containerId;
        container.className = "notification-container";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "false");
        document.body.appendChild(container);

        return container;
    },

    show(message, type = "info", options = {}) {
        const text = this.normalizeText(message);

        if (!text) {
            return;
        }

        const safeType = this.normalizeType(type);

        const container = this.ensureContainer();

        if (!container) {
            window.alert(text);
            return;
        }

        const duration = Number.isFinite(Number(options.duration))
            ? Math.max(1000, Number(options.duration))
            : 3200;

        const item = document.createElement("div");
        item.className = `notification-item ${safeType}`;
        item.setAttribute("role", "status");

        const messageNode = document.createElement("span");
        messageNode.className = "notification-text";
        messageNode.textContent = text;

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "notification-close";
        closeButton.setAttribute("aria-label", "Dismiss notification");
        closeButton.textContent = "x";

        const removeItem = () => {
            if (item.parentElement) {
                item.parentElement.removeChild(item);
            }
        };

        closeButton.addEventListener("click", removeItem);

        item.appendChild(messageNode);
        item.appendChild(closeButton);
        container.appendChild(item);

        window.setTimeout(removeItem, duration);
    },

    success(message, options = {}) {
        this.show(message, "success", options);
    },

    error(message, options = {}) {
        this.show(message, "error", options);
    },

    warning(message, options = {}) {
        this.show(message, "warning", options);
    },

    info(message, options = {}) {
        this.show(message, "info", options);
    }
};

const Dialog = {
    dialogId: "sfmConfirmDialog",
    pendingResolver: null,

    ensureDialog() {
        let dialog = document.getElementById(this.dialogId);

        if (dialog) {
            return dialog;
        }

        if (!document.body) {
            return null;
        }

        dialog = document.createElement("div");
        dialog.id = this.dialogId;
        dialog.className = "confirm-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("hidden", "hidden");

        dialog.innerHTML = `
            <div class="confirm-dialog-backdrop" data-role="backdrop"></div>
            <div class="confirm-dialog-panel" role="document">
                <h3 class="confirm-dialog-title" data-role="title">Confirm</h3>
                <p class="confirm-dialog-message" data-role="message">Are you sure?</p>
                <div class="confirm-dialog-actions">
                    <button type="button" class="confirm-dialog-btn secondary" data-role="cancel">Cancel</button>
                    <button type="button" class="confirm-dialog-btn primary" data-role="confirm">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const cancelButton = dialog.querySelector('[data-role="cancel"]');
        const confirmButton = dialog.querySelector('[data-role="confirm"]');
        const backdrop = dialog.querySelector('[data-role="backdrop"]');

        const resolve = (value) => {
            this.hideDialog(dialog);

            if (typeof this.pendingResolver === "function") {
                this.pendingResolver(Boolean(value));
                this.pendingResolver = null;
            }
        };

        cancelButton?.addEventListener("click", () => resolve(false));
        confirmButton?.addEventListener("click", () => resolve(true));
        backdrop?.addEventListener("click", () => resolve(false));

        dialog.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                event.preventDefault();
                resolve(false);
            }
        });

        return dialog;
    },

    showDialog(dialog) {
        dialog.removeAttribute("hidden");
        dialog.classList.add("open");

        const confirmButton = dialog.querySelector('[data-role="confirm"]');
        confirmButton?.focus();
    },

    hideDialog(dialog) {
        dialog.classList.remove("open");
        dialog.setAttribute("hidden", "hidden");
    },

    confirm(message, options = {}) {
        const dialog = this.ensureDialog();

        if (!dialog) {
            return Promise.resolve(this.confirmSync(message, false));
        }

        const title = String(options.title || "Confirm Action");
        const confirmText = String(options.confirmText || "Confirm");
        const cancelText = String(options.cancelText || "Cancel");
        const text = String(message || "Are you sure?");

        const titleNode = dialog.querySelector('[data-role="title"]');
        const messageNode = dialog.querySelector('[data-role="message"]');
        const confirmButton = dialog.querySelector('[data-role="confirm"]');
        const cancelButton = dialog.querySelector('[data-role="cancel"]');

        if (titleNode) {
            titleNode.textContent = title;
        }

        if (messageNode) {
            messageNode.textContent = text;
        }

        if (confirmButton) {
            confirmButton.textContent = confirmText;
        }

        if (cancelButton) {
            cancelButton.textContent = cancelText;
        }

        this.showDialog(dialog);

        return new Promise(resolve => {
            this.pendingResolver = resolve;
        });
    },

    confirmSync(message, defaultValue = false) {
        if (typeof window.confirm === "function") {
            return window.confirm(String(message || "Are you sure?"));
        }

        return Boolean(defaultValue);
    }
};

const Sanitizer = {
    text(value, options = {}) {
        const config = {
            trim: options.trim !== false,
            collapseWhitespace: options.collapseWhitespace !== false,
            stripTags: options.stripTags !== false,
            removeControlChars: options.removeControlChars !== false,
            maxLength: Number.isFinite(Number(options.maxLength))
                ? Math.max(0, Number(options.maxLength))
                : null
        };

        let output = String(value ?? "");

        if (config.stripTags) {
            output = output.replace(/<[^>]*>/g, "");
        }

        if (config.removeControlChars) {
            output = output.replace(/[\u0000-\u001F\u007F]/g, "");
        }

        if (config.collapseWhitespace) {
            output = output.replace(/\s+/g, " ");
        }

        if (config.trim) {
            output = output.trim();
        }

        if (config.maxLength !== null && output.length > config.maxLength) {
            output = output.slice(0, config.maxLength);
        }

        return output;
    },

    number(value, options = {}) {
        const parsed = Number(value);

        if (!Number.isFinite(parsed)) {
            return NaN;
        }

        const precision = Number.isInteger(Number(options.precision))
            ? Math.max(0, Number(options.precision))
            : 2;

        return Number(parsed.toFixed(precision));
    },

    isSafeObject(value, options = {}) {
        const maxDepth = Number.isInteger(Number(options.maxDepth))
            ? Math.max(1, Number(options.maxDepth))
            : 20;

        const visit = (input, depth) => {
            if (depth > maxDepth) {
                return false;
            }

            if (Array.isArray(input)) {
                return input.every(item => visit(item, depth + 1));
            }

            if (!input || typeof input !== "object") {
                return true;
            }

            const proto = Object.getPrototypeOf(input);
            if (proto !== Object.prototype && proto !== null) {
                return false;
            }

            return Object.keys(input).every(key => {
                if (["__proto__", "prototype", "constructor"].includes(key)) {
                    return false;
                }

                return visit(input[key], depth + 1);
            });
        };

        return visit(value, 0);
    },

    safeJsonParse(text, fallback = null, options = {}) {
        if (typeof text !== "string") {
            return fallback;
        }

        const maxLength = Number.isInteger(Number(options.maxLength))
            ? Math.max(128, Number(options.maxLength))
            : 8 * 1024 * 1024;

        if (text.length === 0 || text.length > maxLength) {
            return fallback;
        }

        try {
            const parsed = JSON.parse(text);

            if (options.requireSafeObject !== false && !this.isSafeObject(parsed, options)) {
                return fallback;
            }

            return parsed;
        } catch (error) {
            return fallback;
        }
    }
};

const Validator = {
    required(value) {
        return value !== null && value !== undefined && String(value).trim() !== "";
    },

    minLength(value, length) {
        const text = String(value ?? "");
        return text.length >= Number(length || 0);
    },

    maxLength(value, length) {
        const text = String(value ?? "");
        return text.length <= Number(length || 0);
    },

    finiteNumber(value, options = {}) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return false;
        }

        if (Number.isFinite(Number(options.min)) && number < Number(options.min)) {
            return false;
        }

        if (Number.isFinite(Number(options.max)) && number > Number(options.max)) {
            return false;
        }

        return true;
    },

    oneOf(value, allowed = []) {
        return Array.isArray(allowed) && allowed.includes(value);
    },

    date(value) {
        if (!value) {
            return false;
        }

        const parsed = new Date(value);
        return !Number.isNaN(parsed.getTime());
    },

    result() {
        return {
            success: false,
            valid: false,
            data: null,
            errors: [],
            warnings: [],
            message: "",
            error: null
        };
    },

    finalize(result, messageMap = {}) {
        const output = {
            ...this.result(),
            ...(result || {})
        };

        output.errors = Array.isArray(output.errors) ? output.errors.filter(Boolean) : [];
        output.warnings = Array.isArray(output.warnings) ? output.warnings.filter(Boolean) : [];
        output.success = output.errors.length === 0;
        output.valid = output.success;
        output.error = output.errors[0] || null;

        if (!output.message) {
            output.message = output.success
                ? (messageMap.success || "Validation passed.")
                : (messageMap.failure || "Validation failed.");
        }

        return output;
    }
};

const ErrorHandler = {
    normalize(error, fallbackMessage = "Unexpected error occurred.") {
        if (!error) {
            return {
                message: fallbackMessage,
                details: null,
                source: "unknown"
            };
        }

        if (typeof error === "string") {
            return {
                message: error,
                details: null,
                source: "text"
            };
        }

        if (error instanceof Error) {
            return {
                message: error.message || fallbackMessage,
                details: error.stack || null,
                source: "exception"
            };
        }

        if (typeof error === "object") {
            const message = error.message || error.error || fallbackMessage;
            const details = Array.isArray(error.errors) ? error.errors.join(" ") : null;

            return {
                message,
                details,
                source: "object"
            };
        }

        return {
            message: fallbackMessage,
            details: null,
            source: typeof error
        };
    },

    notify(input, type = "error", options = {}) {
        const normalized = this.normalize(input, options.fallbackMessage || "Unexpected error occurred.");
        const text = normalized.details
            ? `${normalized.message} ${normalized.details}`.trim()
            : normalized.message;

        if (typeof Notification === "object" && typeof Notification.show === "function") {
            Notification.show(text, type, options);
            return normalized;
        }

        if (typeof window.alert === "function") {
            window.alert(text);
        }

        return normalized;
    },

    capture(context, error, fallbackMessage = "Unexpected error occurred.") {
        const normalized = this.normalize(error, fallbackMessage);
        const label = context ? `[${context}]` : "[ErrorHandler]";

        if (normalized.details) {
            console.error(`${label} ${normalized.message}`, normalized.details);
        } else {
            console.error(`${label} ${normalized.message}`);
        }

        return normalized;
    },

    run(context, operation, options = {}) {
        if (typeof operation !== "function") {
            return options.fallbackValue;
        }

        try {
            return operation();
        } catch (error) {
            const normalized = this.capture(
                context,
                error,
                options.fallbackMessage || "Unexpected error occurred."
            );

            if (options.notify === true) {
                this.notify(normalized.message, options.type || "error", {
                    fallbackMessage: normalized.message
                });
            }

            return options.fallbackValue;
        }
    }
};

const FormEngine = {
    prepareForm(form, options = {}) {
        if (!form || typeof form.setAttribute !== "function") {
            return false;
        }

        const autocomplete = options.autocomplete || "off";
        form.setAttribute("autocomplete", autocomplete);

        if (options.noValidate === true) {
            form.setAttribute("novalidate", "novalidate");
        }

        return true;
    },

    prepareAllForms(root = document, options = {}) {
        if (!root || typeof root.querySelectorAll !== "function") {
            return 0;
        }

        const forms = Array.from(root.querySelectorAll("form"));
        forms.forEach(form => this.prepareForm(form, options));

        return forms.length;
    },

    serialize(form) {
        if (!form || typeof FormData !== "function") {
            return {};
        }

        const data = new FormData(form);
        const output = {};

        data.forEach((value, key) => {
            output[key] = value;
        });

        return output;
    },

    reset(formOrId) {
        const form = typeof formOrId === "string"
            ? document.getElementById(formOrId)
            : formOrId;

        if (!form || typeof form.reset !== "function") {
            return false;
        }

        form.reset();
        return true;
    }
};

const TableRenderer = {
    renderHTMLRows(tableBody, rows = [], options = {}) {
        if (!tableBody) {
            return 0;
        }

        const validRows = Array.isArray(rows) ? rows : [];

        if (validRows.length === 0) {
            const colspan = Number.isInteger(Number(options.emptyColspan))
                ? Number(options.emptyColspan)
                : 1;
            const message = String(options.emptyMessage || "No records found.");
            const emptyHtml = options.emptyHtml || `<tr><td colspan="${colspan}">${escapeHtml(message)}</td></tr>`;
            tableBody.innerHTML = emptyHtml;
            return 0;
        }

        tableBody.innerHTML = validRows.join("");
        return validRows.length;
    },

    renderNodeRows(tableBody, rows = [], options = {}) {
        if (!tableBody) {
            return 0;
        }

        tableBody.innerHTML = "";

        const validRows = Array.isArray(rows)
            ? rows.filter(Boolean)
            : [];

        if (validRows.length === 0) {
            if (typeof options.emptyStateRenderer === "function") {
                const emptyNode = options.emptyStateRenderer();
                if (emptyNode) {
                    tableBody.appendChild(emptyNode);
                }
            }
            return 0;
        }

        validRows.forEach(row => tableBody.appendChild(row));
        return validRows.length;
    }
};

const CardRenderer = {
    resolveElement(target) {
        if (!target) {
            return null;
        }

        if (typeof target === "string") {
            return document.getElementById(target);
        }

        return target;
    },

    setText(target, value) {
        const element = this.resolveElement(target);

        if (!element) {
            return false;
        }

        element.textContent = String(value ?? "");
        return true;
    },

    setCurrency(target, value, formatter) {
        const formatValue = typeof formatter === "function"
            ? formatter
            : (amount => new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(Number(amount || 0)));

        return this.setText(target, formatValue(value));
    }
};

const ChartManager = {
    isReady() {
        return typeof Chart === "function";
    },

    destroy(instance) {
        if (!instance || typeof instance.destroy !== "function") {
            return null;
        }

        instance.destroy();
        return null;
    },

    create(canvas, config = {}) {
        if (!this.isReady() || !canvas || typeof canvas.getContext !== "function") {
            return null;
        }

        const context = canvas.getContext("2d");
        if (!context) {
            return null;
        }

        return new Chart(context, config);
    },

    createOrReplace(instance, canvas, config = {}) {
        this.destroy(instance);
        return this.create(canvas, config);
    }
};

const ListRenderer = {
    render(container, items = [], renderItem, options = {}) {
        if (!container) {
            return 0;
        }

        const list = Array.isArray(items) ? items : [];

        if (options.clear !== false) {
            container.innerHTML = "";
        }

        if (list.length === 0) {
            if (typeof options.emptyStateRenderer === "function") {
                const emptyNode = options.emptyStateRenderer();
                if (emptyNode) {
                    container.appendChild(emptyNode);
                }
            }
            return 0;
        }

        if (typeof renderItem !== "function") {
            return 0;
        }

        list.forEach((item, index) => {
            const node = renderItem(item, index);
            if (node) {
                container.appendChild(node);
            }
        });

        return list.length;
    },

    renderLazy(container, items = [], renderItem, options = {}) {
        if (!container) {
            return 0;
        }

        const list = Array.isArray(items) ? items : [];
        const chunkSize = Number.isInteger(Number(options.chunkSize))
            ? Math.max(10, Number(options.chunkSize))
            : 100;

        if (options.clear !== false) {
            container.innerHTML = "";
        }

        if (list.length === 0) {
            if (typeof options.emptyStateRenderer === "function") {
                const emptyNode = options.emptyStateRenderer();
                if (emptyNode) {
                    container.appendChild(emptyNode);
                }
            }
            return 0;
        }

        if (typeof renderItem !== "function") {
            return 0;
        }

        let index = 0;
        const appendChunk = () => {
            const fragment = document.createDocumentFragment();
            const end = Math.min(index + chunkSize, list.length);

            for (let i = index; i < end; i += 1) {
                const node = renderItem(list[i], i);
                if (node) {
                    fragment.appendChild(node);
                }
            }

            container.appendChild(fragment);
            index = end;

            if (index < list.length) {
                window.requestAnimationFrame(appendChunk);
            }
        };

        window.requestAnimationFrame(appendChunk);

        return list.length;
    }
};

const SelectorCache = {
    byId: new Map(),

    getById(id) {
        const key = String(id || "").trim();
        if (!key) {
            return null;
        }

        if (this.byId.has(key)) {
            const cached = this.byId.get(key);
            if (cached && document.contains(cached)) {
                return cached;
            }
            this.byId.delete(key);
        }

        const element = document.getElementById(key);
        if (element) {
            this.byId.set(key, element);
        }

        return element;
    },

    clear() {
        this.byId.clear();
    }
};

const Scheduler = {
    debounce(handler, delay = 120) {
        if (typeof handler !== "function") {
            return () => {};
        }

        let timeoutId = null;

        return function debouncedHandler(...args) {
            const context = this;

            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }

            timeoutId = window.setTimeout(() => {
                timeoutId = null;
                handler.apply(context, args);
            }, Math.max(0, Number(delay) || 0));
        };
    },

    throttle(handler, delay = 120) {
        if (typeof handler !== "function") {
            return () => {};
        }

        let lastRunAt = 0;
        let trailingTimeout = null;

        return function throttledHandler(...args) {
            const context = this;
            const now = Date.now();
            const wait = Math.max(0, Number(delay) || 0);
            const elapsed = now - lastRunAt;

            if (elapsed >= wait) {
                lastRunAt = now;
                handler.apply(context, args);
                return;
            }

            if (trailingTimeout) {
                window.clearTimeout(trailingTimeout);
            }

            trailingTimeout = window.setTimeout(() => {
                lastRunAt = Date.now();
                trailingTimeout = null;
                handler.apply(context, args);
            }, wait - elapsed);
        };
    },

    frame(handler) {
        if (typeof handler !== "function") {
            return () => {};
        }

        let queued = false;

        return function frameHandler(...args) {
            if (queued) {
                return;
            }

            queued = true;

            window.requestAnimationFrame(() => {
                queued = false;
                handler.apply(this, args);
            });
        };
    }
};

const EventDelegate = {
    on(root, eventName, selector, handler, options = false) {
        if (!root || typeof root.addEventListener !== "function" || typeof handler !== "function") {
            return null;
        }

        const listener = event => {
            const candidate = event.target?.closest?.(selector);
            if (!candidate || !root.contains(candidate)) {
                return;
            }

            handler(event, candidate);
        };

        root.addEventListener(eventName, listener, options);

        return {
            root,
            eventName,
            listener,
            options
        };
    },

    off(binding) {
        if (!binding || !binding.root || typeof binding.root.removeEventListener !== "function") {
            return;
        }

        binding.root.removeEventListener(binding.eventName, binding.listener, binding.options || false);
    }
};

const PerformanceBenchmark = {
    enabled: false,
    records: [],

    measure(label, operation) {
        const safeLabel = String(label || "operation");
        const start = performance.now();

        const finalize = (ok = true, error = null, value = null) => {
            const duration = performance.now() - start;
            this.records.push({
                label: safeLabel,
                duration,
                ok,
                error: error ? String(error.message || error) : null,
                at: Date.now()
            });

            if (this.enabled) {
                const state = ok ? "OK" : "ERR";
                console.log(`[Perf:${state}] ${safeLabel} ${duration.toFixed(2)}ms`);
            }

            return value;
        };

        try {
            const result = operation();
            if (result && typeof result.then === "function") {
                return result
                    .then(value => finalize(true, null, value))
                    .catch(error => {
                        finalize(false, error);
                        throw error;
                    });
            }

            return finalize(true, null, result);
        } catch (error) {
            finalize(false, error);
            throw error;
        }
    },

    summary() {
        if (this.records.length === 0) {
            return { total: 0, avg: 0, slowest: null };
        }

        const total = this.records.reduce((sum, item) => sum + item.duration, 0);
        const slowest = this.records.reduce((max, item) => item.duration > max.duration ? item : max, this.records[0]);

        return {
            total: this.records.length,
            avg: total / this.records.length,
            slowest
        };
    },

    clear() {
        this.records = [];
    }
};

window.DomHelper = DomHelper;
window.Notification = Notification;
window.Dialog = Dialog;
window.Sanitizer = Sanitizer;
window.Validator = Validator;
window.ErrorHandler = ErrorHandler;
window.FormEngine = FormEngine;
window.TableRenderer = TableRenderer;
window.CardRenderer = CardRenderer;
window.ChartManager = ChartManager;
window.ListRenderer = ListRenderer;
window.SelectorCache = SelectorCache;
window.Scheduler = Scheduler;
window.EventDelegate = EventDelegate;
window.PerformanceBenchmark = PerformanceBenchmark;

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
        FormEngine.reset(formId);
    },

    /**
     * Validate Required Field
     */
    validateRequired(value) {
        return Validator.required(value);
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
        Notification.success(message);
    },

    /**
     * Error Message
     */
    error(message) {
        ErrorHandler.notify(message, "error");
    },

    /**
     * Warning Message
     */
    warning(message) {
        ErrorHandler.notify(message, "warning");
    },

    /**
     * Confirmation Dialog
     */
    confirmDelete() {
        return Dialog.confirmSync("Are you sure you want to delete this record?");
    }

};

console.log("✔ Common Utilities Loaded");
