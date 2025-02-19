const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Import routes
const facebookRoutes = require('./routes/facebook');
const instagramRoutes = require('./routes/instagram');
const whatsappRoutes = require('./routes/whatsapp');
const telegramRoutes = require('./routes/telegram');
const tiktokRoutes = require('./routes/tiktok');
const aiRoutes = require('./routes/ai');

// Use routes
app.use('/api/facebook', facebookRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/tiktok', tiktokRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('Chatbot API Running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 