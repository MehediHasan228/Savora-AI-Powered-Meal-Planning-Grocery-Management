const prisma = require('../prismaClient');
const auditLog = require('../services/auditLogService');

// @desc Get all users
// @route GET /api/users
exports.getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                plan: true,
                avatar: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Create user (admin)
// @route POST /api/users
const bcrypt = require('bcryptjs');
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, plan, status } = req.body;

        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password (require it)
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                avatar: req.body.avatar || '',
                role: role || 'user',
                plan: plan || 'Free',
                status: status || 'Active'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                plan: true,
                avatar: true,
                createdAt: true
            }
        });

        await auditLog.logAction({
            adminId: req.user?.id || user.id, // Support self-signup if needed
            action: 'CREATE',
            module: 'USERS',
            targetId: user.id,
            newData: { name, email, role: user.role, status: user.status },
            ipAddress: req.ip
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Update user
// @route PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, email, role, status, plan, avatar } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, role, status, plan, avatar },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                plan: true,
                avatar: true,
                createdAt: true
            }
        });

        await auditLog.logAction({
            adminId: req.user.id,
            action: 'UPDATE',
            module: 'USERS',
            targetId: id,
            newData: { name, email, role, status, plan },
            ipAddress: req.ip
        });

        res.json(updatedUser);
    } catch (err) {
        console.error('❌ updateUser Error:', err);
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc Reset user password
// @route PUT /api/users/:id/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        await auditLog.logAction({
            adminId: req.user.id,
            action: 'UPDATE',
            module: 'USERS',
            targetId: id,
            newData: { action: 'PASSWORD_RESET' },
            ipAddress: req.ip
        });

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(400).json({ message: err.message });
    }
};

// @desc Delete user
// @route DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.user.delete({
            where: { id }
        });

        await auditLog.logAction({
            adminId: req.user.id,
            action: 'DELETE',
            module: 'USERS',
            targetId: id,
            ipAddress: req.ip
        });

        res.json({ message: 'User removed successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: err.message });
    }
};
