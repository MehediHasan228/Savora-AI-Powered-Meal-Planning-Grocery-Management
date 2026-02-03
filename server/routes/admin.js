const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const rbac = require('../middleware/rbacMiddleware');

// Controllers
const { getGroceryInsights, getWasteDetection } = require('../controllers/adminGroceryController');
const { sendBroadcast, getNotificationStats, emergencyStop } = require('../controllers/adminNotificationController');
const { getExecutiveKPIs, getUsageTrends } = require('../controllers/adminDashboardController');
const { getAuditLogs } = require('../controllers/systemController');
const { getAIConfig, updateAIConfig } = require('../controllers/aiTuningController');
const userController = require('../controllers/userController');

/**
 * ADMIN SYSTEM ROUTES
 * All routes here are protected and RBAC-controlled
 */

// --- Dashboard & Analytics ---
router.get('/dashboard/kpis', protect, rbac.authorize('SYSTEM', 'VIEW'), getExecutiveKPIs);
router.get('/dashboard/trends', protect, rbac.authorize('SYSTEM', 'VIEW'), getUsageTrends);
router.get('/grocery/insights', protect, rbac.authorize('SYSTEM', 'VIEW'), getGroceryInsights);
router.get('/grocery/waste', protect, rbac.authorize('SYSTEM', 'VIEW'), getWasteDetection);
router.get('/system/logs', protect, rbac.authorize('SYSTEM', 'LOGS'), getAuditLogs);

// --- User Management ---
router.get('/users', protect, rbac.authorize('USERS', 'VIEW'), userController.getUsers);
router.post('/users', protect, rbac.authorize('USERS', 'EDIT'), userController.createUser);
router.put('/users/:id', protect, rbac.authorize('USERS', 'EDIT'), userController.updateUser);
router.put('/users/:id/reset-password', protect, rbac.authorize('USERS', 'EDIT'), userController.resetPassword);
router.delete('/users/:id', protect, rbac.authorize('USERS', 'DELETE'), userController.deleteUser);

// --- Notification Command Center ---
router.post('/notifications/broadcast', protect, rbac.authorize('NOTIFICATIONS', 'BROADCAST'), sendBroadcast);
router.get('/notifications/stats', protect, rbac.authorize('NOTIFICATIONS', 'VIEW'), getNotificationStats);
router.post('/notifications/emergency-stop', protect, rbac.authorize('SYSTEM', 'SETTINGS'), emergencyStop);

// --- AI & Logic Tuning ---
router.get('/ai/tuning', protect, rbac.authorize('AI', 'VIEW'), getAIConfig);
router.post('/ai/tuning', protect, rbac.authorize('AI', 'TUNING'), updateAIConfig);

module.exports = router;
