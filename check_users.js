const prisma = require('./server/prismaClient');

async function checkUsers() {
    const users = await prisma.user.findMany();
    console.log('Current Users in DB:');
    users.forEach(u => {
        console.log(`- ${u.name} (${u.email}) Role: ${u.role}`);
    });
    await prisma.$disconnect();
}

checkUsers();
