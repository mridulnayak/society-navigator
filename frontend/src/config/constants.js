// Centralized configuration for the entire application

// API Endpoints (Easy to switch to production URLs later)
export const API_BASE_URL = 'http://localhost:5000/api';

// Map & GPS Constants
export const DHEBAR_CENTER = [21.2106, 81.6255]; 
export const DEFAULT_ZOOM = 16;
export const ARRIVAL_RADIUS_METERS = 15; // Distance to trigger "Arrived" state

// Static Navigation Nodes
export const MAIN_GATE = { 
    id: "MAIN GATE", 
    name: "Society Exit", 
    lat: 21.210561, 
    lng: 81.625578 
};