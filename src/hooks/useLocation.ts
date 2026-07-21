import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation, Position } from "@capacitor/geolocation";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocation();
    
    return () => {
      // cleanup
    };
  }, []);

  async function fetchLocation() {
      setLoading(true);
      setError(null);

      try {
        if (Capacitor.isNativePlatform()) {
          // Native Capacitor Geolocation
          const permissions = await Geolocation.checkPermissions();
          if (permissions.location !== "granted") {
            const req = await Geolocation.requestPermissions();
            if (req.location !== "granted") {
              throw new Error("Location permission denied");
            }
          }
          
          const pos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
          });
          
          if (mounted) {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          }
          } else {
            // Web Browser Geolocation
            if (!navigator.geolocation) {
              throw new Error("Geolocation is not supported by your browser");
            }

          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
              enableHighAccuracy: true, 
              timeout: 10000,
              maximumAge: 0
            });
          });

          if (mounted) {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          }
        }
      } catch (err: any) {
        alert("Location Error: " + (err.message || JSON.stringify(err)));
        setError(err.message || "Failed to get location");
      } finally {
        setLoading(false);
      }
    }

  return { location, error, loading, fetchLocation };
}
