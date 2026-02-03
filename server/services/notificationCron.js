const prisma = require('../prismaClient');
const notificationService = require('./notificationService');

/**
 * Daily Task: Check Inventory for Expiry Alerts
 */
async function checkInventoryExpiry() {
    console.log('Running daily expiry check...');
    try {
        const now = new Date();
        const users = await prisma.user.findMany();

        for (const user of users) {
            // Get user's items
            const items = await prisma.item.findMany({
                where: { userId: user.id }
            });

            for (const item of items) {
                if (!item.expiry) continue;

                const exp = new Date(item.expiry);
                const diffTime = exp - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let title = '';
                let message = '';

                if (diffDays === 7) {
                    title = 'Expiry Warning (7 days)';
                    message = `Your "${item.name}" will expire in 7 days. Plan to use it soon!`;
                } else if (diffDays === 3) {
                    title = 'Expiry Warning (3 days)';
                    message = `Your "${item.name}" expires in 3 days. Time to get cooking!`;
                } else if (diffDays === 1) {
                    title = 'Urgent: Expiry Tomorrow';
                    message = `Your "${item.name}" expires tomorrow! Don't let it go to waste.`;
                } else if (diffDays === 0) {
                    title = 'Item Expired';
                    message = `Your "${item.name}" expires today. Use it now or it might be too late!`;
                }

                if (title) {
                    await notificationService.createNotification({
                        userId: user.id,
                        title,
                        message,
                        type: 'EXPIRY',
                        activityLink: '/inventory'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error in checkInventoryExpiry:', error);
    }
}

/**
 * Daily Task: Meal Suggestions
 * Based on items expiring soon or meal plans
 */
async function sendMealSuggestions() {
    console.log('Running daily meal suggestion job...');
    try {
        const users = await prisma.user.findMany();
        for (const user of users) {
            // Logic: Find items expiring within 3 days and suggest recipes
            const expiringSoon = await prisma.item.findMany({
                where: {
                    userId: user.id,
                    expiry: {
                        lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                        gte: new Date()
                    }
                },
                take: 1
            });

            if (expiringSoon.length > 0) {
                const item = expiringSoon[0];
                await notificationService.createNotification({
                    userId: user.id,
                    title: 'Dinner Idea 🍽️',
                    message: `You have "${item.name}" expiring soon. Why not try a quick recipe using it?`,
                    type: 'MEAL',
                    activityLink: '/recipes'
                });
            }
        }
    } catch (error) {
        console.error('Error in sendMealSuggestions:', error);
    }
}

/**
 * Reminder for Grocery List
 */
async function sendGroceryReminders() {
    console.log('Running grocery reminder job...');
    try {
        const users = await prisma.user.findMany();
        for (const user of users) {
            const buyNowCount = await prisma.groceryItem.count({
                where: {
                    userId: user.id,
                    buyStatus: 'NOW',
                    isBought: false
                }
            });

            if (buyNowCount >= 3) {
                await notificationService.createNotification({
                    userId: user.id,
                    title: 'Grocery Reminder 🛒',
                    message: `You have ${buyNowCount} items on your "Buy Now" list. Ready for a shopping trip?`,
                    type: 'GROCERY',
                    activityLink: '/grocery'
                });
            }
        }
    } catch (error) {
        console.error('Error in sendGroceryReminders:', error);
    }
}

module.exports = {
    checkInventoryExpiry,
    sendMealSuggestions,
    sendGroceryReminders
};
