"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Destination } from "@/lib/api";

interface DestinationsMapProps {
  destinations: Destination[];
}

const HOVER_CLOSE_DELAY_MS = 200;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPopupHtml(dest: Destination): string {
  const description = dest.description ?? "";
  const truncated =
    description.length > 140 ? `${description.slice(0, 140)}…` : description;

  const amenities = dest.amenities ?? [];
  const amenitiesHtml =
    amenities.length > 0
      ? `<div style="margin-top:8px;">
          <p style="font-size:11px;font-weight:700;letter-spacing:0.04em;color:#6b7280;margin:0 0 4px;">AMENITIES ${dest.opening_hours ? "&amp; HOURS" : ""}</p>
          <ul style="margin:0;padding:0;list-style:none;font-size:13px;color:#374151;line-height:1.6;">
            ${amenities
              .slice(0, 5)
              .map(
                (a) =>
                  `<li>${a.icon ? `${a.icon} ` : ""}${escapeHtml(a.name)}</li>`
              )
              .join("")}
            ${
              dest.opening_hours
                ? `<li>🕐 ${escapeHtml(dest.opening_hours)}</li>`
                : ""
            }
          </ul>
        </div>`
      : dest.opening_hours
      ? `<div style="margin-top:8px;font-size:13px;color:#374151;">
          🕐 ${escapeHtml(dest.opening_hours)}
        </div>`
      : "";

  const bookingLinks = (dest.booking_links ?? []).filter((l) => l.is_active);
  const bookingButtonsHtml =
    bookingLinks.length > 0
      ? `<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
          ${bookingLinks
            .slice(0, 2)
            .map(
              (link) =>
                `<a href="${link.booking_url}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;background:#111827;color:white;font-size:12px;font-weight:600;padding:6px 10px;border-radius:9999px;text-decoration:none;white-space:nowrap;">${escapeHtml(
                  link.label || link.provider_display
                )}</a>`
            )
            .join("")}
        </div>`
      : "";

  return `
    <div style="width:230px;font-family:inherit;">
      <h3 style="font-size:15px;font-weight:600;margin:0;color:#111827;">${escapeHtml(
        dest.name
      )}</h3>
      <p style="font-size:12px;color:#6b7280;margin:2px 0 0;">${escapeHtml(
        dest.location.city
      )}, ${escapeHtml(dest.location.country)}</p>
      ${
        truncated
          ? `<p style="font-size:13px;color:#374151;margin:8px 0 0;line-height:1.5;">${escapeHtml(
              truncated
            )}</p>`
          : ""
      }
      ${amenitiesHtml}
      ${bookingButtonsHtml}
      <a href="/destinations/${dest.slug}" style="display:block;text-align:center;font-size:12px;color:#6b7280;text-decoration:underline;margin-top:10px;">
        View full details
      </a>
    </div>
  `;
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

      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4285F4;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10],
      });

      const validDestinations = destinations
        .map((d) => ({
          dest: d,
          lat: parseFloat(d.latitude),
          lon: parseFloat(d.longitude),
        }))
        .filter((d) => !isNaN(d.lat) && !isNaN(d.lon));

      if (validDestinations.length === 0) return;

      const map = L.map(containerRef.current);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      let closeTimer: ReturnType<typeof setTimeout> | null = null;

      function cancelClose() {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      }

      function scheduleClose(m: import("leaflet").Marker) {
        cancelClose();
        closeTimer = setTimeout(() => {
          m.closePopup();
        }, HOVER_CLOSE_DELAY_MS);
      }

      map.on("popupopen", (e) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;
        popupEl.addEventListener("mouseenter", cancelClose);
        popupEl.addEventListener("mouseleave", () => {
          closeTimer = setTimeout(() => {
            map.closePopup();
          }, HOVER_CLOSE_DELAY_MS);
        });
      });

      validDestinations.forEach(({ dest, lat, lon }) => {
        const marker = L.marker([lat, lon], { icon }).addTo(map);
        marker.bindPopup(buildPopupHtml(dest), { maxWidth: 260 });

        marker.on("mouseover", () => {
          cancelClose();
          marker.openPopup();
        });
        marker.on("mouseout", () => {
          scheduleClose(marker);
        });
      });

      if (validDestinations.length === 1) {
        const { lat, lon } = validDestinations[0];
        map.setView([lat, lon], 12);
      } else {
        const bounds = L.latLngBounds(
          validDestinations.map(({ lat, lon }) => [lat, lon] as [number, number])
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
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