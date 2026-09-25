/** Great-circle distance in km (haversine). */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371; const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat); const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export const googleMapsLink = (lat: number, lon: number, placeId?: string | null) =>
  placeId
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(placeId)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

/** Places API (New) type filters per stay type. */
export const PLACE_TYPES: Record<string, string[]> = {
  ALL: ['lodging'],
  HOTEL: ['hotel'],
  RESORT: ['resort_hotel'],
  HOMESTAY: ['guest_house', 'bed_and_breakfast', 'farmstay'],
  LODGE: ['lodging'],
  CAMPING: ['campground'],
};
