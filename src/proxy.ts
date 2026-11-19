import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { getRedirects, recordRedirectHit } from "@/lib/backend";

/*
 * Runs before every page render (same job as Laravel's HandleRedirects middleware):
 *  1. Admin-managed 301/302/410 redirects (map cached in memory for 60s).
 *  2. Canonical trailing slash: /foo → /foo/ (301).
 *  3. Blog pagination: /blog/?page=2 is rendered from the internal path /blog/__page/2/ so each page is cacheable.
 */

const TTL = 60_000;
let cache: { at: number; map: Record<string, [string | null, number, number]> } | null = null;

async function redirectMap() {
  if (cache && Date.now() - cache.at < TTL) return cache.map;
  try {
    cache = { at: Date.now(), map: await getRedirects() };
  } catch {
    cache = { at: Date.now() - TTL + 10_000, map: cache?.map ?? {} }; // backend down: retry in 10s
  }
  return cache.map;
}

/** Redirect::normalizePath — "/Foo/bar" → "/foo/bar/" */
function normalize(pathname: string): string {
  let p = "/";
  try {
    p = decodeURIComponent(pathname);
  } catch {
    p = pathname;
  }
  p = "/" + p.toLowerCase().replace(/^\/+|\/+$/g, "");
  return p === "/" ? "/" : p + "/";
}

const GONE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page removed</title><style>body{margin:0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;background:#f8fafb;color:#13262e;text-align:center;padding:1.5rem}h1{font-size:4rem;margin:0}a{display:inline-block;margin-top:1rem;background:#167b8b;color:#fff;padding:.8rem 1.4rem;border-radius:999px;text-decoration:none;font-weight:600}</style></head><body><main><h1>410</h1><p>This page has been permanently removed.</p><a href="/">Go to homepage</a></main></body></html>`;

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const url = request.nextUrl;
  const { pathname } = url;

  if (request.method === "GET" || request.method === "HEAD") {
    const map = await redirectMap();
    const hit = map[normalize(pathname)];
    if (hit) {
      const [target, code, id] = hit;
      event.waitUntil(recordRedirectHit(id));
      if (code === 410) {
        return new NextResponse(GONE_HTML, { status: 410, headers: { "content-type": "text/html; charset=utf-8" } });
      }
      const dest = new URL(target || "/", request.url);
      if (!dest.pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(dest.pathname)) dest.pathname += "/";
      dest.search = url.search;
      return NextResponse.redirect(dest, code === 302 ? 302 : 301);
    }
  }

  if (!pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(pathname)) {
    // Plain URL (not nextUrl.clone()): NextURL re-applies its own slash formatting when serialised.
    return NextResponse.redirect(new URL(`${pathname}/${url.search}`, request.url), 301);
  }

  const page = Number(url.searchParams.get("page"));
  if (/^\/blog\/(category\/[^/]+\/|tag\/[^/]+\/)?$/.test(pathname) && page > 1 && Number.isInteger(page)) {
    const rest = new URLSearchParams(url.search);
    rest.delete("page");
    const qs = rest.toString();
    return NextResponse.rewrite(new URL(`${pathname}__page/${page}/${qs ? "?" + qs : ""}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Pages only: skip Next internals, files, and everything Laravel serves (see rewrites in next.config.ts).
  matcher: ["/((?!_next/|next-api/|api/|storage/|build/|admin(?:/|$)|sitemap[^/]*\\.xml|robots\\.txt|up$|favicon\\.ico).*)"],
};
