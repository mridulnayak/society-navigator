const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = "DHEBAR_CITY_SUPER_SECRET_KEY";

const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "password123"
};

app.use(cors()); 
app.use(express.json()); 

const plotsFilePath = path.join(__dirname, 'data', 'plots.json');

// 🔒 SECURITY MIDDLEWARE: Checks if the user is a real Admin
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or expired token." });
        req.user = user;
        next(); // Token is good, proceed to the route!
    });
};

// 📡 API 1: GET ALL PLOTS (Public)
app.get('/api/plots', (req, res) => {
    fs.readFile(plotsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(JSON.parse(data));
    });
});

// 🔐 API 2: ADMIN LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ success: true, token: token });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// ✍️ API 3: ADD NEW PLOT (Secured by Token)
app.post('/api/plots', authenticateToken, (req, res) => {
    const newPlot = req.body;

    fs.readFile(plotsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Database read error" });
        
        let plots = JSON.parse(data);
        plots.push(newPlot); // Add the new plot to the array

        // Write the new array back to the JSON file permanently
        fs.writeFile(plotsFilePath, JSON.stringify(plots, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ error: "Database write error" });
            res.status(201).json({ success: true, message: "Plot added successfully!", plot: newPlot });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Secure Society Backend running on http://localhost:${PORT}`);
});