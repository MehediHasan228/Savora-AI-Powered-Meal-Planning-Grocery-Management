const express = require('express');
const router = express.Router();
const { getGroceryItems, addGroceryItem, updateGroceryItem, deleteGroceryItem, clearCompleted, toggleGroceryItem, bulkAddGroceryItems, moveBoughtToInventory, suggestCategory, togglePriority, refreshClassifications } = require('../controllers/groceryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getGroceryItems);
router.get('/suggest-category', protect, suggestCategory);
router.post('/', protect, addGroceryItem);
router.post('/refresh', protect, refreshClassifications);
router.post('/bulk', protect, bulkAddGroceryItems);
router.post('/move-to-inventory', protect, moveBoughtToInventory);
router.put('/:id', protect, updateGroceryItem);
router.patch('/:id/toggle', protect, toggleGroceryItem);
router.patch('/:id/toggle-priority', protect, togglePriority);
router.delete('/:id', protect, deleteGroceryItem);
router.delete('/completed', protect, clearCompleted);

module.exports = router;
