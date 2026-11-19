import type { Metadata } from "next";
import type { Layout, Seo } from "./types";

/** Laravel SeoData → Next metadata (same tags as components/seo-meta.blade.php). */
export function toMetadata(seo: Seo, layout: Layout): Metadata {
  const robots = seo.robots + (seo.indexable ? ", max-image-preview:large, max-snippet:-1" : "");
  const handle = layout.settings.twitter_handle;
  return {
    title: { absolute: seo.title },
    description: seo.description ?? undefined,
    keywords: seo.keywords ?? undefined,
    robots,
    alternates: {
      canonical: seo.canonical ?? undefined,
      languages: Object.keys(seo.alternates ?? {}).length ? seo.alternates : undefined,
    },
    openGraph: {
      locale: "en_IN",
      type: seo.og_type === "article" ? "article" : "website",
      siteName: layout.settings.site_name,
      title: seo.og_title,
      description: seo.og_description ?? undefined,
      url: seo.canonical ?? undefined,
      images: seo.og_image ? [seo.og_image] : undefined,
      ...(seo.og_type === "article" && seo.published_time ? { publishedTime: seo.published_time, modifiedTime: seo.modified_time ?? undefined } : {}),
    },
    twitter: {
      card: seo.twitter_image ? "summary_large_image" : "summary",
      title: seo.twitter_title,
      description: seo.twitter_description ?? undefined,
      images: seo.twitter_image ? [seo.twitter_image] : undefined,
      site: handle ? "@" + handle.replace(/^@/, "") : undefined,
    },
  };
}

/** JSON-LD graph from Laravel's SchemaService, plus rel prev/next for paginated listings. */
export function SeoExtras({ seo }: { seo: Seo }) {
  return (
    <>
      {seo.prev_url && <link rel="prev" href={seo.prev_url} />}
      {seo.next_url && <link rel="next" href={seo.next_url} />}
      {seo.schema_json && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.schema_json.replace(/</g, "\\u003c") }} />}
    </>
  );
}
