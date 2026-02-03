
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
