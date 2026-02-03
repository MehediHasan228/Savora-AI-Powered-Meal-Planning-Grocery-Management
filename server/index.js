const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const rateLimit = require('express-rate-limit');

// Load environment variables immediately
dotenv.config();

const prisma = require('./prismaClient');

const app = express();

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit login/register attempts
    message: { message: 'Too many login attempts, please try again after an hour' }
});

// Middleware
app.use(cors({
    origin: ['https://mehedihasan228.github.io', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Savora Admin API' });
});

// Database Connection check
console.log('⌛ Connecting to Database...');
prisma.$connect()
    .then(() => console.log('✅ Connected to Database via Prisma'))
    .catch((err) => {
        console.error('❌ Prisma Connection Error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/database', require('./routes/database'));
app.use('/api/external/recipes', require('./routes/externalRecipes'));
app.use('/api/grocery', require('./routes/grocery'));
app.use('/api/meal-plan', require('./routes/mealPlan'));
app.use('/api/system', require('./routes/system'));


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
