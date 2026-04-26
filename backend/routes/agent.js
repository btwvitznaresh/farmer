/**
 * Arjun Agent Route
 * POST /agent/chat    — Main conversation endpoint
 * GET  /agent/greeting — Time-aware greeting
 */

const express = require('express');
const router = express.Router();
const { runArjunAgent, buildArjunGreeting } = require('../services/arjunAgentService');

/**
 * POST /agent/chat
 * Body: { message, language, agentMemory, conversationHistory, weatherContext }
 */
router.post('/chat', async (req, res) => {
    try {
        const {
            message,
            language = 'en',
            agentMemory = {},
            conversationHistory = [],
            weatherContext = null
        } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        console.log(`[Agent Route] Turn ${(agentMemory.conversationTurn || 0) + 1} | Lang: ${language} | "${message.substring(0, 60)}..."`);

        const result = await runArjunAgent(
            message.trim(),
            language,
            agentMemory,
            conversationHistory,
            weatherContext
        );

        return res.json({
            success: true,
            response: result.cleanText,
            actions: result.actions,
            updatedMemory: result.updatedMemory
        });

    } catch (error) {
        console.error('[Agent Route] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Agent error'
        });
    }
});

/**
 * GET /agent/greeting?language=en
 */
router.get('/greeting', (req, res) => {
    try {
        const language = req.query.language || 'en';
        const greeting = buildArjunGreeting(language);
        res.json({ success: true, greeting });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
