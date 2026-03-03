const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' folder

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ngl_clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Database Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    uniqueId: { type: String, required: true } // This is the link part
});

const MessageSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// API Routes

// 1. Create a User (Generate Link)
app.post('/api/create-user', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    // Generate a random unique ID (e.g., 8 characters)
    const uniqueId = Math.random().toString(36).substring(2, 10);

    try {
        const user = new User({ username, uniqueId });
        await user.save();
        res.json({ success: true, uniqueId: uniqueId });
    } catch (err) {
        res.status(500).json({ error: "Username taken or server error" });
    }
});

// 2. Submit a Message
app.post('/api/submit-message', async (req, res) => {
    const { uniqueId, content } = req.body;
    if (!uniqueId || !content) return res.status(400).json({ error: "Missing data" });

    try {
        const message = new Message({ uniqueId, content });
        await message.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to save message" });
    }
});

// 3. Get Messages for a User
app.get('/api/get-messages/:uniqueId', async (req, res) => {
    const { uniqueId } = req.params;
    try {
        const messages = await Message.find({ uniqueId }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});