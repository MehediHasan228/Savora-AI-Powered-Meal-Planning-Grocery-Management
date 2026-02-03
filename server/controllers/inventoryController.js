const prisma = require('../prismaClient');
const notificationService = require('../services/notificationService');
const { calculateStatus, createReminders } = require('../services/expiryReminderService');
const { lookupBarcode, learnBarcode } = require('../services/barcodeService');

// @desc Get all inventory items with optional filtering
// @route GET /api/inventory
exports.getItems = async (req, res) => {
    try {
        const { zone, status } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const items = await prisma.item.findMany({
            where: {
                userId,
                ...(zone && { storageZone: zone }),
                ...(status && { status })
            },
            orderBy: { expiry: 'asc' }
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Add new item with smart defaults and reminders
// @route POST /api/inventory
exports.addItem = async (req, res) => {
    try {
        const { name, category, qty, expiry, storageZone, barcode } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Calculate initial status
        const status = calculateStatus(expiry);

        const newItem = await prisma.item.create({
            data: {
                name,
                category: category || 'General',
                qty,
                expiry: expiry ? new Date(expiry) : null,
                status,
                storageZone: storageZone || 'Pantry',
                location: storageZone || 'Pantry', // Sync legacy field
                barcode,
                userId
            }
        });

        // Create expiry reminders
        if (expiry) {
            await createReminders(newItem.id, expiry);
        }

        // Learn barcode if provided
        if (barcode && name) {
            await learnBarcode(barcode, name, category, 30); // Default 30 days if new
        }

        res.status(201).json(newItem);
    } catch (err) {
        console.error('Add item error:', err);
        res.status(400).json({ message: err.message });
    }
};

// @desc Update item and refresh reminders
// @route PUT /api/inventory/:id
exports.updateItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { expiry, ...rest } = req.body;

        let updateData = { ...rest };
        if (expiry) {
            updateData.expiry = new Date(expiry);
            updateData.status = calculateStatus(expiry);
        }

        const updatedItem = await prisma.item.update({
            where: { id },
            data: updateData
        });

        // If expiry changed, refresh reminders
        if (expiry) {
            await prisma.expiryReminder.deleteMany({ where: { itemId: id } });
            await createReminders(id, expiry);
        }

        res.json(updatedItem);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc Delete item (reminders auto-delete via cascade)
// @route DELETE /api/inventory/:id
exports.deleteItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.item.delete({
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

// @desc Barcode Lookup
// @route POST /api/inventory/barcode-lookup
exports.barcodeLookup = async (req, res) => {
    try {
        const { barcode } = req.body;
        const result = await lookupBarcode(barcode);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Move item back to Grocery List (Undo)
// @route POST /api/inventory/:id/move-to-grocery
exports.moveToGrocery = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await prisma.item.findUnique({ where: { id } });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await prisma.groceryItem.create({
            data: {
                name: item.name,
                category: item.category,
                price: 0,
                userId: item.userId
            }
        });

        await prisma.item.delete({ where: { id } });
        res.json({ message: 'Item moved back to grocery list' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get personal smart suggestions (waste risk + restock)
// @route GET /api/inventory/suggestions
exports.getSmartSuggestions = async (req, res) => {
    try {
        const userId = req.user?.id;
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const inventory = await prisma.item.findMany({
            where: { userId }
        });

        const wasteRisks = inventory.filter(i => {
            if (!i.expiry) return false;
            const exp = new Date(i.expiry);
            return exp > now && exp <= threeDaysFromNow;
        });

        const restockSuggestions = inventory.filter(i => {
            // High usage but low qty (simulated by '1' or 'Low' string)
            const usageCount = i.usageCount || 0;
            const isLow = i.qty === '1' || (typeof i.qty === 'string' && i.qty.toLowerCase().includes('low'));
            return usageCount > 5 && isLow;
        });

        res.json({
            wasteRisks,
            restockSuggestions,
            totalItems: inventory.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
