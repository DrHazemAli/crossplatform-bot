const express = require('express');
const router = express.Router();
const axios = require('axios');

// WhatsApp webhook verification
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Handle incoming messages and events
router.post('/webhook', async (req, res) => {
    try {
        const { body } = req;
        
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                const changes = entry.changes[0];
                if (changes.field === 'messages') {
                    const message = changes.value.messages[0];
                    const from = message.from;

                    if (message.type === 'text') {
                        await handleTextMessage(from, message);
                    } else if (message.type === 'interactive') {
                        await handleInteractiveMessage(from, message);
                    } else if (message.type === 'location') {
                        await handleLocation(from, message);
                    } else if (message.type === 'image' || message.type === 'video' || message.type === 'document') {
                        await handleMedia(from, message);
                    }
                }
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        res.sendStatus(500);
    }
});

// Handle text messages
async function handleTextMessage(from, message) {
    const text = message.text.body.toLowerCase();

    if (text.includes('menu')) {
        await sendListMessage(from);
    } else if (text.includes('products')) {
        await sendProductMessage(from);
    } else {
        await sendTextMessage(from, `Echo: ${message.text.body}`);
    }
}

// Send text message
async function sendTextMessage(to, text) {
    await sendMessage(to, {
        type: 'text',
        text: { body: text }
    });
}

// Send interactive list message
async function sendListMessage(to) {
    await sendMessage(to, {
        type: 'interactive',
        interactive: {
            type: 'list',
            header: {
                type: 'text',
                text: 'Available Options'
            },
            body: {
                text: 'Please select from the following options'
            },
            footer: {
                text: 'Select an option to continue'
            },
            action: {
                button: 'View Options',
                sections: [
                    {
                        title: 'Products & Services',
                        rows: [
                            {
                                id: 'products',
                                title: 'Our Products',
                                description: 'View our product catalog'
                            },
                            {
                                id: 'services',
                                title: 'Our Services',
                                description: 'View our services'
                            }
                        ]
                    },
                    {
                        title: 'Support',
                        rows: [
                            {
                                id: 'help',
                                title: 'Get Help',
                                description: 'Contact our support team'
                            }
                        ]
                    }
                ]
            }
        }
    });
}

// Send product message with buttons
async function sendProductMessage(to) {
    await sendMessage(to, {
        type: 'interactive',
        interactive: {
            type: 'button',
            header: {
                type: 'text',
                text: 'Featured Product'
            },
            body: {
                text: 'Check out our latest product!'
            },
            footer: {
                text: 'Tap a button to select'
            },
            action: {
                buttons: [
                    {
                        type: 'reply',
                        reply: {
                            id: 'buy_now',
                            title: 'Buy Now'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'learn_more',
                            title: 'Learn More'
                        }
                    }
                ]
            }
        }
    });
}

// Handle interactive messages (button clicks, list selections)
async function handleInteractiveMessage(from, message) {
    const interaction = message.interactive;
    let response;

    if (interaction.type === 'button_reply') {
        const buttonId = interaction.button_reply.id;
        switch (buttonId) {
            case 'buy_now':
                response = 'Great! Let\'s process your order.';
                break;
            case 'learn_more':
                response = 'Here\'s more information about our product...';
                break;
            default:
                response = 'Thank you for your selection!';
        }
    } else if (interaction.type === 'list_reply') {
        const listId = interaction.list_reply.id;
        switch (listId) {
            case 'products':
                await sendProductMessage(from);
                return;
            case 'services':
                response = 'Here are our available services...';
                break;
            case 'help':
                response = 'Our support team will contact you shortly.';
                break;
            default:
                response = 'Thank you for your selection!';
        }
    }

    await sendTextMessage(from, response);
}

// Handle location messages
async function handleLocation(from, message) {
    const { latitude, longitude } = message.location;
    await sendTextMessage(
        from,
        `Location received: Latitude ${latitude}, Longitude ${longitude}`
    );
}

// Handle media messages
async function handleMedia(from, message) {
    const mediaType = message.type;
    let response;

    switch (mediaType) {
        case 'image':
            response = 'Thanks for the image!';
            break;
        case 'video':
            response = 'Thanks for the video!';
            break;
        case 'document':
            response = 'Thanks for the document!';
            break;
        default:
            response = 'Media received!';
    }

    await sendTextMessage(from, response);
}

// Base function to send messages
async function sendMessage(to, message) {
    try {
        await axios.post(
            `https://graph.facebook.com/v12.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                ...message
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}

module.exports = router; 