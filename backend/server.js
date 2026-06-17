const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// 🛡️ Middleware
app.use(cors()); // Allow frontend to request data
app.use(express.json()); // Allow server to read JSON bodies

// 📂 Data Path
const plotsFilePath = path.join(__dirname, 'data', 'plots.json');

// 📡 API ENDPOINT 1: GET ALL PLOTS
app.get('/api/plots', (req, res) => {
    fs.readFile(plotsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(JSON.parse(data));
    });
});

// 🟢 Start the Engine
app.listen(PORT, () => {
    console.log(`🚀 Society Backend Engine running on http://localhost:${PORT}`);
    console.log(`📡 Plot API Endpoint active at http://localhost:${PORT}/api/plots`);
});