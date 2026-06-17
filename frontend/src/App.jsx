import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, MapPin, Navigation, Route, Map, Activity, Compass } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// 📊 PLOT JSON DATA
const DHEBAR_PLOTS = [
  { id: "B-10/17", name: "Plot B-10/17", lat: 21.207051, lng: 81.627004 },
  { id: "B-10/18", name: "Plot B-10/18", lat: 21.207200, lng: 81.627100 },
  { id: "BUBI KA GHAR", name: "Bubi Ka Ghar", lat: 21.208305, lng: 81.626658 },
  { id: "NIBBI KA GHAR", name: "Nibbi Ka Ghar", lat: 21.157105, lng: 81.667716 },
  { id: "OM", name: "Om", lat: 21.344609, lng: 81.753349 }
];

// 🔵 CUSTOM PULSING GPS DOT
const pulsingGpsIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// 🚦 DYNAMIC ROUTING ENGINE (Updates path continuously)
function DynamicRoutingMachine({ userLocation, targetLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !targetLocation) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(targetLocation.lat, targetLocation.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false, // Hides default text box
      lineOptions: { styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }] },
      createMarker: () => null // Prevent default markers; we draw our own
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, userLocation, targetLocation]);

  return null;
}

// 🎥 LIVE CAMERA TRACKER (Follows the user smoothly)
function LiveCameraTracker({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo(location, 18, { animate: true, duration: 1 });
    }
  }, [location, map]);
  return null;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [targetLocation, setTargetLocation] = useState(null);
  
  // GPS State Architecture
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  const dhebarCenter = [21.2106, 81.6255]; 

  // 🛰️ THE CORE GPS ENGINE: Tracks live location and calculates distance
  useEffect(() => {
    let watchId;

    if (isNavigating && targetLocation) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            const currentLeafletLoc = L.latLng(currentLat, currentLng);
            
            setUserLocation(currentLeafletLoc); // This triggers DynamicRoutingMachine to redraw from here
            setGpsError(null);

            // Calculate exact distance to target plot in meters
            const targetLeafletLoc = L.latLng(targetLocation.lat, targetLocation.lng);
            const dist = currentLeafletLoc.distanceTo(targetLeafletLoc).toFixed(0);
            setDistanceRemaining(dist);
          },
          (error) => {
            console.error("GPS Error:", error.message);
            setGpsError("Searching for GPS signal...");
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        setGpsError("GPS not supported on this device.");
      }
    } else {
      setUserLocation(null);
      setDistanceRemaining(null);
      setGpsError(null);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, targetLocation]);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchQuery(value);
    
    if (isNavigating) {
      setIsNavigating(false); 
      setUserLocation(null);
      setDistanceRemaining(null);
    }

    if (value.trim() === '') {
      setSuggestions([]);
      setTargetLocation(null);
      return;
    }

    const filtered = DHEBAR_PLOTS.filter(plot => plot.id.includes(value));
    setSuggestions(filtered);
  };

  const handleSelectSuggestion = (plot) => {
    setSearchQuery(plot.id);
    setTargetLocation(plot);
    setSuggestions([]); 
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* 🔍 FLOATING CONTROL DASHBOARD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-full sm:max-w-md z-[9999] flex flex-col gap-1.5 pointer-events-auto">
        
        <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-slate-700">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-500 animate-pulse" />
              <h1 className="text-xs font-black text-white tracking-widest uppercase">
                DHEBAR CITY NAVIGATOR
              </h1>
            </div>
            {/* 🏃‍♂️ LIVE DISTANCE BADGE */}
            {isNavigating && distanceRemaining !== null && (
              <div className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-full border border-green-500/40">
                <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                <span className="text-[10px] font-black text-green-400 tracking-widest">
                  {distanceRemaining}m AWAY
                </span>
              </div>
            )}
            {/* ⚠️ GPS ERROR BADGE */}
            {gpsError && (
              <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/40">
                <span className="text-[9px] font-bold text-amber-400">{gpsError}</span>
              </div>
            )}
          </div>

          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Destination (e.g. B-10/17)"
              value={searchQuery}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 text-white font-bold tracking-wider rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 transition-all text-sm uppercase placeholder:text-slate-600 shadow-inner"
            />
          </div>

          {targetLocation && (
            <button 
              onClick={() => {
                if (isNavigating) {
                  setIsNavigating(false);
                  setTargetLocation(null);
                  setSearchQuery('');
                  setUserLocation(null);
                } else {
                  setIsNavigating(true);
                }
              }}
              className={`w-full mt-3 py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                isNavigating 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              }`}
            >
              <Route className="w-4 h-4" />
              {isNavigating ? 'END ROUTE' : 'START LIVE ROUTE'}
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 max-h-48 overflow-y-auto divide-y divide-slate-800">
            {suggestions.map((plot) => (
              <li key={plot.id}>
                <button
                  onClick={() => handleSelectSuggestion(plot)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-all text-slate-300 font-semibold text-xs tracking-wide"
                >
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="font-bold text-white block tracking-wider">{plot.id}</span>
                    <span className="text-[10px] text-slate-500">{plot.name}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🗺️ BACKGROUND MAP ENGINE */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapContainer 
          center={dhebarCenter} 
          zoom={16} 
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {targetLocation && (
            <Marker position={[targetLocation.lat, targetLocation.lng]}>
              <Popup><p className="font-black text-sm text-blue-600 p-1">{targetLocation.id}</p></Popup>
            </Marker>
          )}

          {/* 📍 RENDER LIVE GPS DOT */}
          {isNavigating && userLocation && (
            <Marker position={userLocation} icon={pulsingGpsIcon}>
              <Popup><span className="font-bold">You are here!</span></Popup>
            </Marker>
          )}

          {/* Draw Blue Navigation Line starting from User's Location */}
          {isNavigating && userLocation && targetLocation && (
            <DynamicRoutingMachine userLocation={userLocation} targetLocation={targetLocation} />
          )}

          {/* Pan Camera to follow user */}
          {isNavigating && userLocation && (
             <LiveCameraTracker location={userLocation} />
          )}

        </MapContainer>
      </div>
    </div>
  );
}