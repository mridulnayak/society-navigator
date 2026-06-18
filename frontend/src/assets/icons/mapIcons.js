import L from 'leaflet';

// 🔵 The glowing, pulsing user location dot
export const pulsingGpsIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});