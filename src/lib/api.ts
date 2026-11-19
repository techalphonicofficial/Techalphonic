import { cacheLife, cacheTag } from "next/cache";
import { SITE_URL, siteRequest } from "./backend";
import type { Layout, Resolved } from "./types";

/*
 * Data access for pages. Cached reads are tagged "site"; Laravel pings /next-api/revalidate after every
 * admin save (App\Support\FrontendRevalidator), and the "site" cacheLife revalidates hourly as a safety net.
 */

export { SITE_URL };

function resolveUrl(path: string, query: Record<string, string | number | undefined> = {}) {
  const qs = new URLSearchParams({ path });
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== "") qs.set(k, String(v));
  return `resolve?${qs}`;
}

export async function getLayout(): Promise<Layout> {
  "use cache";
  cacheTag("site");
  cacheLife("site");
  return (await siteRequest<Layout>("layout")).body;
}

/** Any public path → typed page payload. `page` is the blog listing page number. */
export async function resolvePath(path: string, page?: number): Promise<Resolved> {
  "use cache";
  cacheTag("site");
  cacheLife("site");
  return (await siteRequest<Resolved>(resolveUrl(path, { page: page && page > 1 ? page : undefined }))).body;
}

/** All indexable public paths (build-time prerender list). */
export async function getPaths(): Promise<string[]> {
  "use cache";
  cacheTag("site");
  cacheLife("site");
  return (await siteRequest<{ paths: string[] }>("paths")).body.paths;
}

/** Search results are per query, so they are not cached. */
export async function searchSite(q: string): Promise<Resolved> {
  return (await siteRequest<Resolved>(resolveUrl("/search/", { q }))).body;
}

/** Preview links show unpublished drafts and must never be cached. */
export async function previewPage(type: string, token: string): Promise<Resolved> {
  return (await siteRequest<Resolved>(resolveUrl(`/preview/${type}/${token}/`))).body;
}

/** "http://site/x/" → "/x/" for comparing against the current path. */
export function pathOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url, SITE_URL).pathname;
  } catch {
    return url;
  }
}
