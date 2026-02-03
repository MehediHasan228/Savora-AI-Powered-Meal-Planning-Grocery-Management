const prisma = require('../prismaClient');

// @desc Get inventory summary for admin
// @route GET /api/admin/inventory/summary
exports.getInventorySummary = async (req, res) => {
    try {
        // 1. Most stored ingredients
        const topItems = await prisma.item.groupBy({
            by: ['name'],
            _count: { name: true },
            orderBy: { _count: { name: 'desc' } },
            take: 10
        });

        // 2. Most wasted (expired) items
        const wasteItems = await prisma.item.groupBy({
            by: ['name'],
            where: { status: 'Expired' },
            _count: { name: true },
            orderBy: { _count: { name: 'desc' } },
            take: 10
        });

        // 3. Storage usage distribution
        const storageDist = await prisma.item.groupBy({
            by: ['storageZone'],
            _count: { storageZone: true }
        });

        // 4. Total waste vs fresh
        const statusDist = await prisma.item.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        res.json({
            topItems,
            wasteItems,
            storageDist,
            statusDist,
            totalItems: await prisma.item.count(),
            totalUsersTracking: (await prisma.item.groupBy({ by: ['userId'] })).length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get waste trends (simulated for now by using addedDate)
// @route GET /api/admin/inventory/trends
exports.getInventoryTrends = async (req, res) => {
    try {
        const items = await prisma.item.findMany({
            select: { addedDate: true, status: true },
            orderBy: { addedDate: 'asc' }
        });

        // Group by month
        const trends = items.reduce((acc, item) => {
            const month = item.addedDate.toLocaleString('default', { month: 'short' });
            if (!acc[month]) acc[month] = { month, added: 0, wasted: 0 };
            acc[month].added++;
            if (item.status === 'Expired') acc[month].wasted++;
            return acc;
        }, {});

        res.json(Object.values(trends));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
