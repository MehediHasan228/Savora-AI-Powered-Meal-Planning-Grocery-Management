const prisma = require('../prismaClient');

/**
 * Audit Logging Service
 */
const logAction = async ({ adminId, action, module, targetId, oldData, newData, ipAddress }) => {
    try {
        await prisma.auditLog.create({
            data: {
                adminId,
                action,
                module,
                targetId: targetId ? String(targetId) : null,
                oldData: oldData ? JSON.stringify(oldData) : null,
                newData: newData ? JSON.stringify(newData) : null,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

module.exports = { logAction };
