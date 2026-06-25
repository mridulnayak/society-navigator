import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from './context/AppContext'; 
import { T } from './utils/translations';
import { Map } from 'lucide-react'; 

// 🏗️ ENTERPRISE IMPORTS (Components)
import BulkUploadModal from './features/admin/components/BulkUploadModal';
import LoginModal from './features/auth/components/LoginModal';
import SearchDashboard from './features/visitor/components/SearchDashboard';
import MapCanvas from './features/map/components/MapCanvas';
import ProvisionUserModal from './features/admin/components/ProvisionUserModal';
import ResidentDirectoryModal from './features/admin/components/ResidentDirectoryModal';

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
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
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
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'x-tenant-id': import.meta.env.VITE_TENANT_ID // ⬅️ NEW NAMETAG
            },
            body: JSON.stringify({ email: loginUser, password: loginPass })
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
  };

  // ✍️ DB WRITE METHODS
  const handleUpdateHouseName = async (e) => {
      e.preventDefault();
try {
          const res = await fetch(`http://localhost:5000/api/plots/${userPlotId}`, {
              method: 'PUT', 
              headers: { 
                  'Content-Type': 'application/json', 
                  'x-tenant-id': import.meta.env.VITE_TENANT_ID, // ⬅️ NEW NAMETAG
                  'Authorization': `Bearer ${localStorage.getItem('society_token')}` 
              },
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

      {/* 📤 RENDER THE BULK UPLOAD MODAL */}
      {showBulkUpload && isLoggedIn && userRole === 'admin' && (
        <BulkUploadModal 
            setShowBulkUpload={setShowBulkUpload} 
            setPlotDatabase={setPlotDatabase} 
            plotDatabase={plotDatabase} 
        />
      )}

      {/* ➕ ADD THIS RIGHT HERE: THE NEW PROVISION MODAL */}
      {showProvisionModal && isLoggedIn && userRole === 'admin' && (
        <ProvisionUserModal 
            setShowProvisionModal={setShowProvisionModal} 
            plotDatabase={plotDatabase} 
        />
      )}

      {/* 🗄️ NEW DIRECTORY MODAL */}
      {showDirectoryModal && isLoggedIn && userRole === 'admin' && (
        <ResidentDirectoryModal 
            setShowDirectoryModal={setShowDirectoryModal} 
        />
      )}

      {/* 🎛️ UPDATE THIS COMPONENT: SEARCH DASHBOARD */}
      <SearchDashboard 
          language={language} setLanguage={setLanguage}
          isDbLoaded={isDbLoaded} isLoggedIn={isLoggedIn} userRole={userRole} userPlotId={userPlotId}
          voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled}
          handleLogout={handleLogout} setShowLoginModal={setShowLoginModal} 
          setShowBulkUpload={setShowBulkUpload} 
          setShowProvisionModal={setShowProvisionModal} 
          setShowDirectoryModal={setShowDirectoryModal}
          handleUpdateHouseName={handleUpdateHouseName} editHouseName={editHouseName} setEditHouseName={setEditHouseName}
          searchQuery={searchQuery} handleInputChange={handleInputChange} targetLocation={targetLocation}
          isNavigating={isNavigating} setIsNavigating={setIsNavigating} setTargetLocation={setTargetLocation} setSearchQuery={setSearchQuery}
          handleCopyLink={handleCopyLink} gpsStatus={gpsStatus} distanceRemaining={distanceRemaining} handleRouteToExit={handleRouteToExit}
          suggestions={suggestions} handleSelectSuggestion={handleSelectSuggestion}
      />

      <MapCanvas 
          isLoggedIn={isLoggedIn} userRole={userRole}
          plotDatabase={plotDatabase} targetLocation={targetLocation} userLocation={userLocation}
          isNavigating={isNavigating} speak={speak}
      />
      
    </div>
  );
}