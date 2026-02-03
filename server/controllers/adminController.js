const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc Get API usage statistics
// @route GET /api/admin/api-usage
exports.getApiUsage = async (req, res) => {
    try {
        const { period = 'daily' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        if (period === 'daily') {
            startDate.setDate(now.getDate() - 7); // Last 7 days
        } else if (period === 'monthly') {
            startDate.setMonth(now.getMonth() - 1); // Last month
        }

        // Get usage logs
        const logs = await prisma.apiUsageLog.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate statistics
        const totalCalls = logs.length;
        const successfulCalls = logs.filter(l => l.success).length;
        const failedCalls = logs.filter(l => !l.success).length;
        const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

        // Group by endpoint
        const byEndpoint = logs.reduce((acc, log) => {
            acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
            return acc;
        }, {});

        // Group by date for chart
        const byDate = logs.reduce((acc, log) => {
            const date = log.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        res.json({
            summary: {
                totalCalls,
                successfulCalls,
                failedCalls,
                successRate: totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : 0,
                estimatedCost: totalCost
            },
            byEndpoint,
            byDate,
            recentLogs: logs.slice(0, 50)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// @desc Get cached recipes
// @route GET /api/admin/cache
exports.getCachedRecipes = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const [recipes, total] = await Promise.all([
            prisma.recipeCache.findMany({
                orderBy: { popularity: 'desc' },
                take: parseInt(limit),
                skip: parseInt(skip)
            }),
            prisma.recipeCache.count()
        ]);

        // Calculate cache statistics
        const now = new Date();
        const valid = recipes.filter(r => new Date(r.expiresAt) > now).length;
        const expired = recipes.length - valid;

        res.json({
            recipes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            stats: {
                total,
                valid,
                expired
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// @desc Clear specific cache entry
// @route DELETE /api/admin/cache/:id
exports.clearCacheEntry = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.recipeCache.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Cache entry deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// @desc Clear all cache
// @route DELETE /api/admin/cache/all
exports.clearAllCache = async (req, res) => {
    try {
        const result = await prisma.recipeCache.deleteMany({});

        res.json({
            message: `Cleared ${result.count} cache entries successfully`,
            count: result.count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// @desc Force refresh a specific recipe
// @route POST /api/admin/cache/refresh
exports.refreshCache = async (req, res) => {
    try {
        const { spoonacularId } = req.body;

        // Delete existing cache
        await prisma.recipeCache.deleteMany({
            where: { spoonacularId: parseInt(spoonacularId) }
        });

        res.json({
            message: 'Cache cleared. Next fetch will refresh from API.',
            spoonacularId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
