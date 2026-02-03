const prisma = require('../prismaClient');
const auditLog = require('../services/auditLogService');

/**
 * AI Tuning Controller
 * Persists and retrieves global AI configuration
 */

const DEFAULT_CONFIG = {
    // Engine Tuning (Weights)
    matchPercentageThreshold: 75,
    expiryWeight: 0.8,
    prepTimeWeight: 0.3,
    userRatingWeight: 0.5,
    duplicationPreventionLevel: 'High',
    activeLearningEnabled: true,

    // OpenAI Parameters (Global Defaults)
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,

    // Prompt Engineering
    masterPrompt: 'You are an intelligent kitchen assistant focusing on waste reduction and nutritional balance. Always provide professional, accurate, and concise culinary advice.'
};

exports.getAIConfig = async (req, res) => {
    try {
        let setting = await prisma.systemSetting.findUnique({
            where: { key: 'AI_CONFIG' }
        });

        if (!setting) {
            // Seed defaults if missing
            setting = await prisma.systemSetting.create({
                data: {
                    key: 'AI_CONFIG',
                    value: JSON.stringify(DEFAULT_CONFIG)
                }
            });
        }

        let config;
        try {
            config = JSON.parse(setting.value);
        } catch (e) {
            console.error('AI Config Parse Error:', e);
            config = DEFAULT_CONFIG;
        }

        res.json(config);
    } catch (err) {
        console.error('AI Tuning Error:', err);
        res.status(500).json({
            message: 'Failed to process AI configuration',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.updateAIConfig = async (req, res) => {
    try {
        const oldSetting = await prisma.systemSetting.findUnique({
            where: { key: 'AI_CONFIG' }
        });

        const newConfig = req.body;

        const updatedSetting = await prisma.systemSetting.upsert({
            where: { key: 'AI_CONFIG' },
            update: { value: JSON.stringify(newConfig) },
            create: { key: 'AI_CONFIG', value: JSON.stringify(newConfig) }
        });

        // Log the change
        let oldConfigData = null;
        if (oldSetting && oldSetting.value) {
            try {
                oldConfigData = JSON.parse(oldSetting.value);
            } catch (e) {
                console.error('Audit Log Old Data Parse Error:', e);
            }
        }

        await auditLog.logAction({
            adminId: req.user.id,
            action: 'AI_OVERRIDE',
            module: 'AI',
            targetId: 'GLOBAL_CONFIG',
            oldData: oldConfigData,
            newData: newConfig,
            ipAddress: req.ip
        });

        res.json({ message: 'AI logic recalibrated', config: newConfig });
    } catch (err) {
        console.error('Update AI Config Error:', err);
        res.status(500).json({
            message: 'Failed to update AI configuration',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
