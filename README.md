# Multi-Platform Chatbot System
### A Product of DeepCoder by Skytells, Inc.

<p align="center">
  <img src="https://your-logo-url.com/logo.png" alt="DeepCoder Logo" width="200"/>
</p>

## Overview
A powerful, multi-platform chatbot system that integrates with major messaging platforms including Facebook Messenger, WhatsApp, Instagram, Telegram, TikTok, and Discord. Built with AI capabilities powered by OpenAI's GPT models.

## Features
- 🤖 **Multi-Platform Support**
  - Facebook Messenger ✅
  - WhatsApp Business API ✅
  - Instagram Direct Messages
  - Telegram Bot API ✅
  - TikTok Messaging
  - Discord Integration

- 🧠 **AI Integration**
  - OpenAI GPT Integration
  - Natural Language Processing
  - Context-Aware Responses
  - Multi-language Support

- 💬 **Rich Message Types**
  - Text Messages
  - Interactive Buttons
  - List Messages
  - Carousel/Generic Templates
  - Quick Replies
  - Location Sharing
  - Media Messages (Images, Videos, Documents)

- 🛠 **Advanced Features**
  - User Session Management
  - Analytics & Reporting
  - Custom Flow Builder
  - Webhook Management
  - Error Handling & Logging

## Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Platform API Keys:
  - Facebook Developer Account
  - WhatsApp Business API
  - Instagram Graph API
  - Telegram Bot Token
  - TikTok API Access
  - Discord Bot Token
  - OpenAI API Key

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/chatbot-platform.git
cd chatbot-platform
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if using the UI)
cd ../frontend
npm install
```

3. Configure environment variables
```bash
# Copy example env file
cp .env.example .env

# Add your API keys and credentials to .env
```

## Environment Variables
```env
MONGO_URI=your_mongodb_connection_string
FB_ACCESS_TOKEN=your_facebook_access_token
FB_VERIFY_TOKEN=your_webhook_verify_token
FB_APP_SECRET=your_app_secret
FB_PAGE_ID=your_page_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
DISCORD_BOT_TOKEN=your_discord_token
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

## Usage

### Starting the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### API Endpoints

#### Facebook Messenger
- `GET /api/facebook/webhook` - Webhook verification
- `POST /api/facebook/webhook` - Handle incoming messages

#### WhatsApp
- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/whatsapp/webhook` - Handle incoming messages

#### Instagram
- `GET /api/instagram/webhook` - Webhook verification
- `POST /api/instagram/webhook` - Handle incoming messages

#### Telegram
- `POST /api/telegram/webhook` - Handle incoming messages
- `POST /api/telegram/commands` - Handle bot commands

#### AI Integration
- `POST /api/ai/chat` - Generate AI responses

## Platform-Specific Features

### Facebook Messenger
- Button Templates
- Generic Templates
- Quick Replies
- Persistent Menu
- User Profile API

### WhatsApp
- Interactive Messages
- List Messages
- Button Messages
- Media Messages
- Location Sharing

### Telegram
- Custom Keyboards
- Inline Keyboards
- File Sharing
- Location Sharing
- Bot Commands

### Instagram
- Quick Replies
- Media Sharing
- Story Mentions
- Direct Messages


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About DeepCoder
DeepCoder is a product of Skytells, Inc., specializing in AI-powered development tools and solutions. Visit [Skytells Website](https://skytells.io) for more information.

## Support
For support, email support@skytells.com or join our [Discord Community](https://discord.gg/skytells).

---
© 2024 Skytells, Inc. All rights reserved.
