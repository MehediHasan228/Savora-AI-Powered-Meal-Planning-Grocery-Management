const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('🌱 Seeding database with demo data...');

    // Clear existing data (in correct order due to foreign keys)
    await prisma.apiUsageLog.deleteMany();
    await prisma.recipeCache.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.groceryItem.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.item.deleteMany();
    await prisma.user.deleteMany();

    // Create demo users
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const adminUser = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@savora.com',
            password: hashedPassword,
            role: 'admin',
            status: 'Active',
            plan: 'Premium'
        }
    });

    const demoUser = await prisma.user.create({
        data: {
            name: 'Demo User',
            email: 'demo@savora.com',
            password: hashedPassword,
            role: 'user',
            status: 'Active',
            plan: 'Free'
        }
    });

    console.log('✅ Created users');

    // Create inventory items
    const inventoryItems = [
        { name: 'Chicken Breast', category: 'Meat', qty: '500g', expiry: '2026-02-05', status: 'Fresh', storageZone: 'Fridge', location: 'Fridge', userId: adminUser.id },
        { name: 'Eggs', category: 'Dairy', qty: '12 pcs', expiry: '2026-02-10', status: 'Fresh', storageZone: 'Fridge', location: 'Fridge', userId: adminUser.id },
        { name: 'Milk', category: 'Dairy', qty: '1L', expiry: '2026-02-03', status: 'Expiring Soon', storageZone: 'Fridge', location: 'Fridge', userId: adminUser.id },
        { name: 'Rice', category: 'Grains', qty: '2kg', expiry: '2026-06-15', status: 'Fresh', storageZone: 'Pantry', location: 'Pantry', userId: adminUser.id },
        { name: 'Tomatoes', category: 'Vegetables', qty: '6 pcs', expiry: '2026-02-02', status: 'Expiring Soon', storageZone: 'Fridge', location: 'Fridge', userId: adminUser.id },
        { name: 'Onions', category: 'Vegetables', qty: '1kg', expiry: '2026-02-20', status: 'Fresh', storageZone: 'Pantry', location: 'Pantry', userId: adminUser.id },
        { name: 'Garlic', category: 'Vegetables', qty: '200g', expiry: '2026-02-25', status: 'Fresh', storageZone: 'Pantry', location: 'Pantry', userId: adminUser.id },
        { name: 'Olive Oil', category: 'Oils', qty: '500ml', expiry: '2026-12-01', status: 'Fresh', storageZone: 'Pantry', location: 'Pantry', userId: adminUser.id },
        { name: 'Pasta', category: 'Grains', qty: '500g', expiry: '2026-08-15', status: 'Fresh', storageZone: 'Pantry', location: 'Pantry', userId: adminUser.id },
        { name: 'Cheese', category: 'Dairy', qty: '250g', expiry: '2026-02-08', status: 'Fresh', storageZone: 'Fridge', location: 'Fridge', userId: adminUser.id },
    ];

    for (const item of inventoryItems) {
        await prisma.item.create({ data: item });
    }
    console.log('✅ Created inventory items');

    // Create recipes
    const recipes = [
        {
            title: 'Chicken Stir Fry',
            cuisine: 'Asian',
            time: 30,
            calories: 450,
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
            ingredients: JSON.stringify(['Chicken Breast', 'Garlic', 'Onions', 'Soy Sauce', 'Vegetables']),
            instructions: '1. Cut chicken into strips. 2. Sauté garlic and onions. 3. Add chicken and cook until done. 4. Add vegetables and soy sauce. 5. Serve hot with rice.',
            userId: adminUser.id
        },
        {
            title: 'Pasta Carbonara',
            cuisine: 'Italian',
            time: 25,
            calories: 650,
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
            ingredients: JSON.stringify(['Pasta', 'Eggs', 'Cheese', 'Bacon', 'Garlic']),
            instructions: '1. Cook pasta al dente. 2. Fry bacon until crispy. 3. Mix eggs with cheese. 4. Combine hot pasta with egg mixture. 5. Add bacon and serve.',
            userId: adminUser.id
        },
        {
            title: 'Tomato Rice',
            cuisine: 'Indian',
            time: 35,
            calories: 380,
            image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400',
            ingredients: JSON.stringify(['Rice', 'Tomatoes', 'Onions', 'Garlic', 'Spices']),
            instructions: '1. Sauté onions and garlic. 2. Add chopped tomatoes. 3. Add rice and water. 4. Cook until rice is done. 5. Garnish and serve.',
            userId: adminUser.id
        },
        {
            title: 'Omelette',
            cuisine: 'French',
            time: 10,
            calories: 280,
            image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400',
            ingredients: JSON.stringify(['Eggs', 'Cheese', 'Milk', 'Salt', 'Pepper']),
            instructions: '1. Beat eggs with milk, salt, pepper. 2. Heat butter in pan. 3. Pour egg mixture. 4. Add cheese. 5. Fold and serve.',
            userId: adminUser.id
        },
    ];

    for (const recipe of recipes) {
        await prisma.recipe.create({ data: recipe });
    }
    console.log('✅ Created recipes');

    // Create grocery items
    const groceryItems = [
        { name: 'Bread', category: 'Bakery', isBought: false, price: 2.50, userId: adminUser.id },
        { name: 'Butter', category: 'Dairy', isBought: false, price: 4.00, userId: adminUser.id },
        { name: 'Apples', category: 'Fruits', isBought: true, price: 3.50, userId: adminUser.id },
        { name: 'Orange Juice', category: 'Beverages', isBought: false, price: 5.00, userId: adminUser.id },
        { name: 'Yogurt', category: 'Dairy', isBought: false, price: 3.00, userId: adminUser.id },
        { name: 'Bananas', category: 'Fruits', isBought: true, price: 2.00, userId: adminUser.id },
    ];

    for (const item of groceryItems) {
        await prisma.groceryItem.create({ data: item });
    }
    console.log('✅ Created grocery items');

    // Create meal plans for the current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

    const mealPlans = [];
    const meals = ['breakfast', 'lunch', 'dinner'];
    const recipeIds = await prisma.recipe.findMany({ select: { id: true } });

    // Create 7 days of meal plans
    for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + day);

        for (const slot of meals) {
            const randomRecipe = recipeIds[Math.floor(Math.random() * recipeIds.length)];
            mealPlans.push({
                userId: adminUser.id,
                date: currentDate,
                slot,
                recipeId: randomRecipe.id,
                servings: Math.floor(Math.random() * 3) + 2 // 2-4 servings
            });
        }
    }

    for (const plan of mealPlans) {
        await prisma.mealPlan.create({ data: plan });
    }
    console.log('✅ Created meal plans');

    // Create recipe cache (simulating cached Spoonacular recipes)
    const cachedRecipes = [
        {
            spoonacularId: 716429,
            title: "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
            image: "https://spoonacular.com/recipeImages/716429-312x231.jpg",
            cuisine: "Italian",
            cookTime: 45,
            calories: 584,
            protein: 18.5,
            carbs: 75.2,
            fat: 22.1,
            fiber: 8.3,
            ingredients: JSON.stringify([
                { name: "cauliflower", amount: 1, unit: "head" },
                { name: "pasta", amount: 12, unit: "oz" },
                { name: "garlic", amount: 4, unit: "cloves" },
                { name: "scallions", amount: 3, unit: "stalks" },
                { name: "breadcrumbs", amount: 0.5, unit: "cup" }
            ]),
            instructions: "1. Cook pasta according to package directions.\n2. Steam cauliflower florets until tender.\n3. Sauté garlic and scallions in olive oil.\n4. Toss everything together with toasted breadcrumbs.",
            popularity: 15,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        {
            spoonacularId: 715538,
            title: "Bruschetta Style Pork & Pasta",
            image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
            cuisine: "Italian",
            cookTime: 35,
            calories: 450,
            protein: 32.5,
            carbs: 48.2,
            fat: 15.1,
            fiber: 4.3,
            ingredients: JSON.stringify([
                { name: "pork tenderloin", amount: 1, unit: "lb" },
                { name: "pasta", amount: 8, unit: "oz" },
                { name: "tomatoes", amount: 3, unit: "large" },
                { name: "basil", amount: 0.25, unit: "cup" },
                { name: "balsamic vinegar", amount: 2, unit: "tbsp" }
            ]),
            instructions: "1. Season and grill pork until cooked through.\n2. Cook pasta al dente.\n3. Dice tomatoes and mix with basil and balsamic.\n4. Slice pork and serve over pasta with tomato mixture.",
            popularity: 8,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        {
            spoonacularId: 644387,
            title: "Garlic and Herb Roasted Chicken",
            image: "https://spoonacular.com/recipeImages/644387-312x231.jpg",
            cuisine: "American",
            cookTime: 60,
            calories: 380,
            protein: 42.0,
            carbs: 5.2,
            fat: 21.5,
            fiber: 0.5,
            ingredients: JSON.stringify([
                { name: "whole chicken", amount: 1, unit: "whole" },
                { name: "garlic", amount: 6, unit: "cloves" },
                { name: "rosemary", amount: 3, unit: "sprigs" },
                { name: "thyme", amount: 3, unit: "sprigs" },
                { name: "olive oil", amount: 2, unit: "tbsp" }
            ]),
            instructions: "1. Preheat oven to 375°F.\n2. Rub chicken with minced garlic, herbs, and oil.\n3. Roast for 1 hour until golden and cooked through.\n4. Let rest before carving.",
            popularity: 22,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days (popular)
        }
    ];

    for (const recipe of cachedRecipes) {
        await prisma.recipeCache.create({ data: recipe });
    }
    console.log('✅ Created recipe cache');

    // Create API usage logs (simulating past API calls)
    const apiLogs = [];
    const endpoints = ['search', 'getDetails', 'search', 'getDetails', 'search'];

    // Create logs for the past 7 days
    for (let day = 0; day < 7; day++) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - day);

        // Random number of calls per day (5-15)
        const callsPerDay = Math.floor(Math.random() * 10) + 5;

        for (let i = 0; i < callsPerDay; i++) {
            const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
            const isSuccess = Math.random() > 0.1; // 90% success rate

            apiLogs.push({
                endpoint: randomEndpoint,
                userId: adminUser.id,
                cost: 1,
                success: isSuccess,
                errorMsg: isSuccess ? null : 'API rate limit exceeded',
                createdAt: new Date(logDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)
            });
        }
    }

    for (const log of apiLogs) {
        await prisma.apiUsageLog.create({ data: log });
    }
    console.log('✅ Created API usage logs');

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📊 Demo Data Summary:');
    console.log('   Users: 2 (1 admin, 1 regular user)');
    console.log('   Recipes: 4');
    console.log('   Inventory Items: 10');
    console.log('   Grocery Items: 6');
    console.log('   Meal Plans: 21 (7 days × 3 meals)');
    console.log('   Cached Recipes: 3');
    console.log('   API Usage Logs: ~70');
    console.log('');
    console.log('📧 Demo Login Credentials:');
    console.log('   Admin: admin@savora.com / demo123');
    console.log('   User:  demo@savora.com / demo123');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
