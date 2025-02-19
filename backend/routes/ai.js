const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful chatbot assistant." },
                { role: "user", content: message }
            ],
        });

        res.json({ 
            success: true, 
            reply: completion.choices[0].message.content 
        });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get AI response' 
        });
    }
});

module.exports = router; 