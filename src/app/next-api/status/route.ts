import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { BACKEND, SITE_URL } from "@/lib/backend";

/**
 * Deployment diagnostics for Admin → Maintenance (App\Support\FrontendRevalidator::status()). Body: { secret }.
 * Reports the URLs this build runs with, the backend the /api, /storage and /admin rewrites were built against
 * (next.config.ts is evaluated at build time), and whether the backend answers.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { secret?: string };
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || body.secret !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const dir = path.join(process.cwd(), ".next");
  const buildId = await readFile(path.join(dir, "BUILD_ID"), "utf8").catch(() => null);
  const builtAt = buildId ? (await stat(path.join(dir, "BUILD_ID")).catch(() => null))?.mtime.toISOString() ?? null : null;

  // Destination of the /api rewrite as compiled into this build.
  let proxyTarget: string | null = null;
  try {
    const manifest = JSON.parse(await readFile(path.join(dir, "routes-manifest.json"), "utf8"));
    const rewrites = Array.isArray(manifest.rewrites) ? manifest.rewrites : [...(manifest.rewrites?.beforeFiles ?? []), ...(manifest.rewrites?.afterFiles ?? [])];
    const api = rewrites.find((r: { source?: string; destination?: string }) => r.source?.startsWith("/api/"));
    proxyTarget = api?.destination ? new URL(api.destination).origin : null;
  } catch {
    proxyTarget = null; // dev server: no manifest
  }

  const started = Date.now();
  const backend = await fetch(`${BACKEND}/up`, { signal: AbortSignal.timeout(5000), cache: "no-store" })
    .then((r) => ({ ok: r.ok, status: r.status, ms: Date.now() - started, error: null as string | null }))
    .catch((e: Error) => ({ ok: false, status: 0, ms: Date.now() - started, error: e.message }));

  return Response.json({
    ok: true,
    site_url: SITE_URL,
    backend_url: BACKEND,
    proxy_target: proxyTarget,
    backend_public_origins: process.env.BACKEND_PUBLIC_ORIGINS ?? null,
    admin_path: process.env.ADMIN_PATH?.trim() || "admin",
    node: process.version,
    environment: process.env.NODE_ENV,
    build_id: buildId?.trim() ?? null,
    built_at: builtAt,
    backend,
  });
}
