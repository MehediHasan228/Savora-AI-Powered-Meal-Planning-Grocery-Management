const prisma = require('../prismaClient');
const intelligence = require('../services/groceryIntelligenceService');

// Re-use category keywords for suggestion in meal plan sync
const CATEGORY_KEYWORDS = {
    'Produce': ['apple', 'banana', 'orange', 'carrot', 'potato', 'tomato', 'onion', 'lettuce', 'broccoli', 'avocado', 'spinach', 'pepper', 'fruit', 'veg'],
    'Dairy & Alternatives': ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'almond milk', 'soy milk', 'curd'],
    'Meat & Poultry': ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'sausage', 'bacon', 'steak', 'mince', 'meat'],
    'Seafood': ['fish', 'salmon', 'prawn', 'shrimp', 'crab', 'tuna', 'cod'],
    'Bakery': ['bread', 'bagel', 'croissant', 'muffin', 'cake', 'wrap', 'pita', 'naan', 'bun'],
    'Snacks': ['chip', 'crisp', 'nut', 'chocolate', 'biscuit', 'cracker', 'popcorn'],
    'Beverages': ['water', 'juice', 'soda', 'coke', 'tea', 'coffee', 'wine', 'beer'],
    'Frozen': ['frozen', 'ice cream', 'pizza']
};

function suggestCategory(name) {
    const searchName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => searchName.includes(k))) return category;
    }
    return 'General';
}

// @desc Get meal plan for a specific week (or date range)
// @route GET /api/meal-plan
exports.getWeekPlan = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }

        const plans = await prisma.mealPlan.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            include: {
                recipe: true
            }
        });

        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Generate a meal plan for a week
// @route POST /api/meal-plan/generate
exports.generateWeekPlan = async (req, res) => {
    try {
        const { startDate } = req.body;
        const userId = req.user.id;

        if (!startDate) return res.status(400).json({ message: 'Start date is required' });

        const start = new Date(startDate);

        // 1. Get User Preferences
        const user = await prisma.user.findUnique({ where: { id: userId } });
        let preferences = {};
        try {
            preferences = user.preferences ? JSON.parse(user.preferences) : {};
        } catch (e) { }

        const { cuisinePreferences = [], maxCalories = 800 } = preferences;

        // 2. Fetch suitable recipes
        let whereClause = {};
        if (maxCalories > 0) {
            whereClause.calories = { lte: maxCalories };
        }
        if (cuisinePreferences.length > 0) {
            whereClause.cuisine = { in: cuisinePreferences };
        }

        let recipes = await prisma.recipe.findMany({ where: whereClause });

        // Fallback: relax filters if needed
        if (recipes.length < 5) {
            recipes = await prisma.recipe.findMany({ where: { userId } });
        }

        if (recipes.length === 0) {
            return res.status(400).json({ message: 'No recipes found. Add some recipes first!' });
        }

        // 3. Score recipes with Inventory Integration & AI Config
        const { calculateMatch } = require('../utils/matchCalculator');

        const aiSetting = await prisma.systemSetting.findUnique({ where: { key: 'AI_CONFIG' } });
        const aiConfig = aiSetting ? JSON.parse(aiSetting.value) : {};

        const inventory = await prisma.item.findMany({
            where: { userId },
            select: { name: true, status: true }
        });
        const inventoryNames = inventory.map(i => i.name);
        const expiringNames = inventory
            .filter(i => i.status === 'Expiring Soon' || i.status === 'Expired')
            .map(i => i.name);

        const scoredRecipes = recipes.map(recipe => ({
            ...recipe,
            matchScore: calculateMatch(recipe, preferences, inventoryNames, expiringNames, aiConfig)
        }));

        scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);

        const days = 7;
        const slots = ['breakfast', 'lunch', 'dinner'];
        const newPlans = [];

        for (let i = 0; i < days; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);

            for (const slot of slots) {
                // Top 5 random pick
                const pool = scoredRecipes.slice(0, 5);
                const selected = pool[Math.floor(Math.random() * pool.length)];

                if (!selected) continue;

                newPlans.push(prisma.mealPlan.upsert({
                    where: {
                        userId_date_slot: {
                            userId,
                            date: currentDate,
                            slot
                        }
                    },
                    update: {
                        recipeId: selected.id,
                        servings: 1
                    },
                    create: {
                        userId,
                        date: currentDate,
                        slot,
                        recipeId: selected.id,
                        servings: 1
                    }
                }));
            }
        }

        await Promise.all(newPlans);
        res.json({ message: 'Meal plan generated successfully' });
    } catch (err) {
        console.error('Generate error:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc Update a specific meal slot
// @route PUT /api/meal-plan/slot
exports.updateMealSlot = async (req, res) => {
    try {
        const { date, slot, recipeId, isCustom, customItem, servings } = req.body;
        const userId = req.user.id;

        const updated = await prisma.mealPlan.upsert({
            where: {
                userId_date_slot: {
                    userId,
                    date: new Date(date),
                    slot
                }
            },
            update: {
                recipeId: recipeId !== undefined ? recipeId : undefined,
                isCustom: isCustom !== undefined ? isCustom : undefined,
                customItem: customItem !== undefined ? customItem : undefined,
                servings: servings || undefined
            },
            create: {
                userId,
                date: new Date(date),
                slot,
                recipeId: recipeId || null,
                isCustom: isCustom || false,
                customItem: customItem || null,
                servings: servings || 1
            }
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Delete a meal slot
// @route DELETE /api/meal-plan/slot
exports.deleteMealSlot = async (req, res) => {
    try {
        const { date, slot } = req.query;
        const userId = req.user.id;

        await prisma.mealPlan.deleteMany({
            where: {
                userId,
                date: new Date(date),
                slot
            }
        });

        res.json({ message: 'Slot cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Add meal plan ingredients to grocery list
exports.addIngredientsToGrocery = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const userId = req.user.id;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }

        const plans = await prisma.mealPlan.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            include: { recipe: true }
        });

        if (plans.length === 0) {
            return res.status(400).json({ message: 'No meal plans found' });
        }

        const ingredientMap = new Map();
        for (const plan of plans) {
            const multi = plan.servings || 1;
            if (plan.recipe?.ingredients) {
                try {
                    const ings = JSON.parse(plan.recipe.ingredients);
                    ings.forEach(ing => {
                        const name = (ing.name || ing).toLowerCase().trim();
                        const amount = (ing.amount || 1) * multi;
                        const unit = ing.unit || 'unit';

                        if (ingredientMap.has(name)) {
                            const ex = ingredientMap.get(name);
                            if (ex.unit === unit) ex.amount += amount;
                        } else {
                            ingredientMap.set(name, { name, amount, unit });
                        }
                    });
                } catch (e) { }
            }
        }

        // Check inventory
        const inventory = await prisma.item.findMany({
            where: { userId },
            select: { name: true }
        });
        const invNames = new Set(inventory.map(i => i.name.toLowerCase().trim()));

        const toAdd = Array.from(ingredientMap.values())
            .filter(ing => !invNames.has(ing.name))
            .map(ing => ({
                name: ing.name.charAt(0).toUpperCase() + ing.name.slice(1),
                qty: ing.amount,
                unit: ing.unit,
                category: suggestCategory(ing.name),
                buyStatus: 'NOW', // Always NOW if needed for upcoming meal plan
                source: 'MEAL_PLAN',
                userId
            }));

        if (toAdd.length > 0) {
            // Use createMany if supported, otherwise loop (createMany might not return IDs or track things well in some DBs)
            await prisma.groceryItem.createMany({ data: toAdd });
        }

        res.json({ message: `Added ${toAdd.length} items to grocery list.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
