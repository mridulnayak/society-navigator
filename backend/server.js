require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws'); 

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: { persistSession: false }, 
        realtime: { transport: WebSocket } 
    }
);

// Middleware
app.use(cors()); 
app.use(express.json()); 

// 👮‍♂️ MULTI-TIER USER DATABASE
const USERS = [
    { username: "admin", password: "password123", role: "admin" },
    { username: "b1017", password: "res123", role: "resident", plotId: "B-10/17" }
];

// 🔒 SECURITY MIDDLEWARE
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access Denied." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token." });
        req.user = user;
        next();
    });
};

// 🔐 API: SMART LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
        const token = jwt.sign({ username: user.username, role: user.role, plotId: user.plotId }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ success: true, token: token, role: user.role, plotId: user.plotId });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// 📡 API: GET ALL PLOTS FROM SUPABASE
app.get('/api/plots', async (req, res) => {
    const { data, error } = await supabase.from('plots').select('*');
    if (error) return res.status(500).json({ error: "Supabase Error" });
    res.json(data);
});

// ✍️ API: ADD NEW PLOT (ADMIN ONLY)
app.post('/api/plots', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Only Admins can add plots." });

    const { data, error } = await supabase
        .from('plots')
        .insert([{ id: req.body.id, name: req.body.name, lat: req.body.lat, lng: req.body.lng }])
        .select();

    if (error) {
        if (error.code === '23505') return res.status(400).json({ error: "This Plot ID already exists!" });
        return res.status(500).json({ error: "Failed to save to Supabase." });
    }
    
    res.status(201).json({ success: true, message: "Plot added!", plot: data[0] });
});

// 🚀 API: BULK UPLOAD CSV DATA (ADMIN ONLY)
app.post('/api/plots/bulk', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Only Admins can upload CSVs." });

        const plotsArray = req.body.plots;
        if (!plotsArray || plotsArray.length === 0) return res.status(400).json({ error: "CSV is empty or unreadable." });

        const { data, error } = await supabase
            .from('plots')
            .insert(plotsArray)
            .select();

        if (error) {
            console.error("Supabase Error:", error); 
            if (error.code === '23505') return res.status(400).json({ error: "CSV contains Plot IDs that already exist!" });
            return res.status(500).json({ error: "Supabase rejected the data." });
        }
        
        res.status(201).json({ success: true, message: `${data.length} plots added instantly!`, plots: data });
    } catch (err) {
        console.error("Server Crash:", err);
        res.status(500).json({ error: "Fatal server error during upload." });
    }
});

// 🏠 API: RENAME EXISTING PLOT
app.put('/api/plots/:id', authenticateToken, async (req, res) => {
    const targetPlotId = req.params.id;
    const { name } = req.body;

    if (req.user.role === 'resident' && req.user.plotId !== targetPlotId) {
        return res.status(403).json({ error: "Security Alert: You can only edit your own property." });
    }

    const { data, error } = await supabase
        .from('plots')
        .update({ name: name })
        .eq('id', targetPlotId)
        .select();

    if (error || data.length === 0) return res.status(404).json({ error: "Plot not found or failed to update." });
    
    res.json({ success: true, message: "House name updated!", plot: data[0] });
});

app.listen(PORT, () => { console.log(`🚀 Supabase Backend running on port ${PORT}`); });