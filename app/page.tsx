import Image from "next/image";
import Link from "next/link";
import GeoExperienceLoader from "@/components/GeoExperienceLoader";
import { getDestinationsPage } from "@/lib/api";

export default async function Home() {
  const featured = await getDestinationsPage({ isFeatured: true });
  const featuredDestinations = featured.results;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center py-32 px-6 sm:px-16 bg-white dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <GeoExperienceLoader />

        <div className="flex flex-col items-center gap-6 text-center max-w-xl mt-4">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Discover your next coastal escape.
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Seabrook, Texas — flights, hotels, and things to do, matched to
            wherever you&apos;re traveling from.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-6">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="/destinations"
          >
            Explore destinations
          </Link>
        </div>

        {featuredDestinations.length > 0 && (
          <div className="w-full mt-20">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold">Featured</h2>
              <Link
                href="/destinations"
                className="text-sm text-zinc-500 dark:text-zinc-400 underline"
              >
                See all
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featuredDestinations.map((dest) => (
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
                    <h3 className="font-medium mt-1 group-hover:underline">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {dest.location.city}, {dest.location.country}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
