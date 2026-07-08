import Link from "next/link";
import Image from "next/image";
import { getDestinations } from "@/lib/api";
import DestinationsMap from "@/components/DestinationsMap";

export default async function DestinationsIndexPage() {
  const destinations = await getDestinations();

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold">Destinations</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2">
        {destinations.length} place{destinations.length === 1 ? "" : "s"} to
        explore.
      </p>

      {destinations.length > 0 && (
        <div className="mt-8 h-[400px] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
          <DestinationsMap destinations={destinations} />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {destinations.map((dest) => (
          <Link
            key={dest.id}
            href={`/destinations/${dest.slug}`}
            className="group rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden hover:border-black/20 dark:hover:border-white/20 transition-colors"
          >
            {dest.image ? (
              <Image
                src={dest.image}
                alt={dest.name}
                width={400}
                height={225}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-zinc-100 dark:bg-zinc-900" />
            )}
            <div className="p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {dest.category.name}
              </p>
              <h2 className="font-medium mt-1 group-hover:underline">
                {dest.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {dest.location.city}, {dest.location.country}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {destinations.length === 0 && (
        <p className="mt-10 text-zinc-500 dark:text-zinc-400">
          No destinations yet — add some in the Django admin.
        </p>
      )}
    </div>
  );
}