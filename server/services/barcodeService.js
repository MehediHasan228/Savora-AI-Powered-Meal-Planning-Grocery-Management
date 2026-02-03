const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Barcode Service
 * Handles barcode lookup and learning
 */

// Lookup barcode in database
exports.lookupBarcode = async (barcode) => {
    try {
        const product = await prisma.barcodeProduct.findUnique({
            where: { barcode }
        });

        if (product) {
            // Update last used
            await prisma.barcodeProduct.update({
                where: { barcode },
                data: { lastUsed: new Date() }
            });

            return {
                found: true,
                name: product.name,
                category: product.category,
                defaultExpiry: product.defaultExpiry
            };
        }

        return { found: false };
    } catch (err) {
        console.error('Barcode lookup error:', err);
        throw err;
    }
};

// Learn new barcode product
exports.learnBarcode = async (barcode, name, category, defaultExpiry) => {
    try {
        const existing = await prisma.barcodeProduct.findUnique({
            where: { barcode }
        });

        if (existing) {
            // Increment learning count
            return await prisma.barcodeProduct.update({
                where: { barcode },
                data: {
                    learningCount: existing.learningCount + 1,
                    lastUsed: new Date()
                }
            });
        }

        // Create new
        return await prisma.barcodeProduct.create({
            data: {
                barcode,
                name,
                category,
                defaultExpiry,
                learningCount: 1
            }
        });
    } catch (err) {
        console.error('Barcode learn error:', err);
        throw err;
    }
};

// Get popular barcodes (for analytics)
exports.getPopularBarcodes = async (limit = 20) => {
    return await prisma.barcodeProduct.findMany({
        orderBy: { learningCount: 'desc' },
        take: limit
    });
};
