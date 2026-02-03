const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { protect, isManager } = require('../middleware/authMiddleware');

// Get system stats - restricted to admins and managers for dashboard view
router.get('/stats', protect, isManager, systemController.getStats);

module.exports = router;
