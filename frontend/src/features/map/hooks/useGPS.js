import { useState, useEffect } from 'react';
import L from 'leaflet';
import { ARRIVAL_RADIUS_METERS } from '../../../config/constants';

export function useGPS(isNavigating, targetLocation, speak) {
  const [userLocation, setUserLocation] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("Waiting for GPS...");
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    let watchId;
    
    if (isNavigating && targetLocation) {
      setHasArrived(false); 
      setGpsStatus("Locating...");
      
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const currentLeafletLoc = L.latLng(position.coords.latitude, position.coords.longitude);
            setUserLocation(currentLeafletLoc); 
            setGpsStatus("GPS Active");
            
            const dist = currentLeafletLoc.distanceTo(L.latLng(targetLocation.lat, targetLocation.lng)).toFixed(0);
            setDistanceRemaining(dist);
            
            if (dist < ARRIVAL_RADIUS_METERS && !hasArrived) {
              speak(`Arrived at ${targetLocation.id}.`); 
              setHasArrived(true);
            }
          },
          (error) => setGpsStatus("GPS Error - Check Permissions"), 
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    } else { 
        setUserLocation(null); 
        setDistanceRemaining(null); 
        setGpsStatus(""); 
    }
    
    return () => { 
        if (watchId) navigator.geolocation.clearWatch(watchId); 
    };
  }, [isNavigating, targetLocation, hasArrived, speak]);

  return { userLocation, distanceRemaining, gpsStatus, hasArrived };
}