"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Destination } from "@/lib/api";

interface DestinationsMapProps {
  destinations: Destination[];
}

export default function DestinationsMap({
  destinations,
}: DestinationsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!containerRef.current || destinations.length === 0) return;

      // Dynamic import keeps Leaflet out of the server-side render entirely —
      // it touches `window` at import time, which crashes SSR otherwise.
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      // Leaflet's default marker icons reference paths that don't resolve
      // under Next.js's bundler. Point them at a CDN instead.
      const icon = L.icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const validDestinations = destinations.filter((d) => {
        const lat = parseFloat(d.latitude);
        const lon = parseFloat(d.longitude);
        return !isNaN(lat) && !isNaN(lon);
      });

      if (validDestinations.length === 0) return;

      const avgLat =
        validDestinations.reduce((sum, d) => sum + parseFloat(d.latitude), 0) /
        validDestinations.length;
      const avgLon =
        validDestinations.reduce(
          (sum, d) => sum + parseFloat(d.longitude),
          0
        ) / validDestinations.length;

      const map = L.map(containerRef.current).setView(
        [avgLat, avgLon],
        validDestinations.length === 1 ? 10 : 3
      );

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      validDestinations.forEach((dest) => {
        const lat = parseFloat(dest.latitude);
        const lon = parseFloat(dest.longitude);

        L.marker([lat, lon], { icon })
          .addTo(map)
          .bindPopup(
            `<strong>${dest.name}</strong><br/>${dest.location.city}, ${dest.location.country}<br/><a href="/destinations/${dest.slug}">View destination</a>`
          );
      });
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destinations]);

  return <div ref={containerRef} className="w-full h-full" />;
}