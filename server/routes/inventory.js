const express = require('express');
const router = express.Router();
const { getItems, addItem, updateItem, deleteItem, moveToGrocery, barcodeLookup, getSmartSuggestions } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getItems);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/move-to-grocery', moveToGrocery);
router.post('/barcode-lookup', barcodeLookup);
router.get('/suggestions', getSmartSuggestions);

module.exports = router;
