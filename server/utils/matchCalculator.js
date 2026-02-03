/**
 * Match Percentage Calculator
 * Calculates how well a recipe matches user preferences
 * 
 * Scoring Breakdown:
 * - Diet Match: 30%
 * - Calorie Range: 25%
 * - Available Ingredients: 25%
 * - No Allergies: 20%
 */

/**
 * Calculate match percentage for a recipe
 * @param {Object} recipe - Recipe object with nutrients, ingredients, etc
 * @param {Object} userPrefs - User preferences object
 * @param {Array} inventoryItems - List of item names in user's inventory
 * @param {Array} expiringItems - List of item names expiring soon
 * @param {Object} aiConfig - Global AI Tuning parameters
 * @returns {number} Match percentage (0-100)
 */
function calculateMatch(recipe, userPrefs, inventoryItems = [], expiringItems = [], aiConfig = {}) {
    let totalScore = 0;

    // Use dynamic weights from Admin Panel, fallback to defaults
    const weights = {
        diet: 25,
        calories: 20,
        inventory: 30,
        allergies: 15,
        expiry: (aiConfig.expiryWeight || 0.8) * 12.5 // Normalize 0.8 -> ~10 bonus
    };

    // Parse preferences
    const preferences = typeof userPrefs === 'string' ? JSON.parse(userPrefs) : userPrefs;
    const {
        dietaryPreferences = [],
        maxCalories = 800,
        allergies = ''
    } = preferences;

    // 1. Diet Match (25%)
    const recipeDiets = (recipe.diets || []).map(d => d.toLowerCase());
    const dietMatches = dietaryPreferences.filter(diet =>
        recipeDiets.some(rd => rd.includes(diet.toLowerCase()))
    );
    const dietScore = dietaryPreferences.length > 0
        ? (dietMatches.length / dietaryPreferences.length) * weights.diet
        : weights.diet;

    totalScore += dietScore;

    // 2. Calorie Range (20%)
    const recipeCalories = recipe.calories || recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || recipe.nutrition?.calories || 0;
    let calorieScore = 0;

    if (recipeCalories <= maxCalories) {
        calorieScore = weights.calories;
    } else {
        const overage = recipeCalories - maxCalories;
        const maxOverage = maxCalories * 0.5;
        const penalty = Math.min(overage / maxOverage, 1);
        calorieScore = weights.calories * (1 - penalty);
    }

    totalScore += calorieScore;

    // 3. Available Ingredients (30%) - Match Threshold Integration
    let ingredientsList = [];
    try {
        const rawIngredients = recipe.ingredients || recipe.extendedIngredients || [];
        ingredientsList = typeof rawIngredients === 'string' ? JSON.parse(rawIngredients) : rawIngredients;
    } catch (e) {
        ingredientsList = [];
    }

    const recipeIngredients = (Array.isArray(ingredientsList) ? ingredientsList : [])
        .map(ing => (ing.name || ing).toLowerCase());

    if (recipeIngredients.length > 0 && inventoryItems.length > 0) {
        const invSet = new Set(inventoryItems.map(i => i.toLowerCase()));
        const matches = recipeIngredients.filter(ing =>
            invSet.has(ing) || [...invSet].some(inv => ing.includes(inv) || inv.includes(ing))
        );

        const matchRatio = matches.length / recipeIngredients.length;
        const threshold = (aiConfig.matchPercentageThreshold || 75) / 100;

        // If below threshold, apply aggressive penalty
        if (matchRatio < threshold) {
            totalScore += (matchRatio * weights.inventory) * 0.5;
        } else {
            totalScore += matchRatio * weights.inventory;
        }
    } else if (recipeIngredients.length === 0) {
        totalScore += weights.inventory * 0.5;
    }

    // 4. Allergies Check (15%)
    const allergyList = allergies.toLowerCase().split(',').map(a => a.trim()).filter(Boolean);
    let allergyScore = weights.allergies;

    if (allergyList.length > 0) {
        const ingredientString = recipeIngredients.join(' ');
        const hasAllergen = allergyList.some(allergy => ingredientString.includes(allergy));
        allergyScore = hasAllergen ? 0 : weights.allergies;
    }
    totalScore += allergyScore;

    // 5. Expiring Soon Bonus (Weighted)
    if (expiringItems.length > 0 && recipeIngredients.length > 0) {
        const expSet = new Set(expiringItems.map(i => i.toLowerCase()));
        const hasExpiringMatch = recipeIngredients.some(ing =>
            expSet.has(ing) || [...expSet].some(exp => ing.includes(exp) || exp.includes(ing))
        );
        if (hasExpiringMatch) totalScore += weights.expiry;
    }

    return Math.round(totalScore);
}

/**
 * Get match badge text based on score
 */
function getMatchBadge(score) {
    if (score >= 90) return { text: '🔥 Perfect Match', color: 'emerald' };
    if (score >= 80) return { text: '✨ Excellent Match', color: 'green' };
    if (score >= 70) return { text: '👍 Good Match', color: 'blue' };
    if (score >= 60) return { text: '✓ Decent Match', color: 'yellow' };
    return { text: '⚠️ Poor Match', color: 'gray' };
}

module.exports = {
    calculateMatch,
    getMatchBadge
};
