import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // 🧠 GLOBAL STATE
    const [plotDatabase, setPlotDatabase] = useState([]);
    const [isDbLoaded, setIsDbLoaded] = useState(false);
    const [targetLocation, setTargetLocation] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [language, setLanguage] = useState('en');
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    // 🔐 AUTH STATE
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userPlotId, setUserPlotId] = useState(null);

    useEffect(() => {
        // 1. Restore Auth Session on Refresh
        const token = localStorage.getItem('society_token');
        if (token) {
            setIsLoggedIn(true);
            setUserRole(localStorage.getItem('society_role'));
            setUserPlotId(localStorage.getItem('society_plot'));
        }

        // 2. Fetch Database from Express
        const fetchPlots = async () => {
            try {
                console.log("📡 Fetching plots from backend...");
                const res = await fetch('http://localhost:5000/api/plots');
                const data = await res.json();
                
                console.log("📦 Backend Response Data:", data);

                if (Array.isArray(data)) {
                    setPlotDatabase(data);
                } else {
                    console.error("❌ CRITICAL: Backend did not return an array!", data);
                    setPlotDatabase([]);
                }
            } catch (err) {
                console.error("❌ CRITICAL: API Connection Failed.", err);
                setPlotDatabase([]);
            } finally {
                setIsDbLoaded(true); // Always hide the splash screen
            }
        };

        fetchPlots();
    }, []);

    return (
        <AppContext.Provider value={{
            plotDatabase, setPlotDatabase, isDbLoaded, setIsDbLoaded,
            targetLocation, setTargetLocation,
            isNavigating, setIsNavigating,
            language, setLanguage,
            voiceEnabled, setVoiceEnabled,
            isLoggedIn, setIsLoggedIn,
            userRole, setUserRole,
            userPlotId, setUserPlotId
        }}>
            {children}
        </AppContext.Provider>
    );
};