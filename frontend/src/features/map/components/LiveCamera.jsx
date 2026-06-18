import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function LiveCamera({ location }) {
  const map = useMap();
  
  useEffect(() => { 
      if (location) {
          map.flyTo(location, 18, { animate: true, duration: 1 }); 
      }
  }, [location, map]);
  
  return null;
}