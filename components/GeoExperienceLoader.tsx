"use client";

import { useEffect, useState } from "react";
import type { Destination } from "@/lib/api";

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
  destination?: Destination;
  distanceKm?: number;
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
        setState(data.matched ? "matched" : "unmatched");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchGeo(pos.coords.latitude, pos.coords.longitude),
        () => fetchGeo(), // permission denied — fall back to IP headers only
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

  if (!result?.destination) return null;

  const { destination, distanceKm, visitor } = result;
  const description = destination.description ?? "";
  const truncated =
    description.length > 160
      ? `${description.slice(0, 160)}…`
      : description;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-black/10 dark:border-white/10 p-6 my-8">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {visitor?.city ? `Traveling from ${visitor.city}?` : "Nearby pick"}
      </p>
      <h2 className="text-2xl font-semibold mt-1">
        Explore {destination.name}
      </h2>
      {truncated && (
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">{truncated}</p>
      )}
      {typeof distanceKm === "number" && (
        <p className="text-xs text-zinc-400 mt-2">
          ~{distanceKm.toLocaleString()} km away
        </p>
      )}
      <a
        href={`/destinations/${destination.slug}`}
        className="inline-block mt-4 rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium"
      >
        View destination
      </a>
    </div>
  );
}