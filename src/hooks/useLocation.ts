import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  // Default coordinates: Patia, Bhubaneswar (20.3533, 85.8266)
  const [location, setLocation] = useState<Coordinates>({
    latitude: 20.3533,
    longitude: 85.8266,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchLocation() {
      setLoading(true);
      setError(null);

      try {
        if (Capacitor.isNativePlatform()) {
          const permissions = await Geolocation.checkPermissions();
          if (permissions.location !== "granted") {
            await Geolocation.requestPermissions();
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
          if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                if (mounted) {
                  setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                  });
                }
              },
              (err) => {
                // Silently fallback without alert modal
                if (mounted) {
                  setError("Using default location (Patia, Bhubaneswar)");
                }
              },
              { enableHighAccuracy: true, timeout: 8000 }
            );
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to get location");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return { location, error, loading };
}
