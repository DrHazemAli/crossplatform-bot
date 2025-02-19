const express = require('express');
const router = express.Router();
const axios = require('axios');

// Facebook webhook verification
router.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Facebook webhook verified');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Handle incoming messages and events
router.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'page') {
            for (const entry of body.entry) {
                const webhookEvent = entry.messaging[0];
                const senderId = webhookEvent.sender.id;

                // Handle different types of events
                if (webhookEvent.message) {
                    await handleMessage(webhookEvent);
                } else if (webhookEvent.postback) {
                    await handlePostback(webhookEvent);
                } else if (webhookEvent.reaction) {
                    await handleReaction(webhookEvent);
                }
            }

            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Facebook webhook error:', error);
        res.sendStatus(500);
    }
});

// Handle different types of messages
async function handleMessage(event) {
    const senderId = event.sender.id;
    const message = event.message;

    // Handle text messages
    if (message.text) {
        await handleTextMessage(senderId, message.text);
    }
    // Handle quick replies
    else if (message.quick_reply) {
        await handleQuickReply(senderId, message.quick_reply);
    }
    // Handle attachments (images, videos, files)
    else if (message.attachments) {
        await handleAttachment(senderId, message.attachments);
    }
}

// Handle text messages
async function handleTextMessage(senderId, text) {
    // Example: Show different button types based on user input
    if (text.toLowerCase().includes('menu')) {
        await sendButtonTemplate(senderId);
    } else if (text.toLowerCase().includes('options')) {
        await sendQuickReplies(senderId);
    } else if (text.toLowerCase().includes('list')) {
        await sendGenericTemplate(senderId);
    } else {
        await sendTextMessage(senderId, `Echo: ${text}`);
    }
}

// Send basic text message
async function sendTextMessage(senderId, text) {
    await sendMessage(senderId, { text });
}

// Send button template
async function sendButtonTemplate(senderId) {
    const messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "What would you like to do?",
                buttons: [
                    {
                        type: "web_url",
                        url: "https://your-website.com",
                        title: "Visit Website"
                    },
                    {
                        type: "postback",
                        title: "Start Order",
                        payload: "START_ORDER"
                    },
                    {
                        type: "phone_number",
                        title: "Call Us",
                        payload: "+1234567890"
                    }
                ]
            }
        }
    };
    await sendMessage(senderId, messageData);
}

// Send quick replies
async function sendQuickReplies(senderId) {
    const messageData = {
        text: "Select an option:",
        quick_replies: [
            {
                content_type: "text",
                title: "Products",
                payload: "PRODUCTS"
            },
            {
                content_type: "text",
                title: "Services",
                payload: "SERVICES"
            },
            {
                content_type: "location"
            }
        ]
    };
    await sendMessage(senderId, messageData);
}

// Send generic template (carousel)
async function sendGenericTemplate(senderId) {
    const messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [
                    {
                        title: "Product 1",
                        image_url: "https://example.com/product1.jpg",
                        subtitle: "Description of product 1",
                        buttons: [
                            {
                                type: "postback",
                                title: "Buy Now",
                                payload: "BUY_PRODUCT_1"
                            }
                        ]
                    },
                    {
                        title: "Product 2",
                        image_url: "https://example.com/product2.jpg",
                        subtitle: "Description of product 2",
                        buttons: [
                            {
                                type: "postback",
                                title: "Buy Now",
                                payload: "BUY_PRODUCT_2"
                            }
                        ]
                    }
                ]
            }
        }
    };
    await sendMessage(senderId, messageData);
}

// Handle postback events
async function handlePostback(event) {
    const senderId = event.sender.id;
    const payload = event.postback.payload;

    switch (payload) {
        case 'START_ORDER':
            await sendTextMessage(senderId, "Let's start your order! What would you like to order?");
            await sendGenericTemplate(senderId);
            break;
        case 'BUY_PRODUCT_1':
            await sendTextMessage(senderId, "Great choice! Product 1 has been added to your cart.");
            break;
        case 'BUY_PRODUCT_2':
            await sendTextMessage(senderId, "Excellent! Product 2 has been added to your cart.");
            break;
        default:
            await sendTextMessage(senderId, "I'm not sure how to handle that request.");
    }
}

// Handle quick reply responses
async function handleQuickReply(senderId, quickReply) {
    const payload = quickReply.payload;

    switch (payload) {
        case 'PRODUCTS':
            await sendGenericTemplate(senderId);
            break;
        case 'SERVICES':
            await sendTextMessage(senderId, "Here are our services...");
            break;
        default:
            await sendTextMessage(senderId, "I received your quick reply!");
    }
}

// Handle attachment messages
async function handleAttachment(senderId, attachments) {
    for (const attachment of attachments) {
        switch (attachment.type) {
            case 'image':
                await sendTextMessage(senderId, "I received your image!");
                break;
            case 'video':
                await sendTextMessage(senderId, "I received your video!");
                break;
            case 'audio':
                await sendTextMessage(senderId, "I received your audio!");
                break;
            case 'file':
                await sendTextMessage(senderId, "I received your file!");
                break;
            case 'location':
                await handleLocation(senderId, attachment.payload);
                break;
        }
    }
}

// Handle location data
async function handleLocation(senderId, locationPayload) {
    const { coordinates } = locationPayload;
    await sendTextMessage(
        senderId, 
        `I received your location: Lat ${coordinates.lat}, Long ${coordinates.long}`
    );
}

// Handle reaction events
async function handleReaction(event) {
    const senderId = event.sender.id;
    const reaction = event.reaction.reaction;
    await sendTextMessage(senderId, `Thanks for your ${reaction} reaction!`);
}

// Base function to send messages
async function sendMessage(senderId, messageData) {
    try {
        await axios.post(
            `https://graph.facebook.com/v12.0/me/messages`,
            {
                recipient: { id: senderId },
                message: messageData
            },
            {
                params: { access_token: process.env.FB_ACCESS_TOKEN }
            }
        );
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

module.exports = router; 