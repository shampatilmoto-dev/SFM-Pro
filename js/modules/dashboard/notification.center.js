"use strict";

const NotificationCenter = {
    priorities: {
        critical: 0,
        warning: 1,
        info: 2
    },

    sort(notifications) {
        return [...(notifications || [])].sort((left, right) => {
            const priorityDifference = (this.priorities[left.severity] ?? 3) -
                (this.priorities[right.severity] ?? 3);

            if (priorityDifference !== 0) {
                return priorityDifference;
            }

            return new Date(left.date || 0) - new Date(right.date || 0);
        });
    }
};