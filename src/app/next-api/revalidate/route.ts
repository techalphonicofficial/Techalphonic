import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

/**
 * Called by Laravel (App\Support\FrontendRevalidator) after any admin save so the next visit shows the change.
 * Body: { secret, tag }.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { secret?: string; tag?: string };
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || body.secret !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  // expire: 0 → no stale content after an edit; the next request renders fresh.
  revalidateTag(body.tag || "site", { expire: 0 });
  return Response.json({ ok: true });
}
