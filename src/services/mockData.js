
// Generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Add 30 diverse sample recipes
export const sampleRecipes = [
    { id: '1', title: 'Grilled Lemon Herb Chicken', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800', calories: 450, cuisine: 'Mediterranean' },
    { id: '2', title: 'Vegetarian Quinoa Bowl', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800', calories: 380, cuisine: 'Vegetarian' },
    { id: '3', title: 'Beef Stir-Fry with Broccoli', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb74b?auto=format&fit=crop&w=800', calories: 520, cuisine: 'Asian' },
    { id: '4', title: 'Classic Spaghetti Bolognese', image: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=800', calories: 600, cuisine: 'Italian' },
    { id: '5', title: 'Avocado Toast with Poached Egg', image: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&w=800', calories: 320, cuisine: 'Breakfast' },
    { id: '6', title: 'Salmon with Asparagus', image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800', calories: 480, cuisine: 'Seafood' },
    { id: '7', title: 'Chicken Caesar Salad', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800', calories: 400, cuisine: 'Salad' },
    { id: '8', title: 'Berry Smoothie Bowl', image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=800', calories: 290, cuisine: 'Breakfast' },
    { id: '9', title: 'Homemade Pizza Margherita', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800', calories: 550, cuisine: 'Italian' },
    { id: '10', title: 'Tacos Al Pastor', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800', calories: 480, cuisine: 'Mexican' },
    { id: '11', title: 'Mushroom Risotto', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800', calories: 510, cuisine: 'Italian' },
    { id: '12', title: 'Pancakes with Maple Syrup', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800', calories: 450, cuisine: 'Breakfast' },
    { id: '13', title: 'Greek Salad', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800', calories: 250, cuisine: 'Greek' },
    { id: '14', title: 'Burger with Fries', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800', calories: 850, cuisine: 'American' },
    { id: '15', title: 'Pad Thai', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800', calories: 540, cuisine: 'Thai' },
    { id: '16', title: 'Sushi Platter', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800', calories: 400, cuisine: 'Japanese' },
    { id: '17', title: 'Lentil Soup', image: 'https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=800', calories: 220, cuisine: 'Soup' },
    { id: '18', title: 'BBQ Ribs', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800', calories: 750, cuisine: 'American' },
    { id: '19', title: 'Shrimp Scampi', image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?auto=format&fit=crop&w=800', calories: 420, cuisine: 'Italian' },
    { id: '20', title: 'Vegetable Curry', image: 'https://images.unsplash.com/photo-1631292726023-80f350727ebf?auto=format&fit=crop&w=800', calories: 360, cuisine: 'Indian' },
    { id: '21', title: 'Chocolate Brownie', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&w=800', calories: 300, cuisine: 'Dessert' },
    { id: '22', title: 'Fruit Salad', image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?auto=format&fit=crop&w=800', calories: 150, cuisine: 'Snack' },
    { id: '23', title: 'Eggplant Parmesan', image: 'https://images.unsplash.com/photo-1599354607421-39656b27cebd?auto=format&fit=crop&w=800', calories: 450, cuisine: 'Italian' },
    { id: '24', title: 'Clam Chowder', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800', calories: 380, cuisine: 'Soup' },
    { id: '25', title: 'Fish and Chips', image: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=800', calories: 650, cuisine: 'British' },
    { id: '26', title: 'Pho', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800', calories: 350, cuisine: 'Vietnamese' },
    { id: '27', title: 'Tiramisu', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800', calories: 400, cuisine: 'Dessert' },
    { id: '28', title: 'Caprese Salad', image: 'https://images.unsplash.com/photo-1529312266912-b33cf6227e2f?auto=format&fit=crop&w=800', calories: 280, cuisine: 'Salad' },
    { id: '29', title: 'Beef Wellington', image: 'https://images.unsplash.com/photo-1600891965050-6e4697920794?auto=format&fit=crop&w=800', calories: 700, cuisine: 'British' },
    { id: '30', title: 'Falafel Wrap', image: 'https://images.unsplash.com/photo-1547050605-2fbaa16538b9?auto=format&fit=crop&w=800', calories: 420, cuisine: 'Middle Eastern' }
];

// Helper to get formatted date string YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

const mockStore = {
    plans: []
};

export const mockMealPlanService = {
    getWeekPlan: (startDate, endDate) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const start = new Date(startDate);
                const end = new Date(endDate);

                const relevantPlans = mockStore.plans.filter(p => {
                    const d = new Date(p.date);
                    return d >= start && d <= end;
                });

                resolve({ data: relevantPlans });
            }, 600); // Simulate network delay
        });
    },

    generateWeekPlan: (startDate) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const start = new Date(startDate);
                const days = 7;
                const slots = ['breakfast', 'lunch', 'dinner'];
                const newPlans = [];

                // Clear existing plans for this week range to avoid duplicates in mock
                // In a real app we might update or specific logic, here we just append non-conflicting or simple logic
                // For simplicity, let's just generate new ones.

                for (let i = 0; i < days; i++) {
                    const currentDate = new Date(start);
                    currentDate.setDate(start.getDate() + i);

                    for (const slot of slots) {
                        // Pick a random recipe
                        const recipe = sampleRecipes[Math.floor(Math.random() * sampleRecipes.length)];

                        newPlans.push({
                            id: generateId(),
                            date: currentDate.toISOString(),
                            slot,
                            recipeId: recipe.id,
                            recipe: recipe,
                            servings: 1,
                            isCustom: false
                        });
                    }
                }

                // Merge into store (basic overlap handling: simply push)
                // In a real mock we might filter out existing for same slot
                mockStore.plans = [...mockStore.plans.filter(p => {
                    // Remove plans that are being replaced (same day + slot)
                    return !newPlans.some(np => {
                        return new Date(np.date).toDateString() === new Date(p.date).toDateString() && np.slot === p.slot;
                    });
                }), ...newPlans];

                resolve({ data: { message: 'Meal plan generated successfully (Demo Mode)' } });
            }, 1000);
        });
    },

    updateSlot: (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { date, slot, recipeId, servings } = data;

                // Find existing
                const existingIndex = mockStore.plans.findIndex(p => {
                    return new Date(p.date).toDateString() === new Date(date).toDateString() && p.slot === slot;
                });

                let updatedPlan;
                if (existingIndex >= 0) {
                    const plan = mockStore.plans[existingIndex];
                    if (recipeId) {
                        const recipe = sampleRecipes.find(r => r.id === recipeId);
                        plan.recipeId = recipeId;
                        plan.recipe = recipe;
                    }
                    if (servings) plan.servings = servings;
                    updatedPlan = plan;
                } else if (recipeId) {
                    // Create new if not exists
                    const recipe = sampleRecipes.find(r => r.id === recipeId);
                    updatedPlan = {
                        id: generateId(),
                        date: date,
                        slot,
                        recipeId,
                        recipe,
                        servings: 1,
                        isCustom: false
                    };
                    mockStore.plans.push(updatedPlan);
                }

                resolve({ data: updatedPlan });
            }, 300);
        });
    },

    deleteSlot: (date, slot) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockStore.plans = mockStore.plans.filter(p => {
                    return !(new Date(p.date).toDateString() === new Date(date).toDateString() && p.slot === slot);
                });
                resolve({ data: { message: 'Slot cleared' } });
            }, 300);
        });
    },


    addToGrocery: (startDate, endDate) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ data: { message: 'Added items to grocery list (Demo Mode)' } });
            }, 500);
        });
    }
};

// --- Mock Inventory ---
const mockInventory = [
    { id: '1', name: 'Milk', quantity: 1, unit: 'L', expiryDate: new Date(new Date().getTime() + 86400000 * 2).toISOString(), category: 'Dairy & Alternatives', status: 'Expiring Soon' },
    { id: '2', name: 'Eggs', quantity: 6, unit: 'pcs', expiryDate: new Date(new Date().getTime() + 86400000 * 5).toISOString(), category: 'Dairy & Alternatives', status: 'Good' },
    { id: '3', name: 'Chicken Breast', quantity: 500, unit: 'g', expiryDate: new Date(new Date().getTime() + 86400000 * 3).toISOString(), category: 'Meat & Poultry', status: 'Good' },
    { id: '4', name: 'Rice', quantity: 2, unit: 'kg', expiryDate: new Date(new Date().getTime() + 86400000 * 100).toISOString(), category: 'Grains', status: 'Good' },
    { id: '5', name: 'Tomatoes', quantity: 4, unit: 'pcs', expiryDate: new Date(new Date().getTime() - 86400000).toISOString(), category: 'Produce', status: 'Expired' }, // Expired
];

export const mockInventoryService = {
    getAll: () => Promise.resolve({ data: mockInventory }),
    create: (data) => Promise.resolve({ data: { ...data, id: generateId() } }),
    update: (id, data) => Promise.resolve({ data: { ...data, id } }),
    delete: (id) => Promise.resolve({ data: { message: 'Deleted' } }),
    moveToGrocery: (id) => Promise.resolve({ data: { message: 'Moved to grocery' } }),
    barcodeLookup: (barcode) => Promise.resolve({ data: { name: 'Scanned Item', quantity: 1, unit: 'pcs' } }),
    getSuggestions: () => Promise.resolve({ data: ['Apples', 'Bananas', 'Bread'] }),
};

// --- Mock Grocery ---
const mockGrocery = [
    { id: '1', name: 'Olive Oil', qty: 1, unit: 'bottle', checked: false, category: 'Pantry' },
    { id: '2', name: 'Salt', qty: 1, unit: 'box', checked: true, category: 'Pantry' },
    { id: '3', name: 'Pepper', qty: 1, unit: 'shaker', checked: false, category: 'Pantry' },
];

export const mockGroceryService = {
    getAll: () => Promise.resolve({ data: mockGrocery }),
    create: (data) => Promise.resolve({ data: { ...data, id: generateId() } }),
    update: (id, data) => Promise.resolve({ data: { ...data, id } }),
    bulkAdd: (items) => Promise.resolve({ data: { message: 'Added' } }),
    toggle: (id) => Promise.resolve({ data: { message: 'Toggled' } }),
    delete: (id) => Promise.resolve({ data: { message: 'Deleted' } }),
    clearCompleted: () => Promise.resolve({ data: { message: 'Cleared' } }),
    moveToInventory: () => Promise.resolve({ data: { message: 'Moved to inventory' } }),
    suggestCategory: (name) => Promise.resolve({ data: 'General' }),
    togglePriority: (id) => Promise.resolve({ data: { message: 'Priority toggled' } }),
    refresh: () => Promise.resolve({ data: { message: 'Refreshed' } }),
};

// --- Mock Recipe ---
export const mockRecipeService = {
    getAll: () => Promise.resolve({ data: sampleRecipes }),
    create: (data) => Promise.resolve({ data: { ...data, id: generateId() } }),
    update: (id, data) => Promise.resolve({ data: { ...data, id } }),
    delete: (id) => Promise.resolve({ data: { message: 'Deleted' } }),
};

// --- Mock User ---
export const mockUserService = {
    getAll: () => Promise.resolve({
        data: [
            { id: '1', name: 'Demo User', email: 'user@demo.com', role: 'user' },
            { id: '2', name: 'Admin User', email: 'admin@demo.com', role: 'admin' }
        ]
    }),
    create: (data) => Promise.resolve({ data: { ...data, id: generateId() } }),
    update: (id, data) => Promise.resolve({ data: { ...data, id } }),
    resetPassword: (id, password) => Promise.resolve({ data: { message: 'Password reset' } }),
    delete: (id) => Promise.resolve({ data: { message: 'Deleted' } }),
};

// --- Mock Admin ---
export const mockAdminInventoryService = {
    getSummary: () => Promise.resolve({ data: { totalItems: 50, lowStock: 5, expired: 2, totalValue: 1200 } }),
    getTrends: () => Promise.resolve({
        data: [
            { date: '2023-01-01', value: 100 }, { date: '2023-01-02', value: 105 },
            { date: '2023-01-03', value: 102 }, { date: '2023-01-04', value: 110 }
        ]
    }),
};

export const mockAdminGroceryService = {
    getInsights: () => Promise.resolve({ data: { mostBought: 'Milk', totalSpent: 500, monthlyAverage: 100 } }),
    getWaste: () => Promise.resolve({ data: { wastedItems: 5, wastedValue: 20 } }),
};

// --- Mock System & AI ---
export const mockSystemService = {
    getStats: () => Promise.resolve({ data: { cpu: 15, memory: 40, uptime: 123456, activeUsers: 2 } }),
};

export const mockAiService = {
    chat: (data) => new Promise(resolve => setTimeout(() => resolve({ data: { reply: "I'm a demo AI running in the browser! I can help you plan meals or manage inventory." } }), 1000)),
    analyzeInventory: (items) => Promise.resolve({ data: { analysis: "You have a good mix of proteins and veggies." } }),
};

// --- Mock Notifications ---
export const mockNotificationService = {
    getAll: () => Promise.resolve({
        data: [
            { id: '1', title: 'Welcome', message: 'Welcome to Savora Demo!', read: false, createdAt: new Date().toISOString() },
            { id: '2', title: 'Low Stock', message: 'You are running low on Milk.', read: true, createdAt: new Date().toISOString() }
        ]
    }),
    markRead: (id) => Promise.resolve({ data: { message: 'Marked read' } }),
    markReadAll: () => Promise.resolve({ data: { message: 'All read' } }),
    getSettings: () => Promise.resolve({ data: { email: true, push: false } }),
    updateSettings: (data) => Promise.resolve({ data }),
    sendBroadcast: (data) => Promise.resolve({ data: { message: 'Broadcast sent' } }),
    getStats: () => Promise.resolve({ data: { total: 100, read: 80 } }),
};

// --- Mock Auth ---
export const mockAuthService = {
    login: (credentials) => Promise.resolve({ data: { token: 'demo-token', user: { id: '1', name: 'Demo User', role: 'admin' } } }),
    register: (userData) => Promise.resolve({ data: { token: 'demo-token', user: { ...userData, id: '1', role: 'user' } } }),
    getProfile: () => Promise.resolve({ data: { id: '1', name: 'Demo User', email: 'demo@example.com', role: 'admin' } }),
    updateProfile: (data) => Promise.resolve({ data }),
};

// --- Mock Database ---
export const mockDatabaseService = {
    getStats: () => Promise.resolve({ data: { tables: 5, records: 150, size: '2MB' } }),
    getTableData: (table) => Promise.resolve({ data: [] }),
    getRecord: (table, id) => Promise.resolve({ data: {} }),
    createRecord: (table, data) => Promise.resolve({ data }),
    updateRecord: (table, id, data) => Promise.resolve({ data }),
    deleteRecord: (table, id) => Promise.resolve({ data: { message: 'Deleted' } }),
};

// --- Mock External Recipe ---
export const mockExternalRecipeService = {
    search: (params) => Promise.resolve({ data: { results: sampleRecipes.slice(0, 5) } }),
    getDetails: (id) => Promise.resolve({ data: sampleRecipes[0] }),
};
