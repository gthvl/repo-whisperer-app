import { useEffect, useState } from "react";

interface GeoLocationData {
  city: string;
  state: string;
}

const GEOLOCATION_CACHE_KEY = "shipping-geolocation";
const FALLBACK_LOCATION: GeoLocationData = { city: "", state: "" };
const GEOLOCATION_ENDPOINTS = [
  "https://ipwho.is/",
  "https://get.geojs.io/v1/ip/geo.json",
  "https://ipapi.co/json/",
];

const normalizeLocation = (data: any): GeoLocationData | null => {
  const city = data?.city ?? "";
  const state = data?.region ?? data?.region_name ?? data?.state ?? "";

  if (!city || !state) return null;

  return { city, state };
};

const readCachedLocation = (): GeoLocationData | null => {
  if (typeof window === "undefined") return null;

  const rawLocation = window.sessionStorage.getItem(GEOLOCATION_CACHE_KEY);
  if (!rawLocation) return null;

  try {
    return normalizeLocation(JSON.parse(rawLocation));
  } catch {
    return null;
  }
};

const writeCachedLocation = (location: GeoLocationData) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify(location));
};

const fetchLocation = async (): Promise<GeoLocationData | null> => {
  for (const endpoint of GEOLOCATION_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(endpoint, { signal: controller.signal });
      if (!response.ok) continue;

      const data = await response.json();
      const location = normalizeLocation(data);

      if (location) return location;
    } catch {
      // try next provider
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return null;
};

export const useGeoLocation = () => {
  const [location, setLocation] = useState<GeoLocationData>(() => readCachedLocation() ?? FALLBACK_LOCATION);

  useEffect(() => {
    if (location.city && location.state) return;

    let isMounted = true;

    const loadLocation = async () => {
      const nextLocation = await fetchLocation();
      if (!isMounted || !nextLocation) return;

      writeCachedLocation(nextLocation);
      setLocation(nextLocation);
    };

    void loadLocation();

    return () => {
      isMounted = false;
    };
  }, [location.city, location.state]);

  const locationLabel = location.city && location.state
    ? `${location.city}, ${location.state}`
    : "todo o Brasil";

  return {
    city: location.city,
    state: location.state,
    locationLabel,
  };
};
