const prisma = require('../prismaClient');

/**
 * Intelligent Grocery System Service
 * Handles classification logic for Buy Now / Buy Later
 */

const THRESHOLD_DAYS = 7; // Look ahead for meal plan

/**
 * Classify a grocery item as NOW or LATER
 * @param {Object} item - Grocery item object
 * @param {number} userId - ID of the user
 * @returns {Promise<string>} 'NOW' or 'LATER'
 */
async function classifyItem(item, userId) {
    try {
        const itemName = item.name.toLowerCase().trim();

        // 1. Check Inventory
        const inventoryItems = await prisma.item.findMany({
            where: {
                userId,
                name: { contains: itemName }
            }
        });

        // Exact match check
        const exactMatch = inventoryItems.find(i => i.name.toLowerCase().trim() === itemName);

        // Logic A: Inventory item not available -> BUY NOW
        if (!exactMatch) return 'NOW';

        // Logic B: Quantity below threshold (Simulated since qty is string)
        // Extract number from "3 pcs" etc
        const currentQty = parseFloat(exactMatch.qty) || 0;
        if (currentQty <= 1) return 'NOW'; // Simple threshold for now

        // 2. Check Meal Plan (Current Week)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

        const mealPlans = await prisma.mealPlan.findMany({
            where: {
                userId,
                date: { gte: now, lte: nextWeek }
            },
            include: { recipe: true }
        });

        const isNeededForMealPlan = mealPlans.some(plan => {
            if (plan.isCustom && plan.customItem?.toLowerCase().includes(itemName)) return true;
            if (plan.recipe?.ingredients) {
                const ings = plan.recipe.ingredients.toLowerCase();
                return ings.includes(itemName);
            }
            return false;
        });

        // Logic C: Meal plan requirement -> BUY NOW
        if (isNeededForMealPlan) return 'NOW';

        // 3. Check Expiry replacement
        const expiringSoon = inventoryItems.some(i => {
            if (!i.expiry) return false;
            const exp = new Date(i.expiry);
            return exp >= now && exp <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        });

        // Logic D: Expiring soon replacement -> BUY NOW
        if (expiringSoon) return 'NOW';

        // Default to LATER if it exists and not urgently needed
        return 'LATER';
    } catch (error) {
        console.error('Classification error:', error);
        return 'NOW'; // Safety default
    }
}

/**
 * Refresh classification for all grocery items for a user
 */
async function refreshAllClassifications(userId) {
    const items = await prisma.groceryItem.findMany({ where: { userId, isBought: false } });

    for (const item of items) {
        const newStatus = await classifyItem(item, userId);
        if (newStatus !== item.buyStatus) {
            await prisma.groceryItem.update({
                where: { id: item.id },
                data: { buyStatus: newStatus }
            });
        }
    }
}

module.exports = {
    classifyItem,
    refreshAllClassifications
};
