"use strict";

/*==================================================
 SFM PRO Enterprise
 File: events.js
 Version: v3.5 Stable
 Description:
 Global Event Bus
==================================================*/

const EventBus = (() => {

    const events = {};

    return {

        on(event, callback) {

            if (!events[event]) {
                events[event] = [];
            }

            events[event].push(callback);
        },

        emit(event, data = null) {

            if (!events[event]) return;

            events[event].forEach(callback => callback(data));
        },

        off(event, callback) {

            if (!events[event]) return;

            events[event] = events[event].filter(
                item => item !== callback
            );
        },

        once(event, callback) {

            const wrapper = (data) => {

                callback(data);

                this.off(event, wrapper);

            };

            this.on(event, wrapper);

        }

    };

})();

const EventRegistry = (() => {
    const bindings = new Map();
    let sequence = 0;

    const createToken = () => {
        sequence += 1;
        return `evt-${sequence}`;
    };

    return {
        on(target, eventName, handler, options = false) {
            if (!target || typeof target.addEventListener !== "function" || typeof handler !== "function") {
                return null;
            }

            const token = createToken();

            target.addEventListener(eventName, handler, options);
            bindings.set(token, {
                target,
                eventName,
                handler,
                options
            });

            return token;
        },

        off(token) {
            if (!bindings.has(token)) {
                return false;
            }

            const binding = bindings.get(token);
            binding.target.removeEventListener(
                binding.eventName,
                binding.handler,
                binding.options
            );

            bindings.delete(token);
            return true;
        },

        clear() {
            Array.from(bindings.keys()).forEach(token => this.off(token));
        },

        size() {
            return bindings.size;
        }
    };
})();

window.EventRegistry = EventRegistry;

console.log("Event Bus Loaded");
