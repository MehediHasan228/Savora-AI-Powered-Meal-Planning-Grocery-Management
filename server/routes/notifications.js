const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');
const prisma = require('../prismaClient');

// @desc Get all notifications for current user
// @route GET /api/notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const notification = await prisma.notification.update({
            where: { id, userId: req.user.id },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc Mark all as read
// @route PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc Get/Update notification settings
// @route GET /api/notifications/settings
router.get('/settings', protect, async (req, res) => {
    try {
        let settings = await prisma.notificationSetting.findUnique({
            where: { userId: req.user.id }
        });
        if (!settings) {
            settings = await notificationService.initUserSettings(req.user.id);
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/settings', protect, async (req, res) => {
    try {
        const settings = await prisma.notificationSetting.upsert({
            where: { userId: req.user.id },
            update: req.body,
            create: { ...req.body, userId: req.user.id }
        });
        res.json(settings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
