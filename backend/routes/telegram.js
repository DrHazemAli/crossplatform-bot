const express = require('express');
const router = express.Router();
const axios = require('axios');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// Handle incoming updates
router.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        
        if (update.message) {
            await handleMessage(update.message);
        } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Telegram webhook error:', error);
        res.sendStatus(500);
    }
});

// Handle different types of messages
async function handleMessage(message) {
    const chatId = message.chat.id;

    if (message.text) {
        await handleTextMessage(chatId, message.text);
    } else if (message.location) {
        await handleLocation(chatId, message.location);
    } else if (message.photo || message.video || message.document) {
        await handleMedia(chatId, message);
    }
}

// Handle text messages
async function handleTextMessage(chatId, text) {
    if (text.startsWith('/')) {
        await handleCommand(chatId, text);
    } else if (text.toLowerCase().includes('menu')) {
        await sendInlineKeyboard(chatId);
    } else {
        await sendTextMessage(chatId, `Echo: ${text}`);
    }
}

// Send text message
async function sendTextMessage(chatId, text, options = {}) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text,
        ...options
    });
}

// Send inline keyboard
async function sendInlineKeyboard(chatId) {
    const keyboard = {
        inline_keyboard: [
            [
                { text: 'Products', callback_data: 'products' },
                { text: 'Services', callback_data: 'services' }
            ],
            [
                { text: 'Support', callback_data: 'support' },
                { text: 'Website', url: 'https://skytells.io' }
            ]
        ]
    };

    await sendTextMessage(chatId, 'Please select an option:', {
        reply_markup: keyboard
    });
}

// Handle callback queries (button clicks)
async function handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const data = query.callback_data;

    switch (data) {
        case 'products':
            await sendTextMessage(chatId, 'Here are our products...');
            break;
        case 'services':
            await sendTextMessage(chatId, 'Here are our services...');
            break;
        case 'support':
            await sendTextMessage(chatId, 'Contact our support team at support@skytells.com');
            break;
    }

    // Answer callback query to remove loading state
    await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
        callback_query_id: query.id
    });
}

// Handle commands
async function handleCommand(chatId, command) {
    switch (command) {
        case '/start':
            await sendTextMessage(chatId, 'Welcome! How can I help you today?');
            await sendInlineKeyboard(chatId);
            break;
        case '/help':
            await sendTextMessage(chatId, 'Available commands:\n/start - Start conversation\n/menu - Show menu\n/help - Show this help');
            break;
        case '/menu':
            await sendInlineKeyboard(chatId);
            break;
        default:
            await sendTextMessage(chatId, 'Unknown command. Type /help for available commands.');
    }
}

module.exports = router; 