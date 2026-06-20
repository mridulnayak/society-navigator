import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function LiveCamera({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      // 🛑 ANTI-DIZZY FIX: If the map is already zoomed in closely, disable animations.
      // Animations fighting against rapid GPS updates is what causes the shaking.
      if (map.getZoom() >= 17) {
          map.panTo(location, { animate: false });
      } else {
          // If we are zoomed out, do one cinematic fly-in to find the driver
          map.flyTo(location, 18, { animate: true, duration: 1.5 });
      }
    }
  }, [location, map]);

  return null;
}