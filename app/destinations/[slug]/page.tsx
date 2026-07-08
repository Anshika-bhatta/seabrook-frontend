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

      {bookingLinks.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
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