const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking max_allowed_packet...');
        const result = await prisma.$queryRawUnsafe("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log('Current max_allowed_packet:', result);

        console.log('Attempting to set max_allowed_packet to 64MB...');
        await prisma.$executeRawUnsafe("SET GLOBAL max_allowed_packet=67108864");

        const after = await prisma.$queryRawUnsafe("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log('New max_allowed_packet:', after);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
