const express = require('express');
const router = express.Router();
const externalRecipeController = require('../controllers/externalRecipeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, externalRecipeController.searchRecipes);
router.get('/:id', protect, externalRecipeController.getRecipeDetails);

module.exports = router;
