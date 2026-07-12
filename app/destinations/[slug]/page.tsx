import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getDestinationBySlug,
  getBookingLinksForDestination,
  getAllDestinations,
  type Destination,
} from "@/lib/api";
import { findNearestDestinations } from "@/lib/geo-match";
import PersonalizedBookingLinks from "@/components/PersonalizedBookingLinks";

async function getRelatedDestinations(
  current: Destination
): Promise<Destination[]> {
  const all = await getAllDestinations();
  const others = all.filter((d) => d.id !== current.id);

  const currentLat = parseFloat(current.latitude);
  const currentLon = parseFloat(current.longitude);

  const sameCategory = others.filter(
    (d) => d.category.slug === current.category.slug
  );

  const nearestInCategory = findNearestDestinations(
    currentLat,
    currentLon,
    sameCategory,
    3
  ).map((m) => m.destination);

  const related = [...nearestInCategory];

  if (related.length < 3) {
    const remaining = others.filter(
      (d) => !related.some((r) => r.id === d.id)
    );
    const fillIn = findNearestDestinations(
      currentLat,
      currentLon,
      remaining,
      3 - related.length
    ).map((m) => m.destination);
    related.push(...fillIn);
  }

  return related;
}

export default async function DestinationPage(
  props: PageProps<"/destinations/[slug]">
) {
  const { slug } = await props.params;

  let destination;
  try {
    destination = await getDestinationBySlug(slug);
  } catch {
    notFound();
  }

  const [bookingLinks, relatedDestinations] = await Promise.all([
    getBookingLinksForDestination(destination.id),
    getRelatedDestinations(destination),
  ]);

  const amenities = destination.amenities ?? [];
  const gallery = [...(destination.gallery ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      {destination.image && (
        <Image
          src={destination.image}
          alt={destination.name}
          width={800}
          height={450}
          className="rounded-2xl w-full h-auto object-cover"
        />
      )}

      <h1 className="text-3xl font-semibold mt-6">{destination.name}</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">
        {destination.location.city}, {destination.location.country}
      </p>

      <p className="mt-6 text-zinc-700 dark:text-zinc-300 leading-7">
        {destination.description}
      </p>

      {amenities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Amenities
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                key={amenity.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm"
                title={amenity.description || undefined}
              >
                {amenity.icon && (
                  <span aria-hidden="true" className="text-xs opacity-60">
                    {amenity.icon}
                  </span>
                )}
                {amenity.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Gallery
          </h2>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((photo) => (
              <div
                key={photo.id}
                className="relative rounded-xl overflow-hidden aspect-square border border-black/10 dark:border-white/10"
              >
                <Image
                  src={photo.image}
                  alt={photo.alt_text || photo.caption || destination.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
                {photo.is_primary && (
                  <span className="absolute top-2 left-2 rounded-full bg-black/70 text-white text-xs px-2 py-0.5">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <PersonalizedBookingLinks
        destination={destination}
        bookingLinks={bookingLinks}
      />

      {relatedDestinations.length > 0 && (
        <div className="mt-14 pt-10 border-t border-black/10 dark:border-white/10">
          <h2 className="text-xl font-semibold">You might also like</h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedDestinations.map((related) => (
              <Link
                key={related.id}
                href={`/destinations/${related.slug}`}
                className="group rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden hover:border-black/20 dark:hover:border-white/20 transition-colors"
              >
                {related.image ? (
                  <Image
                    src={related.image}
                    alt={related.name}
                    width={300}
                    height={170}
                    className="w-full h-28 object-cover"
                  />
                ) : (
                  <div className="w-full h-28 bg-zinc-100 dark:bg-zinc-900" />
                )}
                <div className="p-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {related.category.name}
                  </p>
                  <h3 className="text-sm font-medium mt-1 group-hover:underline">
                    {related.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
