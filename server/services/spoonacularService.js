const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

const SPOONACULAR_BASE = 'https://api.spoonacular.com/recipes';

/**
 * Smart Spoonacular Service with Caching
 * Cache-first strategy to minimize API costs
 */

// Helper: Log API usage
async function logApiUsage(endpoint, userId, success, errorMsg = null) {
    try {
        await prisma.apiUsageLog.create({
            data: {
                endpoint,
                userId,
                success,
                errorMsg,
                cost: 1 // Each API call = 1 point (can be customized)
            }
        });
    } catch (err) {
        console.error('Failed to log API usage:', err);
    }
}

// Helper: Check if cache is valid
function isCacheValid(cache) {
    return new Date(cache.expiresAt) > new Date();
}

// Helper: Calculate cache expiry
function calculateExpiry(popularity) {
    const days = popularity > 10 ? 30 : 7; // Popular recipes cache longer
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate;
}

/**
 * Search recipes with cache check
 */
exports.searchRecipes = async (query, filters, apiKey, userId) => {
    try {
        // For search, we call API directly (caching individual recipes on detail fetch)
        const response = await axios.get(`${SPOONACULAR_BASE}/complexSearch`, {
            params: {
                apiKey,
                query,
                cuisine: filters.cuisine,
                diet: filters.diet,
                type: filters.type,
                addRecipeInformation: true,
                fillIngredients: true,
                addRecipeNutrition: true,
                number: 12
            },
            timeout: 10000
        });

        await logApiUsage('search', userId, true);
        return response.data;
    } catch (err) {
        await logApiUsage('search', userId, false, err.message);
        throw err;
    }
};

/**
 * Get recipe details with smart caching
 */
exports.getRecipeDetails = async (spoonacularId, apiKey, userId) => {
    try {
        // 1. Check cache first
        const cached = await prisma.recipeCache.findUnique({
            where: { spoonacularId: parseInt(spoonacularId) }
        });

        if (cached && isCacheValid(cached)) {
            console.log(`✅ Cache HIT for recipe ${spoonacularId}`);

            // Update popularity
            await prisma.recipeCache.update({
                where: { id: cached.id },
                data: { popularity: cached.popularity + 1 }
            });

            return {
                ...cached,
                fromCache: true
            };
        }

        // 2. Cache miss - fetch from API
        console.log(`❌ Cache MISS for recipe ${spoonacularId} - Fetching from API`);

        const response = await axios.get(`${SPOONACULAR_BASE}/${spoonacularId}/information`, {
            params: {
                apiKey,
                includeNutrition: true
            },
            timeout: 10000
        });

        const recipe = response.data;

        // Extract nutrition data
        const nutrition = recipe.nutrition?.nutrients || [];
        const calories = nutrition.find(n => n.name === 'Calories')?.amount || 0;
        const protein = nutrition.find(n => n.name === 'Protein')?.amount || 0;
        const carbs = nutrition.find(n => n.name === 'Carbohydrates')?.amount || 0;
        const fat = nutrition.find(n => n.name === 'Fat')?.amount || 0;
        const fiber = nutrition.find(n => n.name === 'Fiber')?.amount || 0;

        // Extract ingredients
        const ingredients = recipe.extendedIngredients?.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit
        })) || [];

        // Extract instructions
        const instructions = recipe.analyzedInstructions?.[0]?.steps?.map(s => s.step).join('\n') ||
            recipe.instructions || '';

        // 3. Save to cache
        const savedCache = await prisma.recipeCache.upsert({
            where: { spoonacularId: parseInt(spoonacularId) },
            update: {
                title: recipe.title,
                image: recipe.image,
                cuisine: recipe.cuisines?.[0] || 'General',
                cookTime: recipe.readyInMinutes,
                calories: Math.round(calories),
                protein,
                carbs,
                fat,
                fiber,
                ingredients: JSON.stringify(ingredients),
                instructions,
                lastFetched: new Date(),
                expiresAt: calculateExpiry(0)
            },
            create: {
                spoonacularId: parseInt(spoonacularId),
                title: recipe.title,
                image: recipe.image,
                cuisine: recipe.cuisines?.[0] || 'General',
                cookTime: recipe.readyInMinutes,
                calories: Math.round(calories),
                protein,
                carbs,
                fat,
                fiber,
                ingredients: JSON.stringify(ingredients),
                instructions,
                popularity: 1,
                expiresAt: calculateExpiry(0)
            }
        });

        await logApiUsage('getDetails', userId, true);

        return {
            ...savedCache,
            fromCache: false
        };

    } catch (err) {
        await logApiUsage('getDetails', userId, false, err.message);
        throw err;
    }
};
