const prisma = require('../prismaClient');

// @desc Get database stats (table counts)
// @route GET /api/database/stats
exports.getStats = async (req, res) => {
    try {
        const [users, items, recipes, groceryItems] = await Promise.all([
            prisma.user.count(),
            prisma.item.count(),
            prisma.recipe.count(),
            prisma.groceryItem.count()
        ]);

        res.json({
            tables: [
                { name: 'User', count: users, model: 'user' },
                { name: 'Item', count: items, model: 'item' },
                { name: 'Recipe', count: recipes, model: 'recipe' },
                { name: 'GroceryItem', count: groceryItems, model: 'groceryItem' }
            ]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get all records from a table
// @route GET /api/database/:table
exports.getTableData = async (req, res) => {
    try {
        const { table } = req.params;
        const validTables = ['user', 'item', 'recipe', 'groceryItem'];

        if (!validTables.includes(table)) {
            return res.status(400).json({ message: 'Invalid table name' });
        }

        let data;
        let columns;

        switch (table) {
            case 'user':
                data = await prisma.user.findMany({ orderBy: { id: 'asc' } });
                columns = ['id', 'name', 'email', 'avatar', 'role', 'status', 'plan', 'createdAt'];
                // Remove password from response
                data = data.map(({ password, ...rest }) => rest);
                break;
            case 'item':
                data = await prisma.item.findMany({ orderBy: { id: 'asc' } });
                columns = ['id', 'name', 'category', 'qty', 'expiry', 'status', 'location', 'userId', 'createdAt'];
                break;
            case 'recipe':
                data = await prisma.recipe.findMany({ orderBy: { id: 'asc' } });
                columns = ['id', 'title', 'cuisine', 'time', 'calories', 'image', 'ingredients', 'userId', 'createdAt'];
                break;
            case 'groceryItem':
                data = await prisma.groceryItem.findMany({ orderBy: { id: 'asc' } });
                columns = ['id', 'name', 'category', 'isBought', 'price', 'userId', 'createdAt'];
                break;
        }

        res.json({ data, columns, table });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get single record
// @route GET /api/database/:table/:id
exports.getRecord = async (req, res) => {
    try {
        const { table, id } = req.params;
        const validTables = ['user', 'item', 'recipe', 'groceryItem'];

        if (!validTables.includes(table)) {
            return res.status(400).json({ message: 'Invalid table name' });
        }

        let record;
        switch (table) {
            case 'user':
                record = await prisma.user.findUnique({ where: { id: parseInt(id) } });
                if (record) delete record.password;
                break;
            case 'item':
                record = await prisma.item.findUnique({ where: { id: parseInt(id) } });
                break;
            case 'recipe':
                record = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
                break;
            case 'groceryItem':
                record = await prisma.groceryItem.findUnique({ where: { id: parseInt(id) } });
                break;
        }

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Update record
// @route PUT /api/database/:table/:id
exports.updateRecord = async (req, res) => {
    try {
        const { table, id } = req.params;
        const validTables = ['user', 'item', 'recipe', 'groceryItem'];

        if (!validTables.includes(table)) {
            return res.status(400).json({ message: 'Invalid table name' });
        }

        // Remove fields that shouldn't be updated
        const { id: _, createdAt, updatedAt, ...updateData } = req.body;

        let record;
        switch (table) {
            case 'user':
                record = await prisma.user.update({
                    where: { id: parseInt(id) },
                    data: updateData
                });
                delete record.password;
                break;
            case 'item':
                record = await prisma.item.update({
                    where: { id: parseInt(id) },
                    data: updateData
                });
                break;
            case 'recipe':
                record = await prisma.recipe.update({
                    where: { id: parseInt(id) },
                    data: updateData
                });
                break;
            case 'groceryItem':
                record = await prisma.groceryItem.update({
                    where: { id: parseInt(id) },
                    data: updateData
                });
                break;
        }

        res.json(record);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc Delete record
// @route DELETE /api/database/:table/:id
exports.deleteRecord = async (req, res) => {
    try {
        const { table, id } = req.params;
        const validTables = ['user', 'item', 'recipe', 'groceryItem'];

        if (!validTables.includes(table)) {
            return res.status(400).json({ message: 'Invalid table name' });
        }

        switch (table) {
            case 'user':
                await prisma.user.delete({ where: { id: parseInt(id) } });
                break;
            case 'item':
                await prisma.item.delete({ where: { id: parseInt(id) } });
                break;
            case 'recipe':
                await prisma.recipe.delete({ where: { id: parseInt(id) } });
                break;
            case 'groceryItem':
                await prisma.groceryItem.delete({ where: { id: parseInt(id) } });
                break;
        }

        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.status(500).json({ message: err.message });
    }
};

// @desc Create new record
// @route POST /api/database/:table
exports.createRecord = async (req, res) => {
    try {
        const { table } = req.params;
        const validTables = ['user', 'item', 'recipe', 'groceryItem'];

        if (!validTables.includes(table)) {
            return res.status(400).json({ message: 'Invalid table name' });
        }

        let record;
        const data = req.body;

        switch (table) {
            case 'user':
                const bcrypt = require('bcryptjs');
                data.password = await bcrypt.hash(data.password || 'changeme123', 10);
                record = await prisma.user.create({ data });
                delete record.password;
                break;
            case 'item':
                record = await prisma.item.create({ data });
                break;
            case 'recipe':
                record = await prisma.recipe.create({ data });
                break;
            case 'groceryItem':
                record = await prisma.groceryItem.create({ data });
                break;
        }

        res.status(201).json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
