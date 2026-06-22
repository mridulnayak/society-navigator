import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react'; // ⬅️ NEW ICON
import { DHEBAR_CENTER } from '../../../config/constants';
import { pulsingGpsIcon } from '../../../assets/icons/mapIcons';
import RoutingLine from './RoutingLine';
import LiveCamera from './LiveCamera';

// 🎯 NEW FEATURE: The Recenter Button
function RecenterButton() {
    const map = useMap();
    return (
        <button 
            onClick={() => map.flyTo(DHEBAR_CENTER, 16, { animate: true, duration: 1.5 })}
            className="absolute bottom-8 right-4 z-[999] bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] text-blue-400 hover:text-white hover:bg-blue-600 transition-all"
            title="Recenter Map"
        >
            <LocateFixed className="w-6 h-6" />
        </button>
    );
}

export default function MapCanvas({
    isLoggedIn, userRole, 
    plotDatabase, targetLocation, userLocation,
    isNavigating, speak
}) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing">
      <MapContainer center={DHEBAR_CENTER} zoom={16} scrollWheelZoom={true} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        {/* Admin Overview */}
        {isLoggedIn && userRole === 'admin' && plotDatabase.map(plot => (
            <Marker key={plot.id} position={[plot.lat, plot.lng]} opacity={0.5}>
                <Popup><p className="font-bold text-[10px] text-slate-500">{plot.id}</p></Popup>
            </Marker>
        ))}
        
        {/* Target Location */}
        {targetLocation && (
            <Marker position={[targetLocation.lat, targetLocation.lng]}>
                <Popup><p className="font-black text-sm text-blue-600 p-1">{targetLocation.id}</p></Popup>
            </Marker>
        )}
        
        {/* Live GPS */}
        {isNavigating && userLocation && (
            <Marker position={userLocation} icon={pulsingGpsIcon}>
                <Popup><span className="font-bold">You are here!</span></Popup>
            </Marker>
        )}
        
        {/* Components */}
        <RoutingLine userLocation={userLocation} targetLocation={targetLocation} speak={speak} />
        <LiveCamera location={userLocation} />
        
        {/* 🎯 INJECT THE BUTTON HERE */}
        <RecenterButton />
        
      </MapContainer>
    </div>
  );
}