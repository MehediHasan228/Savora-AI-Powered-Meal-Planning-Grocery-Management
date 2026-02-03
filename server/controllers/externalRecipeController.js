const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const spoonacularService = require('../services/spoonacularService');

const MOCK_RECIPES = [
    {
        id: 716429,
        title: "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
        image: "https://spoonacular.com/recipeImages/716429-312x231.jpg",
        readyInMinutes: 45,
        servings: 2,
        cuisines: ["Italian"],
        nutrition: { nutrients: [{ name: "Calories", amount: 584 }] },
        analyzedInstructions: [{
            steps: [
                { step: "Wash the cauliflower and cut into small florets.", ingredients: [{ name: "cauliflower" }] },
                { step: "Cook pasta in boiling salted water.", ingredients: [{ name: "pasta" }] },
                { step: "Sauté garlic and scallions in olive oil.", ingredients: [{ name: "garlic" }, { name: "scallions" }] }
            ]
        }]
    },
    {
        id: 715538,
        title: "What to make for dinner tonight?? Bruschetta Style Pork & Pasta",
        image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
        readyInMinutes: 35,
        servings: 2,
        cuisines: ["Italian", "Mediterranean"],
        nutrition: { nutrients: [{ name: "Calories", amount: 450 }] },
        analyzedInstructions: [{
            steps: [
                { step: "Cook pasta according to package directions.", ingredients: [{ name: "pasta" }] },
                { step: "Season pork with salt and pepper.", ingredients: [{ name: "pork" }] },
                { step: "Grill pork until cooked through.", ingredients: [{ name: "pork" }] }
            ]
        }]
    },
    {
        id: 644387,
        title: "Garlic and Herb Roasted Chicken",
        image: "https://spoonacular.com/recipeImages/644387-312x231.jpg",
        readyInMinutes: 60,
        servings: 4,
        cuisines: ["American"],
        nutrition: { nutrients: [{ name: "Calories", amount: 380 }] },
        analyzedInstructions: [{
            steps: [
                { step: "Preheat oven to 375°F.", ingredients: [] },
                { step: "Rub chicken with garlic and herbs.", ingredients: [{ name: "chicken" }, { name: "garlic" }] },
                { step: "Roast for 1 hour.", ingredients: [] }
            ]
        }]
    },
    {
        id: 782585,
        title: "Cannellini Bean and Kale Soup",
        image: "https://spoonacular.com/recipeImages/782585-312x231.jpg",
        readyInMinutes: 30,
        servings: 4,
        cuisines: ["Mediterranean"],
        nutrition: { nutrients: [{ name: "Calories", amount: 250 }] },
        analyzedInstructions: [{
            steps: [
                { step: "Sauté onions and garlic.", ingredients: [{ name: "onion" }, { name: "garlic" }] },
                { step: "Add kale and beans with broth.", ingredients: [{ name: "kale" }, { name: "beans" }] },
                { step: "Simmer for 20 minutes.", ingredients: [] }
            ]
        }]
    }
];

// @desc Search recipes via Spoonacular (with caching)
// @route GET /api/external/recipes/search
exports.searchRecipes = async (req, res) => {
    try {
        const { query, cuisine, diet, type } = req.query;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const apiKey = user?.spoonacularKey || process.env.SPOONACULAR_API_KEY;

        // If no API key, return mock data
        if (!apiKey) {
            console.log('Spoonacular API Key not found. Returning mock data.');
            return res.json({
                results: MOCK_RECIPES.filter(r =>
                    !query || r.title.toLowerCase().includes(query.toLowerCase()) ||
                    r.cuisines.some(c => c.toLowerCase().includes(query.toLowerCase()))
                ),
                totalResults: MOCK_RECIPES.length,
                isMock: true
            });
        }

        // Use service with caching
        const data = await spoonacularService.searchRecipes(
            query,
            { cuisine, diet, type },
            apiKey,
            req.user.id
        );

        // Fetch user inventory for match calculation
        const inventory = await prisma.item.findMany({
            where: { userId: req.user.id },
            select: { name: true, status: true }
        });
        const inventoryNames = inventory.map(i => i.name);
        const expiringNames = inventory
            .filter(i => i.status === 'Expiring Soon' || i.status === 'Expired')
            .map(i => i.name);

        // Add match percentages to results
        const { calculateMatch } = require('../utils/matchCalculator');
        const userPreferences = user?.preferences || '{}';

        const resultsWithMatch = (data.results || []).map(recipe => ({
            ...recipe,
            matchPercentage: calculateMatch(recipe, userPreferences, inventoryNames, expiringNames)
        }));

        // Sort by match percentage (descending)
        resultsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

        res.json({
            ...data,
            results: resultsWithMatch,
            isMock: false
        });
    } catch (err) {
        console.error('Spoonacular Search Error:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: err.response?.data?.message || 'Error searching recipes',
            isError: true
        });
    }
};

// @desc Get Spoonacular recipe details (with smart caching)
// @route GET /api/external/recipes/:id
exports.getRecipeDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const apiKey = user?.spoonacularKey || process.env.SPOONACULAR_API_KEY;

        if (!apiKey) {
            return res.status(400).json({ message: 'Spoonacular API Key not found.' });
        }

        // Use service with caching
        const recipe = await spoonacularService.getRecipeDetails(
            id,
            apiKey,
            req.user.id
        );

        res.json(recipe);
    } catch (err) {
        console.error('Spoonacular Details Error:', err.message);
        res.status(500).json({ message: 'Error fetching recipe details' });
    }
};
