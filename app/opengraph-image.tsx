import { ImageResponse } from "next/og";

export const alt = "Seabrook Texas Town";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0ea5e9 0%, #082f49 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, display: "flex" }}>
          Seabrook, Texas
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 16,
            opacity: 0.85,
            display: "flex",
          }}
        >
          Coastal escapes, matched to wherever you&apos;re from
        </div>
      </div>
    ),
    { ...size }
  );
}