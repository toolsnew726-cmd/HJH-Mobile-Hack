// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date() });
});

// Generate APK route
app.post('/api/generate-hidden-apk', (req, res) => {
    const config = req.body;
    
    // Simple response for testing
    res.json({
        success: true,
        download_url: 'https://example.com/test.apk',
        apk_id: 'test_' + Date.now(),
        message: 'APK generation simulated for testing'
    });
});

// Receive data from device
app.post('/api/receive-data', (req, res) => {
    console.log('Data received:', req.body);
    res.json({ success: true, received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
