// ===================================================
// 🏢 UV TECH SOLUTIONS - MASTER SAAS CONTROL PANEL
// ===================================================

export const CLIENT_CONFIG = {
    APP_NAME: "DHEBAR NAVIGATOR",       // Renders in headers and browser titles
    SOCIETY_NAME: "Dhebar City",        // Spoken natively by the Voice Engine
    MAP_CENTER: [21.2106, 81.6255],     // Default Leaflet camera anchor coordinate
    DEFAULT_ZOOM: 16                    // Initial viewport scale factor
};

// 📡 NETWORK & SYSTEM CONSTANTS
export const API_BASE_URL = 'http://localhost:5000/api';
export const ARRIVAL_RADIUS_METERS = 15; // Proximity threshold triggering the "Arrived" state loop

// 🗺️ ENGINE MAPPINGS (Kept for seamless backwards compatibility with map rendering files)
export const DHEBAR_CENTER = CLIENT_CONFIG.MAP_CENTER;
export const DEFAULT_ZOOM = CLIENT_CONFIG.DEFAULT_ZOOM;

// 🚦 STATIC NAVIGATION NODES (Preserving your absolute high-precision pinpoint data)
export const MAIN_GATE = { 
    id: "MAIN GATE", 
    name: `${CLIENT_CONFIG.SOCIETY_NAME} Exit`, 
    lat: 21.210561, 
    lng: 81.625578 
};