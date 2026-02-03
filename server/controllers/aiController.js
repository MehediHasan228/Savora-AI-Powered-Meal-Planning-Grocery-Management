const prisma = require('../prismaClient');
const { OpenAI } = require('openai');

// @desc Chat with OpenAI using per-user keys
// @route POST /api/ai/chat
exports.chat = async (req, res) => {
    try {
        const { messages, systemPrompt, temperature } = req.body;

        // Fetch user's OpenAI key from DB
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user || (!user.openaiKey && !process.env.OPENAI_API_KEY)) {
            return res.status(400).json({
                message: 'OpenAI API Key not found. Please add it in Settings.'
            });
        }

        const openai = new OpenAI({
            apiKey: user.openaiKey || process.env.OPENAI_API_KEY
        });

        const aiSetting = await prisma.systemSetting.findUnique({ where: { key: 'AI_CONFIG' } });
        let aiConfig = {};
        if (aiSetting && aiSetting.value) {
            try {
                aiConfig = JSON.parse(aiSetting.value);
            } catch (e) {
                console.error('AI Config Parse Error in Chat:', e);
            }
        }

        const response = await openai.chat.completions.create({
            model: aiConfig.model || "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemPrompt || aiConfig.masterPrompt || "You are a helpful assistant." },
                ...messages
            ],
            temperature: temperature ?? aiConfig.temperature ?? 0.7,
            max_tokens: aiConfig.maxTokens || 1000,
            top_p: aiConfig.topP ?? 1,
            presence_penalty: aiConfig.presencePenalty ?? 0,
            frequency_penalty: aiConfig.frequencyPenalty ?? 0,
        });

        res.json({
            content: response.choices[0].message.content,
            usage: response.usage
        });
    } catch (err) {
        console.error('OpenAI Chat Error:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Error communicating with OpenAI',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// @desc AI Analysis of Inventory
// @route POST /api/ai/analyze-inventory
exports.analyzeInventory = async (req, res) => {
    try {
        const { items } = req.body; // Array of ingredients from frontend

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const apiKey = user?.openaiKey || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(400).json({
                message: 'OpenAI API Key not found. Please add it in Settings.'
            });
        }

        const aiSetting = await prisma.systemSetting.findUnique({ where: { key: 'AI_CONFIG' } });
        let aiConfig = {};
        if (aiSetting && aiSetting.value) {
            try {
                aiConfig = JSON.parse(aiSetting.value);
            } catch (e) {
                console.error('AI Config Parse Error in Analyze:', e);
            }
        }

        const openai = new OpenAI({ apiKey });

        // Use requested logic: suggest 2 simple recipes based on provided items
        const response = await openai.chat.completions.create({
            model: aiConfig.model || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `${aiConfig.masterPrompt || "You are a professional chef."} Suggest 2 simple recipes based on the available ingredients provided. Include a short title and 3-4 steps for each. Return as JSON: { \"suggestion\": \"...text...\", \"suggestions\": [{ \"title\": \"\", \"description\": \"\", \"matchPercent\": 100 }] }`
                },
                {
                    role: "user",
                    content: `I have the following ingredients: ${items?.join(", ") || "Nothing"}. What can I cook?`
                }
            ],
            response_format: { type: "json_object" },
            temperature: aiConfig.temperature ?? 0.7,
            max_tokens: aiConfig.maxTokens || 500,
            top_p: aiConfig.topP ?? 1,
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json({
            success: true,
            suggestion: result.suggestion,
            suggestions: result.suggestions
        });
    } catch (err) {
        console.error('AI Analysis Error:', err);
        res.status(500).json({
            message: 'AI Service is currently unavailable',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
