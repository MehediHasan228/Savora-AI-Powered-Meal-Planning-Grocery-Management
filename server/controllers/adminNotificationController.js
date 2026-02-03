const prisma = require('../prismaClient');
const notificationService = require('../services/notificationService');
const auditLog = require('../services/auditLogService');

/**
 * Admin Notification Controller
 * Handles manual broadcasts and notification analytics
 */

// @desc Send broadcast to a user segment
// @route POST /api/admin/notifications/broadcast
exports.sendBroadcast = async (req, res) => {
    try {
        const { title, message, segment, dietPreference, activityLink } = req.body;

        // 1. Define segments
        let whereClause = {};
        if (segment === 'DIET' && dietPreference) {
            whereClause.preferences = { contains: dietPreference };
        } else if (segment === 'INACTIVE') {
            // Logically inactive: No items added in last 7 days (simple mock)
            whereClause.updatedAt = { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        }

        const targetUsers = await prisma.user.findMany({ where: whereClause });

        let results = { total: targetUsers.length, sent: 0, failed: 0 };

        await Promise.all(targetUsers.map(async (user) => {
            const notif = await notificationService.createNotification({
                userId: user.id,
                title: `[BROADCAST] ${title}`,
                message,
                type: 'ADMIN',
                activityLink
            });
            if (notif) results.sent++;
            else results.failed++;
        }));

        await auditLog.logAction({
            adminId: req.user.id,
            action: 'BROADCAST',
            module: 'NOTIFICATIONS',
            targetId: segment,
            newData: { title, message, segment, dietPreference },
            ipAddress: req.ip
        });

        res.json({ message: 'Broadcast completed', results });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get notification analytics
// @route GET /api/admin/notifications/stats
exports.getNotificationStats = async (req, res) => {
    try {
        const total = await prisma.notification.count();
        const read = await prisma.notification.count({ where: { isRead: true } });

        const typeStats = await prisma.notification.groupBy({
            by: ['type'],
            _count: { _all: true }
        });

        const systemStatus = await prisma.systemSetting.findUnique({
            where: { key: 'NOTIFICATION_SYSTEM' }
        });

        res.json({
            total,
            readRate: total > 0 ? ((read / total) * 100).toFixed(1) + '%' : '0%',
            typeStats,
            systemStatus: systemStatus ? JSON.parse(systemStatus.value).status : 'ACTIVE'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Emergency stop for all future notifications
exports.emergencyStop = async (req, res) => {
    try {
        const { status } = req.body; // "PAUSED" or "ACTIVE"

        await prisma.systemSetting.upsert({
            where: { key: 'NOTIFICATION_SYSTEM' },
            update: { value: JSON.stringify({ status }) },
            create: { key: 'NOTIFICATION_SYSTEM', value: JSON.stringify({ status }) }
        });

        await auditLog.logAction({
            adminId: req.user.id,
            action: 'UPDATE',
            module: 'SYSTEM',
            targetId: 'EMERGENCY_STOP',
            newData: { status },
            ipAddress: req.ip
        });

        res.json({ message: `System ${status}. Notifications ${status === 'PAUSED' ? 'disabled' : 'enabled'}.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
