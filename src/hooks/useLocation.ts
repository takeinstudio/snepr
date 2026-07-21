import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { LocationState, DEFAULT_LOCATION } from "@/types/location";

const STORAGE_KEY = "snepr_user_location";

export function useLocation() {
  const [location, setLocation] = useState<LocationState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_LOCATION;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveLocation = (newLoc: LocationState) => {
    setLocation(newLoc);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<{ locality: string; city: string }> => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await res.json();
      const locality = data.locality || data.city || data.principalSubdivision || "Patia";
      const city = data.city || data.principalSubdivision || "Bhubaneswar";
      return { locality, city };
    } catch {
      return { locality: "Patia", city: "Bhubaneswar" };
    }
  };

  const requestGpsLocation = async () => {
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

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geo = await reverseGeocode(lat, lng);

        const newLoc: LocationState = {
          latitude: lat,
          longitude: lng,
          accuracy: pos.coords.accuracy,
          locality: geo.locality,
          city: geo.city,
          formattedLabel: `${geo.locality}, ${geo.city}`,
          source: "gps",
        };

        saveLocation(newLoc);
      } else {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              const geo = await reverseGeocode(lat, lng);

              const newLoc: LocationState = {
                latitude: lat,
                longitude: lng,
                accuracy: pos.coords.accuracy,
                locality: geo.locality,
                city: geo.city,
                formattedLabel: `${geo.locality}, ${geo.city}`,
                source: "gps",
              };

              saveLocation(newLoc);
              setLoading(false);
            },
            (err) => {
              setError("Location access denied or unavailable. Please select location manually.");
              setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          setError("Geolocation is not supported by your browser.");
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to acquire GPS location.");
      setLoading(false);
    }
  };

  const setManualLocation = (formattedLabel: string, latitude: number, longitude: number) => {
    const parts = formattedLabel.split(",");
    const locality = parts[0]?.trim() || "Patia";
    const city = parts[1]?.trim() || "Bhubaneswar";

    const newLoc: LocationState = {
      latitude,
      longitude,
      locality,
      city,
      formattedLabel,
      source: "manual",
    };

    saveLocation(newLoc);
  };

  return {
    location,
    loading,
    error,
    requestGpsLocation,
    setManualLocation,
  };
}
