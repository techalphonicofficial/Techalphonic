import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Render } from "@/components/pages/Render";
import { getLayout, resolvePath } from "@/lib/api";
import { toMetadata } from "@/lib/metadata";

// Homepage: fully static, refreshed on demand when an admin saves (revalidateTag "site").
export const ensureStatic = "navigation";

export async function generateMetadata(): Promise<Metadata> {
  const r = await resolvePath("/");
  return r.kind === "not_found" ? {} : toMetadata(r.seo, await getLayout());
}

export default async function HomePage() {
  const r = await resolvePath("/");
  if (r.kind === "not_found") notFound();
  return <Render r={r} />;
}
