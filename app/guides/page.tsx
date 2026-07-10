import Link from "next/link";
import { getLandingPages } from "@/lib/api";

export default async function GuidesIndexPage() {
  const guides = await getLandingPages();

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold">Travel Guides</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2">
        In-depth guides to help you plan your trip.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="group rounded-2xl border border-black/10 dark:border-white/10 p-5 hover:border-black/20 dark:hover:border-white/20 transition-colors"
          >
            <h2 className="font-medium group-hover:underline">
              {guide.title}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {guide.meta_description}
            </p>
          </Link>
        ))}
      </div>

      {guides.length === 0 && (
        <p className="mt-10 text-zinc-500 dark:text-zinc-400">
          No guides published yet.
        </p>
      )}
    </div>
  );
}