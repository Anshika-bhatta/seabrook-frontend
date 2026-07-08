import { ImageResponse } from "next/og";
import { getDestinationBySlug } from "@/lib/api";

export const alt = "Destination preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image(
  props: PageProps<"/destinations/[slug]">
) {
  const { slug } = await props.params;

  let name = "Destination";
  let locationLabel = "";

  try {
    const destination = await getDestinationBySlug(slug);
    name = destination.name;
    locationLabel = `${destination.location.city}, ${destination.location.country}`;
  } catch {
    // Fall back to generic labels if the API call fails at render time.
  }

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
          {name}
        </div>
        {locationLabel && (
          <div
            style={{
              fontSize: 32,
              marginTop: 16,
              opacity: 0.85,
              display: "flex",
            }}
          >
            {locationLabel}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}