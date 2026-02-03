const prisma = require('../prismaClient');

// @desc Get all manual recipes
// @route GET /api/recipes
exports.getRecipes = async (req, res) => {
    try {
        const recipes = await prisma.recipe.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Parse ingredients JSON string
        const parsedRecipes = recipes.map(r => ({
            ...r,
            ingredients: JSON.parse(r.ingredients)
        }));
        res.json(parsedRecipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Add new manual recipe
// @route POST /api/recipes
exports.addRecipe = async (req, res) => {
    try {
        const { title, cuisine, time, calories, image, ingredients, instructions } = req.body;
        const newRecipe = await prisma.recipe.create({
            data: {
                title,
                cuisine,
                time: parseInt(time),
                calories: parseInt(calories),
                image,
                ingredients: JSON.stringify(ingredients),
                instructions,
                userId: req.user?.id
            }
        });
        res.status(201).json({
            ...newRecipe,
            ingredients: JSON.parse(newRecipe.ingredients)
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Update recipe
// @route PUT /api/recipes/:id
exports.updateRecipe = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { ingredients, ...otherData } = req.body;

        const updateData = { ...otherData };
        if (ingredients) updateData.ingredients = JSON.stringify(ingredients);

        const updatedRecipe = await prisma.recipe.update({
            where: { id },
            data: updateData
        });
        res.json({
            ...updatedRecipe,
            ingredients: JSON.parse(updatedRecipe.ingredients)
        });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc Delete recipe
// @route DELETE /api/recipes/:id
exports.deleteRecipe = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.recipe.delete({
            where: { id }
        });
        res.json({ message: 'Recipe removed successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(500).json({ message: err.message });
    }
};
