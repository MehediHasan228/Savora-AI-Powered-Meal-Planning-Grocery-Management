const prisma = require('../prismaClient');

/**
 * Admin Grocery Behavior Analytics
 * Provides insights into user purchasing habits, tendencies, and waste
 */

// @desc Get comprehensive grocery behavior insights
// @route GET /api/admin/grocery/insights
exports.getGroceryInsights = async (req, res) => {
    try {
        // 1. Most Purchased Items (Historical frequency)
        const mostPurchased = await prisma.groceryItem.groupBy({
            by: ['name'],
            _count: { name: true },
            where: { isBought: true },
            orderBy: { _count: { name: 'desc' } },
            take: 10
        });

        // 2. Average List Size (Active items per user)
        const activeItemsCount = await prisma.groceryItem.count({
            where: { isBought: false }
        });
        const usersCount = await prisma.user.count();
        const avgListSize = usersCount > 0 ? (activeItemsCount / usersCount).toFixed(1) : 0;

        // 3. Postponement Habits (Buy Later frequency)
        const postponedItems = await prisma.groceryItem.count({
            where: { buyStatus: 'LATER', isBought: false }
        });

        // 4. Overbuy Tendency (Items bought while already in stock)
        // This is a complex query, we'll simulate it by checking items bought multiple times in short periods
        // Or comparing bought grocery items with existing inventory levels
        const boughtItems = await prisma.groceryItem.findMany({
            where: { isBought: true },
            select: { name: true, userId: true, boughtAt: true }
        });

        let overbuyCount = 0;
        for (const bItem of boughtItems.slice(-20)) { // Check last 20 purchases for example
            const invItems = await prisma.item.findMany({
                where: { userId: bItem.userId, name: { contains: bItem.name } }
            });
            const existingFull = invItems.some(i => parseFloat(i.qty) > 2); // Simulating threshold
            if (existingFull) overbuyCount++;
        }

        res.json({
            mostPurchased,
            avgListSize,
            postponedItems,
            overbuyTendency: boughtItems.length > 0 ? ((overbuyCount / Math.min(boughtItems.length, 20)) * 100).toFixed(0) + '%' : '0%',
            totalPurchases: boughtItems.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get waste detection metrics
exports.getWasteDetection = async (req, res) => {
    try {
        // Detect items that are frequently bought but also show up in Expired status in inventory
        const expiredNames = await prisma.item.findMany({
            where: { status: 'Expired' },
            select: { name: true }
        });

        const wasteFrequency = {};
        expiredNames.forEach(i => {
            wasteFrequency[i.name] = (wasteFrequency[i.name] || 0) + 1;
        });

        const highWasteItems = Object.entries(wasteFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        res.json({
            highWasteItems,
            totalExpired: expiredNames.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
