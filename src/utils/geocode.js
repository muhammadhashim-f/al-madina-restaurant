// ============================================================
// AL MADINA RESTAURANT — Geocoding & Routing helpers (FREE)
// Uses OpenStreetMap's free services — no API key, no billing:
// - Nominatim: turns an address into { lat, lng } and back
// - OSRM: calculates a real driving route between two points
// ============================================================

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// Restaurant's fixed real-world location — update to Al Madina's
// actual coordinates (right-click the spot on openstreetmap.org
// or Google Maps and copy the lat/lng shown).
export const RESTAURANT_LOCATION = {
  lat: 24.8299,
  lng: 67.1281,
  label: "Al Madina Restaurant",
};

// Turns a typed address into real coordinates.
export async function geocodeAddress(address) {
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(
    address
  )}&countrycodes=pk&limit=1`;

  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();

  if (!data || data.length === 0) {
    throw new Error(
      "Couldn't find that address on the map. Please check it and try again."
    );
  }

  const { lat, lon, display_name } = data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon), formattedAddress: display_name };
}

// Turns coordinates back into a readable place name (used while the
// rider marker moves, to show "near Korangi 2 Number" style toasts).
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`;

  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();

  if (!data || !data.address) return null;

  const a = data.address;
  return (
    a.suburb ||
    a.neighbourhood ||
    a.town ||
    a.city_district ||
    a.city ||
    data.display_name
  );
}

// Calculates a real driving route between two points using OSRM
// (free, no key). Returns an array of [lat, lng] pairs for Leaflet.
export async function getRoute(origin, destination) {
  const url = `${OSRM_BASE}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error("Couldn't calculate a route for this delivery.");
  }

  // GeoJSON gives [lng, lat] — Leaflet wants [lat, lng]
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}