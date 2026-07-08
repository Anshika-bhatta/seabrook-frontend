import type { MetadataRoute } from "next";
import { getDestinations } from "@/lib/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let destinationRoutes: MetadataRoute.Sitemap = [];

  try {
    const destinations = await getDestinations();

    destinationRoutes = destinations.map((dest) => ({
      url: `${SITE_URL}/destinations/${dest.slug}`,
      lastModified: dest.updated_at ? new Date(dest.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: dest.is_featured ? 0.8 : 0.6,
    }));
  } catch {
    // If the Django API is unreachable at build time, ship the static
    // routes only rather than failing the whole sitemap.
  }

  return [...staticRoutes, ...destinationRoutes];
}
