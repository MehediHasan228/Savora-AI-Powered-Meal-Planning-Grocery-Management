const prisma = require('../prismaClient');
const intelligence = require('../services/groceryIntelligenceService');
const notificationService = require('../services/notificationService');

const SHELF_LIFE = {
    'Produce': 5,
    'Dairy & Alternatives': 7,
    'Meat & Poultry': 3,
    'Seafood': 2,
    'Bakery': 4,
    'Pantry': 180,
    'Frozen': 90,
    'General': 14
};

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

// @desc Get all grocery items
// @route GET /api/grocery
exports.getGroceryItems = async (req, res) => {
    try {
        const items = await prisma.groceryItem.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Add grocery item
// @route POST /api/grocery
exports.addGroceryItem = async (req, res) => {
    try {
        const userId = req.user?.id;
        const body = { ...req.body, userId };

        // Auto-classify
        body.buyStatus = await intelligence.classifyItem(body, userId);

        const newItem = await prisma.groceryItem.create({
            data: body
        });

        // Trigger Notification if it's BUY NOW
        if (newItem.buyStatus === 'NOW') {
            await notificationService.createNotification({
                userId: userId,
                title: 'New Urgent Item 🛒',
                message: `"${newItem.name}" added to your Buy Now list.`,
                type: 'GROCERY'
            });
        }

        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Update grocery item
// @route PUT /api/grocery/:id
exports.updateGroceryItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user?.id;

        // Re-classify if name changes
        if (req.body.name) {
            req.body.buyStatus = await intelligence.classifyItem(req.body, userId);
        }

        const updatedItem = await prisma.groceryItem.update({
            where: { id },
            data: req.body
        });

        // Trigger if changed to NOW
        if (updatedItem.buyStatus === 'NOW') {
            await notificationService.createNotification({
                userId: userId,
                title: 'Item Moved to Buy Now 🔥',
                message: `"${updatedItem.name}" is now marked as urgent.`,
                type: 'GROCERY'
            });
        }

        res.json(updatedItem);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc Delete grocery item
// @route DELETE /api/grocery/:id
exports.deleteGroceryItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.groceryItem.delete({
            where: { id }
        });
        res.json({ message: 'Item removed successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(500).json({ message: err.message });
    }
};

// @desc Toggle grocery item bought status
// @route PATCH /api/grocery/:id/toggle
exports.toggleGroceryItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await prisma.groceryItem.findUnique({ where: { id } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const updatedItem = await prisma.groceryItem.update({
            where: { id },
            data: {
                isBought: !item.isBought,
                boughtAt: !item.isBought ? new Date() : null
            }
        });
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Clear completed items
// @route POST /api/grocery/clear
// @desc Clear completed items
// @route POST /api/grocery/clear
exports.clearCompleted = async (req, res) => {
    try {
        await prisma.groceryItem.deleteMany({
            where: { isBought: true }
        });
        res.json({ message: 'Completed items removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Bulk add grocery items (e.g. from Recipe)
// @route POST /api/grocery/bulk
exports.bulkAddGroceryItems = async (req, res) => {
    try {
        const { items } = req.body; // Array of { name, category, price }
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid items array' });
        }

        const userId = req.user?.id;

        // Auto-classify all items
        const itemsWithStatus = await Promise.all(items.map(async (item) => ({
            ...item,
            userId,
            category: item.category || 'General',
            buyStatus: await intelligence.classifyItem(item, userId)
        })));

        const createdItems = await prisma.$transaction(
            itemsWithStatus.map(item => prisma.groceryItem.create({
                data: {
                    name: item.name,
                    category: item.category,
                    price: item.price || 0,
                    qty: item.qty || 1,
                    unit: item.unit || 'pcs',
                    buyStatus: item.buyStatus,
                    userId
                }
            }))
        );

        res.status(201).json(createdItems);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Move bought items to Inventory and clear from Grocery
// @route POST /api/grocery/move-to-inventory
exports.moveBoughtToInventory = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log('Shop & Save: Request from user:', userId);

        // 1. Find all bought items for this user
        const boughtItems = await prisma.groceryItem.findMany({
            where: {
                userId,
                isBought: true
            }
        });

        console.log(`Shop & Save: Found ${boughtItems.length} bought items for user ${userId}`);
        if (boughtItems.length > 0) {
            console.log('Sample item:', boughtItems[0]);
        }

        if (boughtItems.length === 0) {
            // DEBUG: Check if there are ANY bought items regardless of user
            const allBought = await prisma.groceryItem.findMany({ where: { isBought: true } });
            console.log(`DEBUG: Total bought items in DB (any user): ${allBought.length}`);
            if (allBought.length > 0) {
                console.log('Sample bought item:', allBought[0]);
            }
            return res.json({ message: 'No bought items to move', count: 0 });
        }

        // 2. Create inventory items from them
        // We'll map grocery item fields to inventory item fields
        // Inventory model: name, category, qty, expiry(default), status(Fresh), location(Pantry), userId
        await prisma.$transaction(
            boughtItems.map(item => {
                const days = SHELF_LIFE[item.category] || SHELF_LIFE['General'];
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + days);

                return prisma.item.create({
                    data: {
                        name: item.name,
                        category: item.category,
                        qty: `${item.qty} ${item.unit}`, // Use actual quantity and unit
                        expiry: expiryDate,
                        status: 'Fresh',
                        storageZone: item.category === 'Frozen' ? 'Freezer' : (['Produce', 'Dairy & Alternatives', 'Meat & Poultry', 'Seafood'].includes(item.category) ? 'Fridge' : 'Pantry'),
                        location: item.category === 'Frozen' ? 'Freezer' : (['Produce', 'Dairy & Alternatives', 'Meat & Poultry', 'Seafood'].includes(item.category) ? 'Fridge' : 'Pantry'),
                        userId
                    }
                });
            })
        );

        // 3. Delete them from grocery list
        await prisma.groceryItem.deleteMany({
            where: {
                userId,
                isBought: true
            }
        });

        res.json({ message: 'Successfully moved items to inventory', count: boughtItems.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Suggest category based on item name
// @route GET /api/grocery/suggest-category
exports.suggestCategory = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.json({ category: 'General' });

        const searchName = name.toLowerCase();
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(k => searchName.includes(k))) {
                return res.json({ category });
            }
        }

        res.json({ category: 'General' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Toggle grocery item buy status (NOW/LATER)
// @route PATCH /api/grocery/:id/toggle-priority
exports.togglePriority = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await prisma.groceryItem.findUnique({ where: { id } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const updatedItem = await prisma.groceryItem.update({
            where: { id },
            data: { buyStatus: item.buyStatus === 'NOW' ? 'LATER' : 'NOW' }
        });
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Refresh all classifications for user
// @route POST /api/grocery/refresh
exports.refreshClassifications = async (req, res) => {
    try {
        await intelligence.refreshAllClassifications(req.user.id);
        const items = await prisma.groceryItem.findMany({
            where: { userId: req.user.id }
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
