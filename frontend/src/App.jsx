import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Search, MapPin, Route, Activity, Compass, Volume2, VolumeX, Lock, Unlock, User, Key, PlusCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// 🔵 PULSING GPS DOT
const pulsingGpsIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

// 🚦 DYNAMIC ROUTING ENGINE
function DynamicRoutingMachine({ userLocation, targetLocation, speak }) {
  const map = useMap();
  useEffect(() => {
    if (!userLocation || !targetLocation) return;
    const routingControl = L.Routing.control({
      waypoints: [ L.latLng(userLocation.lat, userLocation.lng), L.latLng(targetLocation.lat, targetLocation.lng) ],
      routeWhileDragging: false, addWaypoints: false, show: false, 
      lineOptions: { styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }] },
      createMarker: () => null 
    }).addTo(map);
    routingControl.on('routesfound', () => { speak(`Route to ${targetLocation.id} calculated.`); });
    return () => map.removeControl(routingControl);
  }, [map, userLocation, targetLocation, speak]);
  return null;
}

// 🎥 LIVE CAMERA TRACKER
function LiveCameraTracker({ location }) {
  const map = useMap();
  useEffect(() => { if (location) map.flyTo(location, 18, { animate: true, duration: 1 }); }, [location, map]);
  return null;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [targetLocation, setTargetLocation] = useState(null);
  
  const [plotDatabase, setPlotDatabase] = useState([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("Waiting for GPS...");
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [newPlotCoords, setNewPlotCoords] = useState(null);
  const [newPlotId, setNewPlotId] = useState('');
  const [newPlotName, setNewPlotName] = useState('');

  const dhebarCenter = [21.2106, 81.6255]; 

  // 🌐 FETCH DATA
  useEffect(() => {
    fetch('http://localhost:5000/api/plots')
      .then(res => res.json())
      .then(data => { setPlotDatabase(data); setIsDbLoaded(true); })
      .catch(err => console.error("Backend Error:", err));
    
    if (localStorage.getItem('society_token')) setIsLoggedIn(true);
  }, []);

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; window.speechSynthesis.speak(utterance);
  };

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
            setIsLoggedIn(true); setShowLoginModal(false); setLoginError('');
        } else setLoginError(data.message);
    } catch (err) { setLoginError('Server error.'); }
  };

  const handleLogout = () => { localStorage.removeItem('society_token'); setIsLoggedIn(false); setNewPlotCoords(null); };

  // 📍 ADMIN MAP CLICK LISTENER
  function AdminMapClicker() {
    useMapEvents({
      click(e) { if (isLoggedIn) setNewPlotCoords({ lat: e.latlng.lat, lng: e.latlng.lng }); },
    });
    return null;
  }

  // ✍️ SAVE NEW PLOT
  const handleSaveNewPlot = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('society_token');
      const newPlotData = { id: newPlotId.toUpperCase(), name: newPlotName || `Plot ${newPlotId.toUpperCase()}`, lat: newPlotCoords.lat, lng: newPlotCoords.lng };

      try {
          const res = await fetch('http://localhost:5000/api/plots', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(newPlotData)
          });
          const data = await res.json();
          if (data.success) {
              setPlotDatabase([...plotDatabase, newPlotData]); 
              setNewPlotCoords(null); setNewPlotId(''); setNewPlotName('');
              speak(`New plot added.`);
          } else alert(data.error || "Failed to save plot.");
      } catch (err) { alert("Server connection failed."); }
  };

  // 🛰️ GPS ENGINE
  useEffect(() => {
    let watchId;
    if (isNavigating && targetLocation) {
      setHasArrived(false); setGpsStatus("Locating...");
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const currentLeafletLoc = L.latLng(position.coords.latitude, position.coords.longitude);
            setUserLocation(currentLeafletLoc); setGpsStatus("GPS Active");
            const dist = currentLeafletLoc.distanceTo(L.latLng(targetLocation.lat, targetLocation.lng)).toFixed(0);
            setDistanceRemaining(dist);
            
            if (dist < 15 && !hasArrived) {
              speak(`Arrived at ${targetLocation.id}.`); setHasArrived(true);
              setTimeout(() => { setIsNavigating(false); setTargetLocation(null); setSearchQuery(''); }, 5000);
            }
          },
          (error) => setGpsStatus("GPS Error - Check Permissions"), { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    } else { setUserLocation(null); setDistanceRemaining(null); setGpsStatus(""); }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [isNavigating, targetLocation, hasArrived]);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchQuery(value);
    if (isNavigating) { setIsNavigating(false); setUserLocation(null); setDistanceRemaining(null); }
    if (value.trim() === '') { setSuggestions([]); setTargetLocation(null); return; }
    setSuggestions(plotDatabase.filter(plot => plot.id.includes(value)));
  };

  const handleSelectSuggestion = (plot) => {
    setSearchQuery(plot.id);
    setTargetLocation(plot);
    setSuggestions([]); 
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* 🔐 LOGIN MODAL */}
      {showLoginModal && !isLoggedIn && (
        <div className="absolute inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
            <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4">
                <h2 className="text-white font-black tracking-widest text-center mb-2">ADMIN ACCESS</h2>
                {loginError && <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{loginError}</p>}
                <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required
                           className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none text-sm" />
                </div>
                <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required
                           className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none text-sm" />
                </div>
                <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors">CANCEL</button>
                    <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors">LOGIN</button>
                </div>
            </form>
        </div>
      )}

      {/* ✍️ NEW PLOT ENTRY MODAL */}
      {newPlotCoords && isLoggedIn && (
          <div className="absolute inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
              <form onSubmit={handleSaveNewPlot} className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2 justify-center">
                      <PlusCircle className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-white font-black tracking-widest text-center">ADD NEW PLOT</h2>
                  </div>
                  <p className="text-xs text-slate-400 text-center -mt-2 mb-2">Lat: {newPlotCoords.lat.toFixed(5)}, Lng: {newPlotCoords.lng.toFixed(5)}</p>
                  
                  <input type="text" placeholder="Plot Number (e.g. C-12/04)" value={newPlotId} onChange={(e) => setNewPlotId(e.target.value)} required
                         className="w-full px-4 py-2.5 bg-slate-950 text-white font-bold uppercase rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none text-sm" />
                  <input type="text" placeholder="Resident Name (Optional)" value={newPlotName} onChange={(e) => setNewPlotName(e.target.value)}
                         className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none text-sm" />
                  
                  <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => setNewPlotCoords(null)} className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors">CANCEL</button>
                      <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors">SAVE TO DB</button>
                  </div>
              </form>
          </div>
      )}

      {/* 🔍 CONTROL DASHBOARD (Wrapper has pointer-events-none, Cards have pointer-events-auto!) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-full sm:max-w-md z-[9999] flex flex-col gap-1.5 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-slate-700">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className={`w-5 h-5 ${isDbLoaded ? 'text-blue-500' : 'text-slate-600'} animate-pulse`} />
              <h1 className="text-xs font-black text-white tracking-widest uppercase">DHEBAR NAVIGATOR</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                  <button type="button" onClick={handleLogout} className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 group">
                      <Unlock className="w-4 h-4 group-hover:hidden" /><Lock className="w-4 h-4 hidden group-hover:block" />
                  </button>
              ) : (
                  <button type="button" onClick={() => setShowLoginModal(true)} className="p-1.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700 transition-all">
                      <Lock className="w-4 h-4" />
                  </button>
              )}
              <button type="button" onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-1.5 rounded-full transition-colors ${voiceEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isLoggedIn && (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg py-1.5 mb-3 flex items-center justify-center animate-pulse">
                  <span className="text-[10px] font-black text-emerald-400 tracking-widest">TAP MAP TO ADD NEW PLOT</span>
              </div>
          )}

          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 text-slate-500 w-4 h-4" />
            <input type="text" placeholder={isDbLoaded ? "Search Destination (e.g. B-10/17)" : "Connecting to Database..."} disabled={!isDbLoaded} value={searchQuery} onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 text-white font-bold tracking-wider rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 transition-all text-sm uppercase placeholder:text-slate-600 shadow-inner disabled:opacity-50" />
          </div>

          {targetLocation && (
            <div className="mt-3 flex flex-col gap-2">
                <button type="button" onClick={() => { if (isNavigating) { setIsNavigating(false); setTargetLocation(null); setSearchQuery(''); setUserLocation(null); } else { setIsNavigating(true); } }}
                className={`w-full py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${isNavigating ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}>
                <Route className="w-4 h-4" /> {isNavigating ? 'END ROUTE' : 'START ROUTE'}
                </button>
                {isNavigating && (
                    <div className="flex items-center justify-between px-2">
                         <span className="text-[10px] font-bold text-slate-400">{gpsStatus}</span>
                         {distanceRemaining !== null && <span className="text-[10px] font-black text-green-400">{distanceRemaining}m AWAY</span>}
                    </div>
                )}
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul className="pointer-events-auto bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 max-h-48 overflow-y-auto divide-y divide-slate-800">
            {suggestions.map((plot) => (
              <li key={plot.id}>
                {/* 100% RELIABLE STANDARD ONCLICK */}
                <button type="button" onClick={() => handleSelectSuggestion(plot)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-all text-slate-300 font-semibold text-xs tracking-wide">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <div><span className="font-bold text-white block tracking-wider">{plot.id}</span><span className="text-[10px] text-slate-500">{plot.name}</span></div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="absolute inset-0 w-full h-full z-0 cursor-crosshair">
        <MapContainer center={dhebarCenter} zoom={16} scrollWheelZoom={true} zoomControl={false} style={{ width: '100%', height: '100%' }}>
          <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <AdminMapClicker />

          {isLoggedIn && plotDatabase.map(plot => (
              <Marker key={plot.id} position={[plot.lat, plot.lng]} opacity={0.5}>
                  <Popup><p className="font-bold text-[10px] text-slate-500">{plot.id}</p></Popup>
              </Marker>
          ))}

          {targetLocation && <Marker position={[targetLocation.lat, targetLocation.lng]}><Popup><p className="font-black text-sm text-blue-600 p-1">{targetLocation.id}</p></Popup></Marker>}
          {isNavigating && userLocation && <Marker position={userLocation} icon={pulsingGpsIcon}><Popup><span className="font-bold">You are here!</span></Popup></Marker>}
          {isNavigating && userLocation && targetLocation && <DynamicRoutingMachine userLocation={userLocation} targetLocation={targetLocation} speak={speak} />}
          {isNavigating && userLocation && <LiveCameraTracker location={userLocation} />}
        </MapContainer>
      </div>
    </div>
  );
}