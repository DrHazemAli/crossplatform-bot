const express = require('express');
const router = express.Router();
const axios = require('axios');

const TIKTOK_API = 'https://open-api.tiktok.com/v2';

// TikTok webhook verification
router.post('/webhook', async (req, res) => {
    try {
        const { body } = req;
        
        // Handle different event types
        switch (body.event) {
            case 'video.comment_create':
                await handleComment(body.data);
                break;
            case 'video.like':
                await handleLike(body.data);
                break;
            case 'video.share':
                await handleShare(body.data);
                break;
            default:
                console.log('Unhandled event type:', body.event);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('TikTok webhook error:', error);
        res.sendStatus(500);
    }
});

// Handle comments
async function handleComment(data) {
    const { comment_id, comment_text, user_id } = data;
    
    try {
        // Reply to comment
        await replyToComment(comment_id, `Thanks for your comment: ${comment_text}`);
    } catch (error) {
        console.error('Error handling comment:', error);
    }
}

// Handle likes
async function handleLike(data) {
    const { video_id, user_id } = data;
    // Log like event
    console.log(`Video ${video_id} liked by user ${user_id}`);
}

// Handle shares
async function handleShare(data) {
    const { video_id, user_id } = data;
    // Log share event
    console.log(`Video ${video_id} shared by user ${user_id}`);
}

// Reply to a comment
async function replyToComment(commentId, text) {
    try {
        await axios.post(`${TIKTOK_API}/comment/reply`, {
            comment_id: commentId,
            text: text
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`
            }
        });
    } catch (error) {
        console.error('Error replying to comment:', error);
        throw error;
    }
}

module.exports = router; 