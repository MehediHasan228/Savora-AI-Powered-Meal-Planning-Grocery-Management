/**
 * Computes the expiry status and color metadata for a given date.
 * @param {string} expiryDate - The expiry date as an ISO string (YYYY-MM-DD).
 * @returns {Object} { status, color, daysDiff, label }
 */
export const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
        return {
            status: 'Fresh',
            color: 'green',
            daysDiff: Infinity,
            label: 'Fresh'
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            status: 'Expired',
            color: 'red',
            daysDiff: diffDays,
            label: 'Expired'
        };
    }

    if (diffDays === 0) {
        return {
            status: 'Expiring Soon',
            color: 'red',
            daysDiff: diffDays,
            label: 'Expires Today'
        };
    }

    if (diffDays <= 7) {
        return {
            status: 'Expiring Soon',
            color: 'yellow',
            daysDiff: diffDays,
            label: `Expiring Soon (${diffDays}d)`
        };
    }

    return {
        status: 'Fresh',
        color: 'green',
        daysDiff: diffDays,
        label: 'Fresh'
    };
};

/**
 * Maps color names to Tailwind CSS classes.
 * @param {string} color - 'red', 'yellow', or 'green'.
 * @returns {string} CSS classes for the badge.
 */
export const getExpiryBadgeClasses = (color) => {
    switch (color) {
        case 'red':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'yellow':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'green':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};
