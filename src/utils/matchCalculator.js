/**
 * Smart Recipe Match Calculator
 * Framework-agnostic utility for calculating recipe match percentages
 * 
 * Weights:
 * - Inventory Matching: 70%
 * - Dietary/Cuisine Preferences: 15%
 * - Time & Calorie Goals: 15%
 */

/**
 * Normalize ingredient name for comparison
 * @param {string} name - Ingredient name
 * @returns {string} - Normalized lowercase name
 */
const normalizeIngredient = (name) => {
    return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

/**
 * Calculate inventory matching score (70% weight)
 * @param {string[]} recipeIngredients - List of recipe ingredients
 * @param {string[]} inventoryNames - List of inventory item names
 * @returns {number} - Score from 0 to 70
 */
const calculateInventoryScore = (recipeIngredients, inventoryNames) => {
    if (!recipeIngredients || recipeIngredients.length === 0) {
        return 70; // Full score if no ingredients needed
    }

    const normalizedInventory = inventoryNames.map(normalizeIngredient);

    let matchedCount = 0;
    recipeIngredients.forEach(ingredient => {
        const normalizedIngredient = normalizeIngredient(ingredient);
        // Check if any inventory item contains the ingredient name
        const isMatched = normalizedInventory.some(inv =>
            inv.includes(normalizedIngredient) || normalizedIngredient.includes(inv)
        );
        if (isMatched) matchedCount++;
    });

    const matchPercentage = matchedCount / recipeIngredients.length;
    return Math.round(matchPercentage * 70);
};

/**
 * Calculate dietary preference score (15% weight)
 * @param {string} recipeCuisine - Recipe cuisine type
 * @param {string[]} dietaryPreferences - User's dietary preferences
 * @param {string[]} cuisinePreferences - User's cuisine preferences
 * @returns {number} - Score from 0 to 15
 */
const calculateDietaryScore = (recipeCuisine, dietaryPreferences = [], cuisinePreferences = []) => {
    const normalizedCuisine = recipeCuisine.toLowerCase();

    // Check cuisine preferences
    const cuisineMatch = cuisinePreferences.some(pref =>
        pref.toLowerCase() === normalizedCuisine
    );

    // Check dietary preferences (e.g., 'seafood', 'vegetarian')
    const dietaryMatch = dietaryPreferences.some(pref =>
        normalizedCuisine.includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(normalizedCuisine)
    );

    if (cuisineMatch || dietaryMatch) {
        return 15;
    }

    // Partial score if preferences exist but don't match
    if (cuisinePreferences.length === 0 && dietaryPreferences.length === 0) {
        return 15; // Full score if no preferences set
    }

    return 0;
};

/**
 * Calculate time and calorie goals score (15% weight)
 * @param {number} recipeTime - Recipe cook time in minutes
 * @param {number} recipeCalories - Recipe calories
 * @param {number} maxCookTime - User's max cook time preference
 * @param {number} maxCalories - User's max calorie preference
 * @returns {number} - Score from 0 to 15
 */
const calculateTimeCalorieScore = (recipeTime, recipeCalories, maxCookTime, maxCalories) => {
    let score = 0;

    // Time score (7.5 points)
    if (!maxCookTime || recipeTime <= maxCookTime) {
        score += 7.5;
    } else if (recipeTime <= maxCookTime * 1.25) {
        // Partial credit if within 25% of limit
        score += 3.75;
    }

    // Calorie score (7.5 points)
    if (!maxCalories || recipeCalories <= maxCalories) {
        score += 7.5;
    } else if (recipeCalories <= maxCalories * 1.25) {
        // Partial credit if within 25% of limit
        score += 3.75;
    }

    return score;
};

/**
 * Calculate overall match score for a recipe
 * @param {Object} recipe - Recipe object
 * @param {string[]} inventoryNames - List of inventory item names
 * @param {Object} userPrefs - User preferences object
 * @returns {number} - Match score from 0 to 100
 */
export const calculateMatchScore = (recipe, inventoryNames = [], userPrefs = {}) => {
    const {
        dietaryPreferences = [],
        cuisinePreferences = [],
        maxCookTime = null,
        maxCalories = null
    } = userPrefs;

    // Calculate individual scores
    const inventoryScore = calculateInventoryScore(
        recipe.ingredients || [],
        inventoryNames
    );

    const dietaryScore = calculateDietaryScore(
        recipe.cuisine || '',
        dietaryPreferences,
        cuisinePreferences
    );

    const timeCalorieScore = calculateTimeCalorieScore(
        recipe.time || 0,
        recipe.calories || 0,
        maxCookTime,
        maxCalories
    );

    // Sum and round
    const totalScore = inventoryScore + dietaryScore + timeCalorieScore;
    return Math.round(Math.min(100, Math.max(0, totalScore)));
};

/**
 * Get color classes based on match score
 * @param {number} score - Match score 0-100
 * @returns {Object} - Object with bg, text, and label properties
 */
export const getMatchColor = (score) => {
    if (score >= 80) {
        return {
            bg: 'bg-emerald-500',
            text: 'text-white',
            label: 'Great Match',
            badgeClass: 'bg-emerald-500 text-white'
        };
    } else if (score >= 50) {
        return {
            bg: 'bg-amber-500',
            text: 'text-white',
            label: 'Good Match',
            badgeClass: 'bg-amber-500 text-white'
        };
    } else {
        return {
            bg: 'bg-red-500',
            text: 'text-white',
            label: 'Low Match',
            badgeClass: 'bg-red-500 text-white'
        };
    }
};

/**
 * Get match breakdown for explanation UI
 * @param {Object} recipe - Recipe object
 * @param {string[]} inventoryNames - List of inventory item names
 * @param {Object} userPrefs - User preferences object
 * @returns {Object} - Breakdown of scores
 */
export const getMatchBreakdown = (recipe, inventoryNames = [], userPrefs = {}) => {
    const {
        dietaryPreferences = [],
        cuisinePreferences = [],
        maxCookTime = null,
        maxCalories = null
    } = userPrefs;

    const inventoryScore = calculateInventoryScore(recipe.ingredients || [], inventoryNames);
    const dietaryScore = calculateDietaryScore(recipe.cuisine || '', dietaryPreferences, cuisinePreferences);
    const timeCalorieScore = calculateTimeCalorieScore(recipe.time || 0, recipe.calories || 0, maxCookTime, maxCalories);

    // Find matched ingredients
    const normalizedInventory = inventoryNames.map(normalizeIngredient);
    const matchedIngredients = (recipe.ingredients || []).filter(ing => {
        const normalized = normalizeIngredient(ing);
        return normalizedInventory.some(inv => inv.includes(normalized) || normalized.includes(inv));
    });

    return {
        total: Math.round(inventoryScore + dietaryScore + timeCalorieScore),
        inventory: {
            score: inventoryScore,
            maxScore: 70,
            matched: matchedIngredients.length,
            total: (recipe.ingredients || []).length,
            matchedItems: matchedIngredients
        },
        dietary: {
            score: dietaryScore,
            maxScore: 15,
            matched: dietaryScore === 15
        },
        timeCalorie: {
            score: timeCalorieScore,
            maxScore: 15,
            timeOk: !maxCookTime || recipe.time <= maxCookTime,
            caloriesOk: !maxCalories || recipe.calories <= maxCalories
        }
    };
};

export default { calculateMatchScore, getMatchColor, getMatchBreakdown };
