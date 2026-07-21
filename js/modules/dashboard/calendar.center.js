"use strict";

const CalendarCenter = {
    sort(events) {
        return [...(events || [])].sort((left, right) => {
            const leftDate = new Date(`${left.date}T00:00:00`).getTime();
            const rightDate = new Date(`${right.date}T00:00:00`).getTime();

            return leftDate - rightDate;
        });
    }
};