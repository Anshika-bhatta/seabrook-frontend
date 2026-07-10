import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getLandingPageBySlug } from "@/lib/api";

export async function generateMetadata(
  props: PageProps<"/guides/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const guide = await getLandingPageBySlug(slug);
    return {
      title: guide.title,
      description: guide.meta_description,
      keywords: guide.meta_keywords || undefined,
      alternates: guide.canonical_url
        ? { canonical: guide.canonical_url }
        : undefined,
    };
  } catch {
    return {};
  }
}

export default async function GuidePage(
  props: PageProps<"/guides/[slug]">
) {
  const { slug } = await props.params;

  let guide;
  try {
    guide = await getLandingPageBySlug(slug);
  } catch {
    notFound();
  }

  const paragraphs = guide.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        Travel Guide
      </p>
      <h1 className="text-3xl font-semibold mt-2">{guide.h1_heading}</h1>

      <div className="mt-6 flex flex-col gap-4 text-zinc-700 dark:text-zinc-300 leading-7">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <Link
        href={`/destinations/${guide.destination.slug}`}
        className="inline-block mt-10 rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium"
      >
        View {guide.destination.name}
      </Link>
    </div>
  );
}