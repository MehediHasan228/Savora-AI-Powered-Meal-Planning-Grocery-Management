const prisma = require('../prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'savora_secret', {
        expiresIn: '30d'
    });
};

// @desc Register user
// @route POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        console.log(`Login attempt for: [${email}]`);
        email = email.trim();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`User not found: ${email}`);
        } else {
            console.log(`User found. Comparing passwords...`);
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log(`Login successful: ${email}`);
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Get user profile
// @route GET /api/auth/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.user.id) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true
            }
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc Update user profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, avatar, openaiKey, spoonacularKey, preferences } = req.body;

        // Check if email is taken by another user
        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(req.user.id) },
            data: {
                name,
                email,
                avatar,
                openaiKey,
                spoonacularKey,
                preferences: preferences ? JSON.parse(JSON.stringify(preferences)) : undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                openaiKey: true,
                spoonacularKey: true,
                preferences: true,
                createdAt: true
            }
        });

        res.json(updatedUser);
    } catch (err) {
        console.error('❌ updateProfile Error:', err);
        res.status(400).json({ message: err.message });
    }
};
