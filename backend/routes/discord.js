const express = require('express');
const router = express.Router();
const { Client, GatewayIntentBits, MessageActionRow, MessageButton } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Discord bot setup
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Handle messages
client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    try {
        if (message.content.startsWith('!')) {
            await handleCommand(message);
        } else {
            await handleMessage(message);
        }
    } catch (error) {
        console.error('Discord message handling error:', error);
    }
});

// Handle commands
async function handleCommand(message) {
    const command = message.content.slice(1).toLowerCase();

    switch (command) {
        case 'help':
            await sendHelpMessage(message);
            break;
        case 'menu':
            await sendMenu(message);
            break;
        case 'products':
            await sendProducts(message);
            break;
        default:
            await message.reply('Unknown command. Type !help for available commands.');
    }
}

// Handle regular messages
async function handleMessage(message) {
    const content = message.content.toLowerCase();

    if (content.includes('menu')) {
        await sendMenu(message);
    } else {
        await message.reply(`Echo: ${message.content}`);
    }
}

// Send help message
async function sendHelpMessage(message) {
    const helpEmbed = {
        color: 0x0099ff,
        title: 'Bot Commands',
        description: 'Here are the available commands:',
        fields: [
            { name: '!help', value: 'Show this help message' },
            { name: '!menu', value: 'Show the main menu' },
            { name: '!products', value: 'Show our products' }
        ]
    };

    await message.reply({ embeds: [helpEmbed] });
}

// Send menu with buttons
async function sendMenu(message) {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('products')
                .setLabel('Products')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('services')
                .setLabel('Services')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('support')
                .setLabel('Support')
                .setStyle('SECONDARY')
        );

    await message.reply({
        content: 'Please select an option:',
        components: [row]
    });
}

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    try {
        switch (interaction.customId) {
            case 'products':
                await interaction.reply('Here are our products...');
                break;
            case 'services':
                await interaction.reply('Here are our services...');
                break;
            case 'support':
                await interaction.reply('Contact our support team at support@skytells.com');
                break;
        }
    } catch (error) {
        console.error('Button interaction error:', error);
        await interaction.reply('There was an error processing your request.');
    }
});

// Login bot
client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = router; 