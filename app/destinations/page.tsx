import Link from "next/link";
import Image from "next/image";
import {
  getDestinationsPage,
  getAllDestinations,
  getCategories,
} from "@/lib/api";
import DestinationsMap from "@/components/DestinationsMap";

interface DestinationsIndexPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function DestinationsIndexPage({
  searchParams,
}: DestinationsIndexPageProps) {
  const {
    category: activeCategory,
    search: activeSearch,
    page: pageParam,
  } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [pageData, mapDestinations, categories] = await Promise.all([
    getDestinationsPage({
      category: activeCategory,
      search: activeSearch,
      page: currentPage,
    }),
    getAllDestinations({ category: activeCategory, search: activeSearch }),
    getCategories(),
  ]);

  const destinations = pageData.results;
  const totalCount = pageData.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = {
      category: activeCategory,
      search: activeSearch,
      page: overrides.page ?? undefined,
      ...overrides,
    };
    if (merged.category) params.set("category", String(merged.category));
    if (merged.search) params.set("search", String(merged.search));
    if (merged.page && Number(merged.page) > 1) {
      params.set("page", String(merged.page));
    }
    const qs = params.toString();
    return qs ? `/destinations?${qs}` : "/destinations";
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold">Destinations</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2">
        {totalCount} place{totalCount === 1 ? "" : "s"} to explore.
      </p>

      <form
        action="/destinations"
        method="GET"
        className="mt-6 flex gap-2 max-w-md"
      >
        {activeCategory && (
          <input type="hidden" name="category" value={activeCategory} />
        )}
        <input
          type="text"
          name="search"
          defaultValue={activeSearch}
          placeholder="Search destinations..."
          className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-transparent px-4 py-2 text-sm outline-none focus:border-black/30 dark:focus:border-white/30"
        />
        <button
          type="submit"
          className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={buildQuery({ category: undefined, page: undefined })}
          className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
            !activeCategory
              ? "bg-foreground text-background border-foreground"
              : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildQuery({ category: cat.slug, page: undefined })}
            className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
              activeCategory === cat.slug
                ? "bg-foreground text-background border-foreground"
                : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {activeSearch && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Showing results for &ldquo;{activeSearch}&rdquo;
          {" — "}
          <Link href={buildQuery({ search: undefined })} className="underline">
            clear
          </Link>
        </p>
      )}

      {mapDestinations.length > 0 && (
        <div className="mt-8 h-[400px] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
          <DestinationsMap destinations={mapDestinations} />
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
          No destinations found
          {activeCategory || activeSearch ? " matching your filters" : ""}.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          {pageData.previous ? (
            <Link
              href={buildQuery({ page: currentPage - 1 })}
              className="rounded-full border border-black/10 dark:border-white/10 px-4 py-1.5 text-sm hover:border-black/20 dark:hover:border-white/20"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-full border border-black/5 dark:border-white/5 px-4 py-1.5 text-sm text-zinc-300 dark:text-zinc-700">
              ← Previous
            </span>
          )}

          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>

          {pageData.next ? (
            <Link
              href={buildQuery({ page: currentPage + 1 })}
              className="rounded-full border border-black/10 dark:border-white/10 px-4 py-1.5 text-sm hover:border-black/20 dark:hover:border-white/20"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-full border border-black/5 dark:border-white/5 px-4 py-1.5 text-sm text-zinc-300 dark:text-zinc-700">
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
