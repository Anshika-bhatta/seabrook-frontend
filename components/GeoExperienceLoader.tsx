"use client";

import { useEffect, useState } from "react";
import type { Destination } from "@/lib/api";

interface GeoMatch {
  destination: Destination;
  distanceKm: number;
}

interface GeoApiResponse {
  matched: boolean;
  reason?: string;
  message?: string;
  visitor?: {
    latitude: number;
    longitude: number;
    city: string | null;
    country: string | null;
  };
  matches?: GeoMatch[];
}

type LoadState = "loading" | "matched" | "unmatched" | "error";

export default function GeoExperienceLoader() {
  const [state, setState] = useState<LoadState>("loading");
  const [result, setResult] = useState<GeoApiResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchGeo(lat?: number, lon?: number) {
      try {
        const params = new URLSearchParams();
        if (lat !== undefined && lon !== undefined) {
          params.set("lat", String(lat));
          params.set("lon", String(lon));
        }

        const res = await fetch(`/api/geo?${params.toString()}`);
        const data: GeoApiResponse = await res.json();

        if (cancelled) return;

        setResult(data);
        setState(
          data.matched && data.matches && data.matches.length > 0
            ? "matched"
            : "unmatched"
        );
      } catch {
        if (!cancelled) setState("error");
      }
    }

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchGeo(pos.coords.latitude, pos.coords.longitude),
        () => fetchGeo(),
        { timeout: 5000 }
      );
    } else {
      fetchGeo();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading" || state === "error" || state === "unmatched") {
    return null;
  }

  if (!result?.matches || result.matches.length === 0) return null;

  const { matches, visitor } = result;

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {visitor?.city ? `Traveling from ${visitor.city}?` : "Near you"}
      </p>
      <h2 className="text-2xl font-semibold mt-1 mb-4">
        Places worth the trip
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {matches.map(({ destination, distanceKm }) => {
          const description = destination.description ?? "";
          const truncated =
            description.length > 100
              ? `${description.slice(0, 100)}…`
              : description;

          return (
            
            <a
              key={destination.id}
              href={`/destinations/${destination.slug}`}
              className="rounded-2xl border border-black/10 dark:border-white/10 p-5 hover:border-black/20 dark:hover:border-white/20 transition-colors"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {destination.category.name}
              </p>
              <h3 className="font-medium mt-1">{destination.name}</h3>
              {truncated && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  {truncated}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-3">
                ~{distanceKm.toLocaleString()} km away
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
