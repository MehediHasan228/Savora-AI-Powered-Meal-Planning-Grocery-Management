const express = require('express');
const router = express.Router();
const {
    getStats,
    getTableData,
    getRecord,
    updateRecord,
    deleteRecord,
    createRecord
} = require('../controllers/databaseController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.get('/stats', protect, getStats);
router.get('/:table', protect, getTableData);
router.get('/:table/:id', protect, getRecord);
router.post('/:table', protect, createRecord);
router.put('/:table/:id', protect, updateRecord);
router.delete('/:table/:id', protect, deleteRecord);

module.exports = router;
