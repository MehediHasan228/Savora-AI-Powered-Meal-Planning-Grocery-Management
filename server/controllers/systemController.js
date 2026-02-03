const prisma = require('../prismaClient');

/**
 * Get comprehensive system-wide statistics for the executive dashboard
 */
exports.getStats = async (req, res) => {
    try {
        // 1. User Stats & Plan Distribution
        const [totalUsers, userPlans] = await Promise.all([
            prisma.user.count(),
            prisma.user.groupBy({
                by: ['plan'],
                _count: { id: true }
            })
        ]);

        // 2. Inventory Stats & Distribution
        const [invLocations, expiringSoon, expired] = await Promise.all([
            prisma.item.groupBy({
                by: ['storageZone'],
                _count: { id: true }
            }),
            prisma.item.count({
                where: { status: 'Expiring Soon' }
            }),
            prisma.item.count({
                where: { status: 'Expired' }
            })
        ]);

        // 3. Grocery Stats (Estimated Budget)
        const activeGroceryItems = await prisma.groceryItem.findMany({
            where: { isBought: false },
            select: { price: true, qty: true }
        });
        const estimatedBudget = activeGroceryItems.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 1)), 0);

        // 4. Recipe Stats & Popular Cuisines
        const [totalRecipes, cuisines] = await Promise.all([
            prisma.recipe.count(),
            prisma.recipe.groupBy({
                by: ['cuisine'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            })
        ]);

        // 5. Recent Activity (Users, Recipes, Items)
        const [recentUsers, recentRecipes, recentItems] = await Promise.all([
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { name: true, createdAt: true }
            }),
            prisma.recipe.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { title: true, createdAt: true }
            }),
            prisma.item.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { name: true, storageZone: true, createdAt: true }
            })
        ]);

        res.json({
            users: {
                total: totalUsers,
                plans: userPlans.map(p => ({ plan: p.plan || 'Free', _count: { id: p._count.id } }))
            },
            inventory: {
                locations: invLocations.map(l => ({ storageZone: l.storageZone || 'Pantry', _count: { id: l._count.id } })),
                expiringSoon,
                expired
            },
            grocery: {
                estimatedBudget
            },
            recipes: {
                total: totalRecipes,
                cuisines: cuisines.map(c => ({ cuisine: c.cuisine || 'General', _count: { id: c._count.id } }))
            },
            recentActivity: {
                users: recentUsers,
                recipes: recentRecipes,
                items: recentItems
            }
        });
    } catch (err) {
        console.error('Detailed Get Stats Error:', err);
        res.status(500).json({
            message: 'Failed to process comprehensive system statistics',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

/**
 * System Logs Controller
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                admin: {
                    select: { name: true, email: true, avatar: true }
                }
            }
        });
        res.json(logs);
    } catch (err) {
        console.error('Get Audit Logs Error:', err);
        res.status(500).json({ message: err.message });
    }
};
