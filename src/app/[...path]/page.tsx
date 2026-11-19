import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Render } from "@/components/pages/Render";
import { getLayout, getPaths, resolvePath } from "@/lib/api";
import { toMetadata } from "@/lib/metadata";

/*
 * Every other public URL (CMS pages, services, programmatic SEO pages, blog, portfolio, case studies…).
 * Laravel's site API decides what a path is. Pages are static: indexable URLs are prerendered at build
 * time, any other URL renders once on first request (blocking, so a missing page returns a real 404),
 * and admin saves refresh them through revalidateTag("site").
 */
export const ensureStatic = "navigation";
// Deliberately blocking: the page must know whether the path exists before streaming, so a missing
// page gets a real 404 status instead of a soft 404. The rendered result is still static and cached.
export const instant = false;

type Props = { params: Promise<{ path: string[] }> };

export async function generateStaticParams() {
  const limit = Number(process.env.PRERENDER_LIMIT ?? 500);
  const paths = (await getPaths()).filter((p) => p !== "/").slice(0, limit);
  const params = paths.map((p) => ({ path: p.replace(/^\/|\/$/g, "").split("/") }));
  // ensureStatic needs at least one param set; an empty site still builds (the placeholder renders a 404).
  return params.length ? params : [{ path: ["__placeholder"] }];
}

/** "/blog/__page/2/" (rewritten from "/blog/?page=2" by the proxy) → path "/blog/" + page 2. */
function target(segments: string[]): { path: string; page?: number } {
  const parts = segments.map((s) => decodeURIComponent(s));
  const i = parts.indexOf("__page");
  if (i !== -1) return { path: "/" + parts.slice(0, i).join("/") + "/", page: Number(parts[i + 1]) || 1 };
  return { path: "/" + parts.join("/") + "/" };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path, page } = target((await params).path);
  const r = await resolvePath(path, page);
  return r.kind === "not_found" ? {} : toMetadata(r.seo, await getLayout());
}

export default async function CatchAllPage({ params }: Props) {
  const { path, page } = target((await params).path);
  const r = await resolvePath(path, page);
  if (r.kind === "not_found") notFound();
  return <Render r={r} />;
}
