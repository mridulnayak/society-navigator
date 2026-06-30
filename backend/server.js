require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// 🧠 TENANT CACHE (Prevents memory leaks by reusing database connections)
const tenantClients = {};

// 🚦 MULTI-TENANT GATEWAY ROUTER
const getTenantDb = (tenantId) => {
    // Return cached connection if it already exists
    if (tenantClients[tenantId]) return tenantClients[tenantId];

    // Create new connection if it's the first time this client is requesting
    if (tenantId === 'dhebar') {
        tenantClients['dhebar'] = createClient(
            process.env.DHEBAR_SUPABASE_URL, 
            process.env.DHEBAR_SUPABASE_SERVICE_KEY, 
            { auth: { persistSession: false }, realtime: { transport: WebSocket } }
        );
        return tenantClients['dhebar'];
    }
    
    if (tenantId === 'migsejbahar') {
        tenantClients['migsejbahar'] = createClient(
            process.env.MIGSEJBAHAR_SUPABASE_URL, 
            process.env.MIGSEJBAHAR_SUPABASE_SERVICE_KEY, 
            { auth: { persistSession: false }, realtime: { transport: WebSocket } }
        );
        return tenantClients['migsejbahar'];
    }
    // same if() block and return for new client
//     if (tenantId === 'gokuldham') {
//     tenantClients['gokuldham'] = createClient(process.env.GOKULDHAM_SUPABASE_URL, process.env.GOKULDHAM_SUPABASE_SERVICE_KEY, { auth: { persistSession: false }});
//     return tenantClients['gokuldham'];
// }
    throw new Error("Security Alert: Unrecognized Tenant ID");
};

// 🛡️ INJECT DATABASE INTO EVERY REQUEST
app.use((req, res, next) => {
    try {
        // Read the nametag from the frontend request header (default to dhebar for fallback safety)
        const tenantId = req.headers['x-tenant-id'] || 'dhebar'; 
        
        // Attach the specific client's database directly to this exact API request
        req.supabase = getTenantDb(tenantId.toLowerCase());
        next();
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// 🔒 SECURITY MIDDLEWARE (Verifies tokens dynamically for the specific tenant)
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

        // Ask the TENANT'S Supabase to decrypt and validate the token
        const { data: { user }, error } = await req.supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(403).json({ error: "Invalid or expired session token." });
        }

        // Hydrate request object with secure metadata
        req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'visitor',
            plotId: user.user_metadata?.plotId || null
        };
        next();
    } catch (err) {
        res.status(500).json({ error: "Authentication system failure." });
    }
};

// 🔐 API: SECURE CLOUD LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body; 

        // Uses the injected tenant database
        const { data, error } = await req.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            return res.status(401).json({ success: false, message: error.message });
        }

        res.json({
            success: true,
            token: data.session.access_token,
            role: data.user.user_metadata?.role || 'visitor',
            plotId: data.user.user_metadata?.plotId || ''
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server login processing error." });
    }
});

// 👤 API: PROVISION NEW USER ACCOUNTS (ADMIN ONLY)
app.post('/api/users/create', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Only Admins can provision accounts." });

        const { email, password, role, plotId } = req.body;
        if (!email || !password || !role) return res.status(400).json({ error: "Missing required profile fields." });

        const { data, error } = await req.supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { role, plotId: plotId || '' }
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ success: true, message: `Secure account created for ${email}!`, user: data.user });
    } catch (err) {
        res.status(500).json({ error: "Failed to provision new user account." });
    }
});

// 📋 API: GET ALL RESIDENT ACCOUNTS (ADMIN ONLY)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Only Admins can view the directory." });

        const { data, error } = await req.supabase.auth.admin.listUsers();
        if (error) return res.status(400).json({ error: error.message });

        const safeUsers = data.users
            .filter(u => u.user_metadata?.role === 'resident') 
            .map(user => ({
                id: user.id,
                email: user.email,
                plotId: user.user_metadata?.plotId || 'Unassigned',
                createdAt: user.created_at
            }));

        res.status(200).json({ success: true, users: safeUsers });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user directory." });
    }
});

// 🗑️ API: REVOKE ACCESS / DELETE RESIDENT (ADMIN ONLY)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Only Admins can delete accounts." });
        
        const targetUserId = req.params.id;
        const { error } = await req.supabase.auth.admin.deleteUser(targetUserId);
        
        if (error) return res.status(400).json({ error: error.message });
        
        res.status(200).json({ success: true, message: "Resident access permanently revoked." });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user account." });
    }
});

// 📡 API: GET ALL PLOTS
app.get('/api/plots', async (req, res) => {
    const { data, error } = await req.supabase.from('plots').select('*');
    if (error) return res.status(500).json({ error: "Supabase Error" });
    res.json(data);
});

// ✍️ API: ADD NEW PLOT (ADMIN ONLY)
app.post('/api/plots', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Only Admins can add plots." });

    const { data, error } = await req.supabase
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
        if (!plotsArray || plotsArray.length === 0) return res.status(400).json({ error: "CSV data array is empty." });

        const { data, error } = await req.supabase
            .from('plots')
            .insert(plotsArray)
            .select();

        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: "CSV contains duplicate Plot IDs!" });
            return res.status(500).json({ error: "Supabase rejected the collection array." });
        }
        
        res.status(201).json({ success: true, message: `${data.length} plots added instantly!`, plots: data });
    } catch (err) {
        res.status(500).json({ error: "Fatal server error during processing upload." });
    }
});

// 🏠 API: RENAME EXISTING PLOT
app.put('/api/plots/:id', authenticateToken, async (req, res) => {
    const targetPlotId = req.params.id;
    const { name } = req.body;

    if (req.user.role === 'resident' && req.user.plotId !== targetPlotId) {
        return res.status(403).json({ error: "Security Violation: Access denied to target property." });
    }

    const { data, error } = await req.supabase
        .from('plots')
        .update({ name: name })
        .eq('id', targetPlotId)
        .select();

    if (error || data.length === 0) return res.status(404).json({ error: "Plot record completely missing or database rejected update." });
    
    res.json({ success: true, message: "House name updated successfully!", plot: data[0] });
});

app.listen(PORT, () => { console.log(`🚀 Supabase Backend running on port ${PORT}`); });