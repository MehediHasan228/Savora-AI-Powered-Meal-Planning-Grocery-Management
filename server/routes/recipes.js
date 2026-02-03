const express = require('express');
const router = express.Router();
const { getRecipes, addRecipe, updateRecipe, deleteRecipe } = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getRecipes);
router.post('/', protect, addRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;
