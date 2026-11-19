/*
 * Low-level HTTP access to Laravel's site API (no Next.js cache APIs, so the proxy can import it too).
 */

/** Hosts differ per environment, so they always come from the environment (see .env.example); no defaults. */
function requiredUrl(name: "BACKEND_URL" | "SITE_URL"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set. Production: put it in frontend/.env.production on the machine that runs \`next build\`; local: frontend/.env.local (see .env.example).`);
  }
  return value.replace(/\/$/, "");
}

export const BACKEND = requiredUrl("BACKEND_URL");
export const SITE_URL = requiredUrl("SITE_URL");

// Origins Laravel writes into absolute URLs (its APP_URL), longest first so "http://host:8000" wins over "http://host".
const ORIGINS = [...(process.env.BACKEND_PUBLIC_ORIGINS ?? BACKEND).split(","), SITE_URL]
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter((o, i, all) => o && all.indexOf(o) === i)
  .sort((a, b) => b.length - a.length);
const ORIGIN_RE = new RegExp(`(?:${ORIGINS.map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(/|(?=[?#"\\\\]))`, "g");

const HEADERS = { Accept: "application/json", "X-Frontend-Key": process.env.FRONTEND_API_KEY ?? "" };

/**
 * Laravel builds absolute URLs with its own host. Links, menus and media become root-relative ("/about-us/") so
 * they work on whatever host serves the site; `seo` (canonical, Open Graph, JSON-LD, prev/next) must stay
 * absolute and gets SITE_URL instead.
 */
function localise<T>(text: string): T {
  const body = JSON.parse(text.replace(ORIGIN_RE, "/"));
  if (body && typeof body === "object" && "seo" in body) {
    body.seo = JSON.parse(text.replace(ORIGIN_RE, `${SITE_URL}/`)).seo;
  }
  return body as T;
}

// A build prerenders every page through the API, so one dropped connection or a briefly overloaded backend must
// not fail the whole build: network errors, 429 and 5xx are retried with backoff. 404 is a real answer.
const RETRY_DELAYS_MS = [1000, 3000, 8000];
const REQUEST_TIMEOUT_MS = 20_000;

export async function siteRequest<T>(path: string, { retry = true } = {}): Promise<{ status: number; body: T }> {
  const url = `${BACKEND}/api/v1/site/${path}`;
  const delays = retry ? RETRY_DELAYS_MS : [];
  for (let attempt = 0; ; attempt++) {
    let failure: string;
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      if (res.ok || res.status === 404) {
        return { status: res.status, body: localise<T>(await res.text()) };
      }
      if (res.status !== 429 && res.status < 500) {
        throw new Error(`Site API ${path} failed with ${res.status}`);
      }
      failure = `HTTP ${res.status}`;
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("Site API")) throw e;
      const err = e as Error & { cause?: { code?: string } };
      failure = err.cause?.code ?? err.name ?? "network error";
    }
    if (attempt >= delays.length) {
      throw new Error(`Site API ${path} unreachable at ${BACKEND} after ${attempt + 1} attempt(s) (${failure}). Check BACKEND_URL and that the backend is up.`);
    }
    console.warn(`Site API ${path}: ${failure}, retrying in ${delays[attempt] / 1000}s`);
    await new Promise((r) => setTimeout(r, delays[attempt]));
  }
}

/** Redirect map for the proxy: "/old/" → [target, status, id]. No retries: it runs on visitor requests and the proxy keeps the last map. */
export async function getRedirects(): Promise<Record<string, [string | null, number, number]>> {
  return (await siteRequest<{ map: Record<string, [string | null, number, number]> }>("redirects", { retry: false })).body.map;
}

export function recordRedirectHit(id: number): Promise<unknown> {
  return fetch(`${BACKEND}/api/v1/site/redirects/${id}/hit`, { method: "POST", headers: HEADERS }).catch(() => null);
}
