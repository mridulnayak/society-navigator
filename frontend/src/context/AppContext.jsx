import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

// 1. Create the Context
export const AppContext = createContext();

// 2. Create the Provider
export const AppProvider = ({ children }) => {
  // Map Data
  const [plotDatabase, setPlotDatabase] = useState([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  
  // Navigation State
  const [targetLocation, setTargetLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Settings
  const [language, setLanguage] = useState('en');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Security State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userPlotId, setUserPlotId] = useState(null);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiClient('/plots');
        setPlotDatabase(data);
        setIsDbLoaded(true);
      } catch (err) {
        console.error("Database Error:", err);
      }
    };
    loadData();

    if (localStorage.getItem('society_token')) {
        setIsLoggedIn(true);
        setUserRole(localStorage.getItem('society_role'));
        setUserPlotId(localStorage.getItem('society_plot'));
    }
  }, []);

  return (
    <AppContext.Provider value={{
      plotDatabase, setPlotDatabase, isDbLoaded,
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