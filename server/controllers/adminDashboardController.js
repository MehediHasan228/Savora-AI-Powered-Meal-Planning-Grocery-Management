const prisma = require('../prismaClient');

/**
 * Admin Dashboard Controller
 * Aggregates high-level KPIs for the Executive Command Center
 */

exports.getExecutiveKPIs = async (req, res) => {
    try {
        // 1. User Activity (DAU/MAU)
        const totalUsers = await prisma.user.count();
        const activeToday = await prisma.user.count({
            where: {
                updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        });
        const activeMonth = await prisma.user.count({
            where: {
                updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
        });

        // 2. Meal Planning & Conversion
        const totalMealPlans = await prisma.mealPlan.count();
        const mealPlansThisWeek = await prisma.mealPlan.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        });

        // 3. Inventory & Grocery Conversion
        const totalGroceryItems = await prisma.groceryItem.count();
        const boughtItems = await prisma.groceryItem.count({ where: { isBought: true } });
        const groceryConversionRate = totalGroceryItems > 0 ? ((boughtItems / totalGroceryItems) * 100).toFixed(1) : 0;

        // 4. API Usage & Cost Estimates
        const apiLogs = await prisma.apiUsageLog.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            select: { cost: true }
        });
        const totalApiCost = apiLogs.reduce((acc, log) => acc + (log.cost || 0), 0);

        // 5. System Health & Waste %
        const expiredItems = await prisma.item.count({ where: { status: 'Expired' } });
        const totalItems = await prisma.item.count();
        const wasteRate = totalItems > 0 ? ((expiredItems / totalItems) * 100).toFixed(1) : 0;

        // 6. Notification Engagement
        const totalNotifications = await prisma.notification.count();
        const readNotifications = await prisma.notification.count({ where: { isRead: true } });
        const notificationOpenRate = totalNotifications > 0 ? ((readNotifications / totalNotifications) * 100).toFixed(1) : 0;

        res.json({
            users: {
                total: totalUsers,
                dau: activeToday,
                mau: activeMonth
            },
            activity: {
                mealPlansTotal: totalMealPlans,
                mealPlansWeekly: mealPlansThisWeek,
                groceryConversion: groceryConversionRate + '%'
            },
            finances: {
                estimatedApiCost: '$' + totalApiCost.toFixed(2),
                billableCalls: apiLogs.length
            },
            health: {
                inventoryWaste: wasteRate + '%',
                notificationOpenRate: notificationOpenRate + '%'
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get usage trends for charts
exports.getUsageTrends = async (req, res) => {
    try {
        // Aggregate last 7 days of activity
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const trends = await Promise.all(days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const userCount = await prisma.user.count({
                where: { createdAt: { gte: date, lt: nextDay } }
            });
            const itemLinks = await prisma.groceryItem.count({
                where: { createdAt: { gte: date, lt: nextDay } }
            });

            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                newUsers: userCount,
                activity: itemLinks
            };
        }));

        res.json(trends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
