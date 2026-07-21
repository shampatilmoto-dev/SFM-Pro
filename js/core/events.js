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

console.log("Event Bus Loaded");
