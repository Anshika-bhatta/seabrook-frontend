"use client";

import { useEffect, useState } from "react";
import type { BookingLink, Destination } from "@/lib/api";

interface PersonalizedBookingLinksProps {
  destination: Destination;
  bookingLinks: BookingLink[];
}

interface GeoApiResponse {
  matched?: boolean;
  visitor?: {
    city: string | null;
    country: string | null;
  };
}

export default function PersonalizedBookingLinks({
  destination,
  bookingLinks,
}: PersonalizedBookingLinksProps) {
  const [originCity, setOriginCity] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrigin(lat?: number, lon?: number) {
      try {
        const params = new URLSearchParams();
        if (lat !== undefined && lon !== undefined) {
          params.set("lat", String(lat));
          params.set("lon", String(lon));
        }

        const res = await fetch(`/api/geo?${params.toString()}`);
        const data: GeoApiResponse = await res.json();

        if (!cancelled && data.visitor?.city) {
          setOriginCity(data.visitor.city);
        }
      } catch {
        // Silently keep generic links if origin detection fails.
      }
    }

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchOrigin(pos.coords.latitude, pos.coords.longitude),
        () => fetchOrigin(), // permission denied — IP headers still work on Vercel
        { timeout: 5000 }
      );
    } else {
      fetchOrigin();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const destinationLabel =
    destination.location.airport_code || destination.location.city;

  function personalizeUrl(link: BookingLink): string {
    if (link.provider !== "google_flights" || !originCity) {
      return link.booking_url;
    }

    const query = encodeURIComponent(
      `Flights from ${originCity} to ${destinationLabel}`
    );
    return `https://www.google.com/travel/flights?q=${query}`;
  }

  function linkLabel(link: BookingLink): string {
    if (link.provider === "google_flights" && originCity) {
      return `Flights from ${originCity}`;
    }
    return link.label || `Book via ${link.provider_display}`;
  }

  const activeLinks = bookingLinks
    .filter((link) => link.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  if (activeLinks.length === 0) return null;

  return (
    <div className="mt-10 flex flex-wrap gap-3">
      {activeLinks.map((link) => (
        <a
        
          key={link.id}
          href={personalizeUrl(link)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium"
        >
          {linkLabel(link)}
        </a>
      ))}
    </div>
  );
}
