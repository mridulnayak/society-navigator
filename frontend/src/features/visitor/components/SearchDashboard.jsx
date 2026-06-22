import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { Search, MapPin, Route, Compass, Volume2, VolumeX, Lock, Unlock, Home, Share2, LogOut, Languages, Send, Users } from 'lucide-react';
import { T } from '../../../utils/translations'; 

export default function SearchDashboard({
  isDbLoaded, isLoggedIn, userRole, userPlotId,
  voiceEnabled, setVoiceEnabled,
  language, setLanguage, 
  handleLogout, setShowLoginModal, setShowBulkUpload,
  setShowProvisionModal, setShowDirectoryModal,
  handleUpdateHouseName, editHouseName, setEditHouseName,
  searchQuery, handleInputChange, targetLocation,
  isNavigating, setIsNavigating, setTargetLocation, setSearchQuery,
  handleCopyLink, gpsStatus, distanceRemaining, handleRouteToExit,
  suggestions, handleSelectSuggestion
}) {
  
  const text = T[language]; 
  const [deferredPrompt, setDeferredPrompt] = useState(null); // Added for PWA

  // PWA INSTALL LOGIC
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') setDeferredPrompt(null);
      });
    }
  };

  // 📲 WHATSAPP GATEPASS GENERATOR
  const handleShareGatepass = () => {
    const baseUrl = window.location.origin;
    const gatepassLink = `${baseUrl}/?plot=${userPlotId}`;
    const houseName = editHouseName ? editHouseName : `Plot ${userPlotId}`;
    const message = `\u{1F44B} You are invited to ${houseName}!\n\n\u{1F4CD} Click this link for live GPS navigation straight to our door inside the society:\n${gatepassLink}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-full sm:max-w-md z-[9999] flex flex-col gap-1.5 pointer-events-none">
      <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-slate-700">
        
        {/* HEADER & CONTROLS */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className={`w-5 h-5 ${isDbLoaded ? 'text-blue-500' : 'text-slate-600'} animate-pulse`} />
            <h1 className="text-xs font-black text-white tracking-widest uppercase">{text.title}</h1>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="p-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1">
                <Languages className="w-4 h-4" />
                <span className="text-[9px] font-black">{language.toUpperCase()}</span>
            </button>

            {isLoggedIn ? (
                <button type="button" onClick={handleLogout} className={`p-1.5 rounded-full transition-all group ${userRole === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}><Unlock className="w-4 h-4 group-hover:hidden" /><Lock className="w-4 h-4 hidden group-hover:block text-red-400" /></button>
            ) : ( <button type="button" onClick={() => setShowLoginModal(true)} className="p-1.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"><Lock className="w-4 h-4" /></button> )}
            
            <button type="button" onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-1.5 rounded-full transition-colors ${voiceEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>{voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
          </div>
        </div>

        {/* 📱 PWA INSTALL BUTTON (Visible only when browser allows installation) */}
        {deferredPrompt && (
          <button onClick={handleInstall} className="w-full mb-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black tracking-widest uppercase transition-all">
            Install App
          </button>
        )}

        {/* ROLE-BASED BANNERS ... */}
        {isLoggedIn && userRole === 'admin' && (
            <div className="flex flex-col gap-2 mb-3">
                <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg py-1.5 flex items-center justify-center animate-pulse">
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest">{text.adminBanner}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 w-full">
                    <button type="button" onClick={() => setShowBulkUpload(true)} className="bg-blue-500/10 border border-blue-500/30 rounded-lg py-2 text-xs font-black text-blue-400 tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2">
                        📤 UPLOAD CSV
                    </button>
                    <button type="button" onClick={() => setShowProvisionModal(true)} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg py-2 text-xs font-black text-emerald-400 tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                        ➕ ADD RESIDENT
                    </button>
                    <button type="button" onClick={() => setShowDirectoryModal(true)} className="col-span-2 bg-purple-500/10 border border-purple-500/30 rounded-lg py-2.5 text-xs font-black text-purple-400 tracking-widest hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> RESIDENT DIRECTORY
                    </button>
                </div>
            </div>
        )}

        {/* ... (Keep your existing RESIDENT PORTAL, SEARCH BAR, and SUGGESTIONS code below) ... */}
        {isLoggedIn && userRole === 'resident' && (
            <div className="flex flex-col gap-2 mb-3">
                <form onSubmit={handleUpdateHouseName} className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2"><Home className="w-4 h-4 text-blue-400" /><span className="text-[10px] font-black text-blue-400 tracking-widest">{text.editResidence} {userPlotId}</span></div>
                    <div className="flex gap-2">
                        <input type="text" value={editHouseName} onChange={(e) => setEditHouseName(e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-950 text-white rounded-lg border border-slate-700 focus:outline-none text-xs" />
                        <button type="submit" className="px-3 py-1.5 rounded-lg font-bold text-[10px] text-white bg-blue-600 hover:bg-blue-500">{text.save}</button>
                    </div>
                </form>
                <button type="button" onClick={handleShareGatepass} className="w-full py-2.5 rounded-lg font-black text-xs tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> SHARE DIGITAL GATEPASS
                </button>
            </div>
        )}

        <div className="relative flex items-center w-full">
            <Search className="absolute left-3 text-slate-500 w-4 h-4" />
            <input type="text" placeholder={text.searchTarget} disabled={!isDbLoaded} value={searchQuery} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-950 text-white font-bold tracking-wider rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 transition-all text-sm uppercase placeholder:text-slate-600 shadow-inner disabled:opacity-50" />
        </div>

        {targetLocation && (
          <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                  <button type="button" onClick={() => { if (isNavigating) { setIsNavigating(false); setTargetLocation(null); setSearchQuery(''); } else setIsNavigating(true); }} className={`flex-1 py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${isNavigating ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}><Route className="w-4 h-4" /> {isNavigating ? text.endRoute : text.startRoute}</button>
                  <button type="button" onClick={handleCopyLink} className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 transition-all flex items-center justify-center"><Share2 className="w-4 h-4" /></button>
              </div>
              {isNavigating && (<div className="flex items-center justify-between px-2"><span className="text-[10px] font-bold text-slate-400">{gpsStatus}</span>{distanceRemaining !== null && <span className="text-[10px] font-black text-green-400">{distanceRemaining}{text.away}</span>}</div>)}
          </div>
        )}
        {isNavigating && targetLocation?.id !== "MAIN GATE" && ( <button type="button" onClick={handleRouteToExit} className="w-full mt-2 py-2.5 rounded-xl font-black text-xs tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> {text.takeExit}</button> )}
      </div>

      {suggestions.length > 0 && (
        <ul className="pointer-events-auto bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 max-h-48 overflow-y-auto divide-y divide-slate-800">
          {suggestions.map((plot) => (
            <li key={plot.id}><button type="button" onClick={() => handleSelectSuggestion(plot)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-all text-slate-300 font-semibold text-xs tracking-wide"><MapPin className="w-4 h-4 text-blue-500 shrink-0" /><div><span className="font-bold text-white block tracking-wider">{plot.id}</span><span className="text-[10px] text-slate-500">{plot.name}</span></div></button></li>
          ))}
        </ul>
      )}
    </div>
  );
}