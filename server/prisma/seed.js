const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@savora.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@savora.com',
            password: hashedPassword,
            role: 'admin'
        }
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // 2. Create Initial Inventory Items
    const items = [
        { name: 'Pasta (Penne)', category: 'Grains', qty: '2 boxes', expiry: '2024-12-10', status: 'Fresh', location: 'Pantry' },
        { name: 'Tomato Sauce', category: 'Canned', qty: '3 cans', expiry: '2024-08-15', status: 'Expired', location: 'Pantry' },
        { name: 'Olive Oil', category: 'Oils', qty: '1 bottle', expiry: '2025-01-20', status: 'Expiring Soon', location: 'Pantry' },
        { name: 'Milk', category: 'Dairy', qty: '1 gallon', expiry: '2024-02-10', status: 'Expired', location: 'Fridge' },
        { name: 'Chicken Breast', category: 'Meat', qty: '2 lbs', expiry: '2024-02-05', status: 'Expired', location: 'Freezer' },
        { name: 'Rice', category: 'Grains', qty: '5 lbs', expiry: '2025-06-01', status: 'Fresh', location: 'Pantry' }
    ];

    for (const item of items) {
        await prisma.item.create({
            data: {
                ...item,
                userId: admin.id
            }
        });
    }
    console.log('✅ Inventory items seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
