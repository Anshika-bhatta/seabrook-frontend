import type { Destination } from "./api";

const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two lat/lon points, in kilometers.
 * Uses the Haversine formula.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export interface NearestMatch {
  destination: Destination;
  distanceKm: number;
}

/**
 * Finds the nearest destination to a given visitor coordinate.
 * Returns null if the destinations list is empty.
 */
export function findNearestDestination(
  visitorLat: number,
  visitorLon: number,
  destinations: Destination[]
): NearestMatch | null {
  if (destinations.length === 0) return null;

  let nearest: Destination | null = null;
  let nearestDistance = Infinity;

  for (const dest of destinations) {
    const destLat = parseFloat(dest.latitude);
    const destLon = parseFloat(dest.longitude);

    if (isNaN(destLat) || isNaN(destLon)) continue;

    const distance = haversineDistanceKm(
      visitorLat,
      visitorLon,
      destLat,
      destLon
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = dest;
    }
  }

  if (!nearest) return null;

  return {
    destination: nearest,
    distanceKm: nearestDistance,
  };
}

/**
 * Returns the top N nearest destinations, sorted closest-first.
 */
export function findNearestDestinations(
  visitorLat: number,
  visitorLon: number,
  destinations: Destination[],
  limit = 3
): NearestMatch[] {
  const matches: NearestMatch[] = destinations
    .map((dest) => {
      const destLat = parseFloat(dest.latitude);
      const destLon = parseFloat(dest.longitude);

      if (isNaN(destLat) || isNaN(destLon)) return null;

      return {
        destination: dest,
        distanceKm: haversineDistanceKm(
          visitorLat,
          visitorLon,
          destLat,
          destLon
        ),
      };
    })
    .filter((m): m is NearestMatch => m !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return matches.slice(0, limit);
}