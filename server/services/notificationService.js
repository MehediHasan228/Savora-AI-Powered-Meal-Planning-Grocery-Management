const prisma = require('../prismaClient');

/**
 * Notification Service
 * Handles creation, throttling, and anti-spam logic for user notifications
 */

// Throttling configuration
const THROTTLE_LIMITS = {
    'MEAL': 1, // Max 1 meal suggestion per 24 hours
    'GROCERY': 3, // Max 3 grocery reminders per 24 hours
    'EXPIRY': 5, // Max 5 expiry alerts per 24 hours
};

/**
 * Create a notification for a user with throttling and anti-spam logic
 * @param {Object} data - { userId, title, message, type, activityLink }
 */
async function createNotification({ userId, title, message, type, activityLink }) {
    try {
        // 0. Global Emergency Stop Check
        const systemStatus = await prisma.systemSetting.findUnique({
            where: { key: 'NOTIFICATION_SYSTEM' }
        });
        if (systemStatus) {
            const { status } = JSON.parse(systemStatus.value);
            if (status === 'PAUSED' && type !== 'ADMIN') { // Allow Admin overrides if needed
                console.log('System-wide notification pause active. Skipping notification.');
                return null;
            }
        }

        // 1. Check User Notification Settings
        const settings = await prisma.notificationSetting.findUnique({
            where: { userId }
        });

        // If settings exist, check if this type is enabled
        if (settings) {
            if (type === 'EXPIRY' && !settings.expiryAlerts) return null;
            if (type === 'GROCERY' && !settings.groceryReminders) return null;
            if (type === 'MEAL' && !settings.mealSuggestions) return null;

            // Simple Silent Hours check (Mock implementation for now)
            const now = new Date();
            const hour = now.getHours();
            // Default silent hours if set: e.g., "22:00" -> 22
            const startHour = settings.silentHoursStart ? parseInt(settings.silentHoursStart.split(':')[0]) : null;
            const endHour = settings.silentHoursEnd ? parseInt(settings.silentHoursEnd.split(':')[0]) : null;

            if (startHour !== null && endHour !== null) {
                if (startHour > endHour) { // Wraps around midnight
                    if (hour >= startHour || hour < endHour) return null;
                } else {
                    if (hour >= startHour && hour < endHour) return null;
                }
            }
        }

        // 2. Anti-Spam / Throttling
        const limit = THROTTLE_LIMITS[type] || 10;
        const last24hCount = await prisma.notification.count({
            where: {
                userId,
                type,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        });

        if (last24hCount >= limit) {
            console.log(`Notification throttled for user ${userId}, type ${type}. Limit reached.`);
            return null;
        }

        // 3. Duplicate check (Don't send same message in last 6 hours)
        const duplicate = await prisma.notification.findFirst({
            where: {
                userId,
                message,
                createdAt: {
                    gte: new Date(Date.now() - 6 * 60 * 60 * 1000)
                }
            }
        });
        if (duplicate) return null;

        // 4. Create Notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                activityLink
            }
        });

        return notification;
    } catch (error) {
        console.error('Error in createNotification:', error);
        return null;
    }
}

/**
 * Mark a notification as read
 */
async function markAsRead(id) {
    return await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
}

/**
 * Get unread notifications for a user
 */
async function getUnreadNotifications(userId) {
    return await prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' }
    });
}

/**
 * Initialize settings for a new user
 */
async function initUserSettings(userId) {
    return await prisma.notificationSetting.upsert({
        where: { userId },
        update: {},
        create: {
            userId,
            expiryAlerts: true,
            groceryReminders: true,
            mealSuggestions: true
        }
    });
}

module.exports = {
    createNotification,
    markAsRead,
    getUnreadNotifications,
    initUserSettings
};
