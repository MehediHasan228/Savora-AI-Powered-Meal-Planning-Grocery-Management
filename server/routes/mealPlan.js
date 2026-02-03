const express = require('express');
const router = express.Router();
const { getWeekPlan, generateWeekPlan, updateMealSlot, deleteMealSlot, addIngredientsToGrocery } = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWeekPlan);
router.post('/generate', protect, generateWeekPlan);
router.put('/slot', protect, updateMealSlot);
router.delete('/slot', protect, deleteMealSlot);
router.post('/grocery-sync', protect, addIngredientsToGrocery);

module.exports = router;
