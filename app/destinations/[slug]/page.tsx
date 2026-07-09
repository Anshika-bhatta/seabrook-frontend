import { notFound } from "next/navigation";
import Image from "next/image";
import {
  getDestinationBySlug,
  getBookingLinksForDestination,
} from "@/lib/api";

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

  const bookingLinks = await getBookingLinksForDestination(destination.id);

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

      {bookingLinks.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-3">
          {bookingLinks
            .filter((link) => link.is_active)
            .sort((a, b) => a.display_order - b.display_order)
            .map((link) => (
              <a
                key={link.id}
                href={link.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium"
              >
                {link.label || `Book via ${link.provider_display}`}
              </a>
            ))}
        </div>
      )}
    </div>
  );
}