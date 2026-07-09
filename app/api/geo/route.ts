import { NextRequest, NextResponse } from "next/server";
import { getDestinations, ApiError } from "@/lib/api";
import { findNearestDestinations } from "@/lib/geo-match";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Browser GPS coords take priority if the visitor granted permission
  const gpsLat = searchParams.get("lat");
  const gpsLon = searchParams.get("lon");

  // Local dev override, e.g. /api/geo?debug_lat=27.7172&debug_lon=85.3240
  const debugLat = searchParams.get("debug_lat");
  const debugLon = searchParams.get("debug_lon");

  // Vercel's IP-geolocation headers (production only — empty in local dev)
  const headerLat = request.headers.get("x-vercel-ip-latitude");
  const headerLon = request.headers.get("x-vercel-ip-longitude");
  const headerCity = request.headers.get("x-vercel-ip-city");
  const headerCountry = request.headers.get("x-vercel-ip-country");

  const rawLat = gpsLat ?? debugLat ?? headerLat;
  const rawLon = gpsLon ?? debugLon ?? headerLon;

  const lat = rawLat !== null ? parseFloat(rawLat) : NaN;
  const lon = rawLon !== null ? parseFloat(rawLon) : NaN;

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      {
        matched: false,
        reason: "no_location_signal",
        message:
          "No GPS coords, debug override, or Vercel geo headers were present. " +
          "Locally, test with /api/geo?debug_lat=27.7172&debug_lon=85.3240",
      },
      { status: 200 }
    );
  }

  let destinations;
  try {
    destinations = await getDestinations();
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 502;
    return NextResponse.json(
      {
        matched: false,
        reason: "backend_unreachable",
        message:
          "Could not reach the Django API. Check NEXT_PUBLIC_API_URL and that the backend is running.",
      },
      { status: status >= 400 && status < 600 ? 502 : 502 }
    );
  }

  const matches = findNearestDestinations(lat, lon, destinations, 3);

  if (matches.length === 0) {
    return NextResponse.json(
      { matched: false, reason: "no_destinations" },
      { status: 200 }
    );
  }

  return NextResponse.json({
    matched: true,
    visitor: {
      latitude: lat,
      longitude: lon,
      city: headerCity ? decodeURIComponent(headerCity) : null,
      country: headerCountry ?? null,
    },
    matches: matches.map((m) => ({
      destination: m.destination,
      distanceKm: Math.round(m.distanceKm),
    })),
  });
}
