import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from './context/AppContext'; 
import { T } from './utils/translations';

// 🏗️ ENTERPRISE IMPORTS (Components)
import BulkUploadModal from './features/admin/components/BulkUploadModal';
import LoginModal from './features/auth/components/LoginModal';
import AddPlotModal from './features/admin/components/AddPlotModal';
import SearchDashboard from './features/visitor/components/SearchDashboard';
import MapCanvas from './features/map/components/MapCanvas';

// 🏗️ ENTERPRISE IMPORTS (Hooks & Config)
import { MAIN_GATE } from './config/constants';
import { useGPS } from './features/map/hooks/useGPS';

export default function App() {
  // 🧠 GLOBAL STATE
  const {
    plotDatabase, setPlotDatabase, isDbLoaded,
    targetLocation, setTargetLocation,
    isNavigating, setIsNavigating,
    language, setLanguage,
    voiceEnabled, setVoiceEnabled,
    isLoggedIn, setIsLoggedIn,
    userRole, setUserRole,
    userPlotId, setUserPlotId
  } = useContext(AppContext);

  // 🗄️ LOCAL UI STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [newPlotCoords, setNewPlotCoords] = useState(null);
  const [newPlotId, setNewPlotId] = useState('');
  const [newPlotName, setNewPlotName] = useState('');
  const [editHouseName, setEditHouseName] = useState('');

  // 🗣️ VOICE ASSISTANT
  const speak = (textKey, variables = "") => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); 
    
    const translatedText = T[language][textKey] + " " + variables;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'; 
    window.speechSynthesis.speak(utterance);
  };

  // 🛰️ CUSTOM HOOK
  const { userLocation, distanceRemaining, gpsStatus } = useGPS(isNavigating, targetLocation, speak);

  // 🌐 DIGITAL GATEPASS LINK PARSER
  useEffect(() => {
    if (isDbLoaded && plotDatabase.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const requestedPlot = params.get('plot');
      if (requestedPlot) {
        const found = plotDatabase.find(p => p.id.toUpperCase() === requestedPlot.toUpperCase());
        if (found) {
          setTargetLocation(found); 
          setSearchQuery(found.id); 
          setIsNavigating(true); 
        } else {
          alert("Invalid Gatepass Link.");
        }
      }
    }
  }, [isDbLoaded, plotDatabase, setTargetLocation, setIsNavigating]);

  // 🔐 AUTH METHODS
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:5000/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginUser, password: loginPass })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('society_token', data.token); 
            localStorage.setItem('society_role', data.role); 
            localStorage.setItem('society_plot', data.plotId || '');
            
            setIsLoggedIn(true); 
            setUserRole(data.role); 
            setUserPlotId(data.plotId); 
            
            setShowLoginModal(false); setLoginError(''); setLoginUser(''); setLoginPass('');
            
            if (data.role === 'resident') {
                const myPlot = plotDatabase.find(p => p.id === data.plotId);
                if (myPlot) setEditHouseName(myPlot.name);
            }
        } else setLoginError(data.message);
    } catch (err) { setLoginError('Server error.'); }
  };

  const handleLogout = () => { 
    localStorage.clear(); 
    setIsLoggedIn(false); setUserRole(null); setUserPlotId(null); 
    setNewPlotCoords(null); 
  };

  // ✍️ DB WRITE METHODS
  const handleSaveNewPlot = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch('http://localhost:5000/api/plots', {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('society_token')}` },
              body: JSON.stringify({ id: newPlotId.toUpperCase(), name: newPlotName, lat: newPlotCoords.lat, lng: newPlotCoords.lng })
          });
          const data = await res.json();
          if (data.success) {
              setPlotDatabase([...plotDatabase, data.plot]); 
              setNewPlotCoords(null); setNewPlotId(''); setNewPlotName(''); 
              speak('speechPlotAdded');
          } else alert(data.error || "Failed to save plot.");
      } catch (err) { alert("Server connection failed."); }
  };

  const handleUpdateHouseName = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch(`http://localhost:5000/api/plots/${userPlotId}`, {
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('society_token')}` },
              body: JSON.stringify({ name: editHouseName })
          });
          const data = await res.json();
          if (data.success) {
              setPlotDatabase(plotDatabase.map(p => p.id === userPlotId ? { ...p, name: editHouseName } : p));
              alert("House name updated!");
          } else alert(data.error || "Failed to update.");
      } catch (err) { alert("Server connection failed."); }
  };

  // 🕹️ UI HANDLERS
  const handleRouteToExit = () => { 
    setTargetLocation(MAIN_GATE); 
    setSearchQuery(MAIN_GATE.id); 
    setIsNavigating(true); 
    speak("speechExit"); 
  };

  const handleCopyLink = () => { 
    navigator.clipboard.writeText(`${window.location.origin}/?plot=${targetLocation?.id}`); 
    alert(`Link Copied!`); 
  };

  const handleSelectSuggestion = (plot) => { 
    setSearchQuery(plot.id); 
    setTargetLocation(plot); 
    setSuggestions([]); 
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchQuery(value);
    if (isNavigating) setIsNavigating(false); 
    if (value.trim() === '') { setSuggestions([]); setTargetLocation(null); return; }
    setSuggestions(plotDatabase.filter(plot => plot.id.includes(value)));
  };

  // 🎨 RENDER UI
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      {showLoginModal && !isLoggedIn && (
        <LoginModal 
            handleLogin={handleLogin} 
            loginUser={loginUser} setLoginUser={setLoginUser} 
            loginPass={loginPass} setLoginPass={setLoginPass} 
            loginError={loginError} setShowLoginModal={setShowLoginModal} 
        />
      )}

      {newPlotCoords && isLoggedIn && userRole === 'admin' && (
        <AddPlotModal 
            handleSaveNewPlot={handleSaveNewPlot} 
            newPlotCoords={newPlotCoords} setNewPlotCoords={setNewPlotCoords} 
            newPlotId={newPlotId} setNewPlotId={setNewPlotId} 
            newPlotName={newPlotName} setNewPlotName={setNewPlotName} 
        />
      )}

      {/* 📤 RENDER THE NEW BULK UPLOAD MODAL */}
      {showBulkUpload && isLoggedIn && userRole === 'admin' && (
        <BulkUploadModal 
            setShowBulkUpload={setShowBulkUpload} 
            setPlotDatabase={setPlotDatabase} 
            plotDatabase={plotDatabase} 
        />
      )}

      <SearchDashboard 
          language={language} setLanguage={setLanguage}
          isDbLoaded={isDbLoaded} isLoggedIn={isLoggedIn} userRole={userRole} userPlotId={userPlotId}
          voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled}
          handleLogout={handleLogout} setShowLoginModal={setShowLoginModal} 
          setShowBulkUpload={setShowBulkUpload} // 🌐 PASSED DOWN PROPS HERE
          handleUpdateHouseName={handleUpdateHouseName} editHouseName={editHouseName} setEditHouseName={setEditHouseName}
          searchQuery={searchQuery} handleInputChange={handleInputChange} targetLocation={targetLocation}
          isNavigating={isNavigating} setIsNavigating={setIsNavigating} setTargetLocation={setTargetLocation} setSearchQuery={setSearchQuery}
          handleCopyLink={handleCopyLink} gpsStatus={gpsStatus} distanceRemaining={distanceRemaining} handleRouteToExit={handleRouteToExit}
          suggestions={suggestions} handleSelectSuggestion={handleSelectSuggestion}
      />

      <MapCanvas 
          isLoggedIn={isLoggedIn} userRole={userRole} setNewPlotCoords={setNewPlotCoords}
          plotDatabase={plotDatabase} targetLocation={targetLocation} userLocation={userLocation}
          isNavigating={isNavigating} speak={speak}
      />
      
    </div>
  );
}