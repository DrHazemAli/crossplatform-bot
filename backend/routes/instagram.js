const express = require('express');
const router = express.Router();
const axios = require('axios');

const INSTAGRAM_API = 'https://graph.facebook.com/v18.0';

// Instagram webhook verification (similar to Facebook)
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === process.env.FB_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Handle incoming messages and events
router.post('/webhook', async (req, res) => {
    try {
        const { body } = req;

        if (body.object === 'instagram') {
            for (const entry of body.entry) {
                if (entry.messaging) {
                    await handleMessaging(entry.messaging[0]);
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Instagram webhook error:', error);
        res.sendStatus(500);
    }
});

// Handle different types of messages
async function handleMessaging(messaging) {
    const senderId = messaging.sender.id;

    if (messaging.message) {
        await handleMessage(senderId, messaging.message);
    } else if (messaging.story_reply) {
        await handleStoryReply(senderId, messaging.story_reply);
    } else if (messaging.reaction) {
        await handleReaction(senderId, messaging.reaction);
    }
}

// Handle text messages
async function handleMessage(senderId, message) {
    if (message.text) {
        await handleTextMessage(senderId, message.text);
    } else if (message.attachments) {
        await handleAttachments(senderId, message.attachments);
    }
}

// Send text message
async function sendTextMessage(recipientId, text) {
    try {
        await axios.post(`${INSTAGRAM_API}/me/messages`, {
            recipient: { id: recipientId },
            message: { text }
        }, {
            params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN }
        });
    } catch (error) {
        console.error('Error sending Instagram message:', error);
        throw error;
    }
}

// Handle text messages with quick replies
async function handleTextMessage(senderId, text) {
    if (text.toLowerCase().includes('menu')) {
        await sendQuickReplies(senderId);
    } else {
        await sendTextMessage(senderId, `Echo: ${text}`);
    }
}

// Send quick replies
async function sendQuickReplies(recipientId) {
    try {
        await axios.post(`${INSTAGRAM_API}/me/messages`, {
            recipient: { id: recipientId },
            message: {
                text: "How can I help you?",
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
                        content_type: "text",
                        title: "Support",
                        payload: "SUPPORT"
                    }
                ]
            }
        }, {
            params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN }
        });
    } catch (error) {
        console.error('Error sending quick replies:', error);
        throw error;
    }
}

// Handle story replies
async function handleStoryReply(senderId, storyReply) {
    await sendTextMessage(
        senderId,
        "Thanks for replying to our story! How can we help you?"
    );
}

// Handle reactions
async function handleReaction(senderId, reaction) {
    await sendTextMessage(
        senderId,
        `Thanks for your ${reaction.emoji} reaction!`
    );
}

// Handle attachments (images, videos, etc.)
async function handleAttachments(senderId, attachments) {
    for (const attachment of attachments) {
        switch (attachment.type) {
            case 'image':
                await sendTextMessage(senderId, "Thanks for sharing the image!");
                break;
            case 'video':
                await sendTextMessage(senderId, "Thanks for sharing the video!");
                break;
            case 'audio':
                await sendTextMessage(senderId, "Thanks for sharing the audio!");
                break;
            default:
                await sendTextMessage(senderId, "Thanks for sharing!");
        }
    }
}

module.exports = router; 