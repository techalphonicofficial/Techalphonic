import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchForm, SearchResults } from "@/components/pages/CollectionPages";
import { RevealScope } from "@/components/runtime/Runtime";
import { getLayout, searchSite, SITE_URL } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLayout();
  return { title: { absolute: `Search | ${settings.site_name}` }, robots: "noindex, follow", alternates: { canonical: `${SITE_URL}/search/` } };
}

/** /search/?q= — per-query results stream in; the form is part of the static shell. */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <Suspense fallback={<SearchForm q="" />}>
        {searchParams.then(({ q }) => (
          <SearchForm q={String(q ?? "").trim()} />
        ))}
      </Suspense>
      <section className="section">
        <div className="container-x max-w-3xl">
          <Suspense fallback={<p className="text-sm text-steel">Searching…</p>}>
            <Results searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
      <RevealScope />
    </>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const q = String((await searchParams).q ?? "").trim();
  if (!q) return null;
  const r = await searchSite(q);
  return <SearchResults q={q} results={r.kind === "search" ? r.data.results : []} />;
}
