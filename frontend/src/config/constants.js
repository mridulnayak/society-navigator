// ===================================================
//  UV TECH SOLUTIONS - DYNAMIC SAAS CONFIGURATION
// ===================================================

export const CLIENT_CONFIG = {
    APP_NAME: import.meta.env.VITE_APP_CLIENT_NAME || "SOCIETY NAVIGATOR",
    SOCIETY_NAME: import.meta.env.VITE_APP_SOCIETY_NAME || "Our Society",
    MAP_CENTER: [
        parseFloat(import.meta.env.VITE_MAP_LAT) || 20.0, 
        parseFloat(import.meta.env.VITE_MAP_LNG) || 80.0
    ],
    DEFAULT_ZOOM: parseInt(import.meta.env.VITE_MAP_ZOOM) || 16
};

// 📡 NETWORK & SYSTEM CONSTANTS
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const ARRIVAL_RADIUS_METERS = 15; 

// 🗺️ ENGINE MAPPINGS
export const DHEBAR_CENTER = CLIENT_CONFIG.MAP_CENTER;

// 🚦 STATIC NAVIGATION NODES (Dynamically calculated based on the center point)
export const MAIN_GATE = { 
    id: "MAIN GATE", 
    name: `${CLIENT_CONFIG.SOCIETY_NAME} Exit`, 
    // Defaults to slightly offsetting the main map center for the gate
    lat: CLIENT_CONFIG.MAP_CENTER[0] - 0.000039, 
    lng: CLIENT_CONFIG.MAP_CENTER[1] + 0.000078 
};