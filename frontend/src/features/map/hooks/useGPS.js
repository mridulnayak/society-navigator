import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

export function useGPS(isNavigating, targetLocation, speak) {
  const [userLocation, setUserLocation] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("Waiting for GPS...");

  const targetRef = useRef(targetLocation);
  const speakRef = useRef(speak);

  useEffect(() => {
    targetRef.current = targetLocation;
    speakRef.current = speak;
  }, [targetLocation, speak]);

  useEffect(() => {
    let watchId;

    if (isNavigating) {
      setGpsStatus("Locating...");
      let hasAnnouncedArrival = false;

      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            // 🐛 DEBUGGING: Print the accuracy to your browser console!
            console.log("GPS Accuracy (meters):", position.coords.accuracy);

            // 🛑 RELAXED DESKTOP FIX: Changed from 60 to 5000 for testing.
            // When you deploy this to actual phones, you can change it back to 60.
            if (position.coords.accuracy > 5000) {
                setGpsStatus(`Weak Signal (${Math.round(position.coords.accuracy)}m)`);
                return;
            }

            const currentLeafletLoc = L.latLng(position.coords.latitude, position.coords.longitude);
            setUserLocation(currentLeafletLoc);
            setGpsStatus("GPS Active"); 

            if (targetRef.current) {
              const dist = currentLeafletLoc.distanceTo(L.latLng(targetRef.current.lat, targetRef.current.lng)).toFixed(0);
              setDistanceRemaining(dist);

              if (dist < 15 && !hasAnnouncedArrival) {
                hasAnnouncedArrival = true;
                if (speakRef.current) speakRef.current("speechArrived");
              }
            }
          },
          (error) => {
              console.error("GPS Error:", error);
              setGpsStatus("GPS Error - Check Permissions");
          },
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
  }, [isNavigating]); 

  return { userLocation, distanceRemaining, gpsStatus };
}