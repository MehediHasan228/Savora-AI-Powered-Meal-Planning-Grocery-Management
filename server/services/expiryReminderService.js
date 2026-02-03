const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Expiry Reminder Service
 * Manages reminder creation and status calculation
 */

// Helper: Calculate status based on expiry date
function calculateStatus(expiryDate) {
    if (!expiryDate) return 'Fresh';

    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 3) return 'Expiring Soon';
    if (daysUntilExpiry <= 7) return 'Expiring Soon';
    return 'Fresh';
}

// Helper: Get default expiry days based on storage zone
function getDefaultExpiryDays(storageZone, category) {
    const defaults = {
        'Freezer': 90,  // 3 months
        'Pantry': 180,  // 6 months
        'Fridge': {
            'Meat': 3,
            'Dairy': 7,
            'Vegetables': 7,
            'Fruits': 5,
            'default': 7
        }
    };

    if (storageZone === 'Fridge') {
        return defaults.Fridge[category] || defaults.Fridge.default;
    }

    return defaults[storageZone] || 30;
}

// Create reminders for an item
async function createReminders(itemId, expiryDate) {
    if (!expiryDate) return;

    const expiry = new Date(expiryDate);
    const reminders = [];

    // 7 days before
    const reminder7 = new Date(expiry);
    reminder7.setDate(expiry.getDate() - 7);
    if (reminder7 > new Date()) {
        reminders.push({
            itemId,
            reminderDate: reminder7,
            type: '7_days'
        });
    }

    // 3 days before
    const reminder3 = new Date(expiry);
    reminder3.setDate(expiry.getDate() - 3);
    if (reminder3 > new Date()) {
        reminders.push({
            itemId,
            reminderDate: reminder3,
            type: '3_days'
        });
    }

    // On expiry day
    if (expiry > new Date()) {
        reminders.push({
            itemId,
            reminderDate: expiry,
            type: 'today'
        });
    }

    // Create all reminders
    if (reminders.length > 0) {
        await prisma.expiryReminder.createMany({
            data: reminders
        });
    }
}

// Get items expiring within X days
async function getExpiringItems(userId, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await prisma.item.findMany({
        where: {
            userId,
            expiry: {
                lte: futureDate,
                gte: new Date()
            }
        },
        orderBy: {
            expiry: 'asc'
        }
    });
}

// Get pending reminders for today
async function getPendingReminders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.expiryReminder.findMany({
        where: {
            sent: false,
            reminderDate: {
                gte: today,
                lt: tomorrow
            }
        },
        include: {
            item: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    });
}

// Mark reminder as sent
async function markReminderSent(reminderId) {
    return await prisma.expiryReminder.update({
        where: { id: reminderId },
        data: { sent: true }
    });
}

// Update item status based on expiry
async function updateItemStatuses() {
    const items = await prisma.item.findMany({
        where: {
            expiry: { not: null }
        }
    });

    for (const item of items) {
        const newStatus = calculateStatus(item.expiry);

        if (newStatus !== item.status) {
            await prisma.item.update({
                where: { id: item.id },
                data: { status: newStatus }
            });
        }
    }
}

module.exports = {
    calculateStatus,
    getDefaultExpiryDays,
    createReminders,
    getExpiringItems,
    getPendingReminders,
    markReminderSent,
    updateItemStatuses
};
