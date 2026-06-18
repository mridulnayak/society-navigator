import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

export default function RoutingLine({ userLocation, targetLocation, speak }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  const hasFittedBounds = useRef(false); // 🛑 CIRCUIT BREAKER FOR THE BLINKING MAP

  useEffect(() => {
    // 1. If we lose the target or GPS, destroy the route safely
    if (!userLocation || !targetLocation) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
        hasFittedBounds.current = false; // Reset the camera lock
      }
      return;
    }

    const waypoints = [
      L.latLng(userLocation.lat, userLocation.lng),
      L.latLng(targetLocation.lat, targetLocation.lng)
    ];

    // 2. SMART UPDATE: If route exists, just move the GPS dot. Do NOT rebuild the whole route.
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints(waypoints);
    } else {
      // 3. INITIAL BUILD: Snap to real streets using OSRM
      routingControlRef.current = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        show: false, // Hides the ugly default text instructions
        fitSelectedRoutes: false, // 🛑 CRITICAL: Stops the routing engine from making the screen blink!
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }]
        },
        createMarker: () => null // Hides default ugly markers
      }).addTo(map);

      routingControlRef.current.on('routesfound', () => {
        if (speak) speak("speechRouteCalc");
      });
    }

    // 4. CAMERA LOCK: Only zoom out to show the route ONCE when the driver first clicks "Start"
    if (!hasFittedBounds.current) {
      map.fitBounds(L.latLngBounds(waypoints), { padding: [50, 50], maxZoom: 18 });
      hasFittedBounds.current = true;
    }

  }, [map, userLocation, targetLocation, speak]);

  return null;
}