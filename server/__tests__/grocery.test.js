/**
 * Grocery Intelligence Service Tests
 */
const { classifyItem } = require('../services/groceryIntelligenceService');
const prisma = require('../prismaClient');

// Mock Prisma
jest.mock('../prismaClient', () => ({
    item: {
        findMany: jest.fn()
    },
    mealPlan: {
        findMany: jest.fn()
    }
}));

describe('Grocery Intelligence classification', () => {
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should classify as NOW if item is not in inventory', async () => {
        prisma.item.findMany.mockResolvedValue([]);
        const result = await classifyItem({ name: 'Milk' }, userId);
        expect(result).toBe('NOW');
    });

    it('should classify as NOW if quantity is low (<= 1)', async () => {
        prisma.item.findMany.mockResolvedValue([
            { name: 'Milk', qty: '0.5' }
        ]);
        const result = await classifyItem({ name: 'Milk' }, userId);
        expect(result).toBe('NOW');
    });

    it('should classify as NOW if item is needed for a meal plan', async () => {
        prisma.item.findMany.mockResolvedValue([
            { name: 'Onion', qty: '5' } // Plenty in stock
        ]);
        prisma.mealPlan.findMany.mockResolvedValue([
            {
                isCustom: false,
                recipe: { ingredients: '1 large onion, beef, salt' }
            }
        ]);
        const result = await classifyItem({ name: 'Onion' }, userId);
        expect(result).toBe('NOW');
    });

    it('should classify as LATER if in stock, plenty qty, and not in meal plan', async () => {
        prisma.item.findMany.mockResolvedValue([
            { name: 'Salt', qty: '10' }
        ]);
        prisma.mealPlan.findMany.mockResolvedValue([]);
        const result = await classifyItem({ name: 'Salt' }, userId);
        expect(result).toBe('LATER');
    });
});
