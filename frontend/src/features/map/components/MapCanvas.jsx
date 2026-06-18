import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { DHEBAR_CENTER } from '../../../config/constants';
import { pulsingGpsIcon } from '../../../assets/icons/mapIcons';
import RoutingLine from './RoutingLine';
import LiveCamera from './LiveCamera';

// Inline component to handle map clicks for Admins
function AdminMapClicker({ isLoggedIn, userRole, setNewPlotCoords }) {
  useMapEvents({
    click(e) {
      if (isLoggedIn && userRole === 'admin') {
        setNewPlotCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

export default function MapCanvas({
    isLoggedIn, userRole, setNewPlotCoords,
    plotDatabase, targetLocation, userLocation,
    isNavigating, speak
}) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 cursor-crosshair">
      <MapContainer center={DHEBAR_CENTER} zoom={16} scrollWheelZoom={true} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        <AdminMapClicker isLoggedIn={isLoggedIn} userRole={userRole} setNewPlotCoords={setNewPlotCoords} />
        
        {isLoggedIn && userRole === 'admin' && plotDatabase.map(plot => (
            <Marker key={plot.id} position={[plot.lat, plot.lng]} opacity={0.5}>
                <Popup><p className="font-bold text-[10px] text-slate-500">{plot.id}</p></Popup>
            </Marker>
        ))}
        
        {targetLocation && (
            <Marker position={[targetLocation.lat, targetLocation.lng]}>
                <Popup><p className="font-black text-sm text-blue-600 p-1">{targetLocation.id}</p></Popup>
            </Marker>
        )}
        
        {isNavigating && userLocation && (
            <Marker position={userLocation} icon={pulsingGpsIcon}>
                <Popup><span className="font-bold">You are here!</span></Popup>
            </Marker>
        )}
        
        {/* 🚦 INJECTED CUSTOM COMPONENTS */}
        <RoutingLine userLocation={userLocation} targetLocation={targetLocation} speak={speak} />
        <LiveCamera location={userLocation} />
        
      </MapContainer>
    </div>
  );
}