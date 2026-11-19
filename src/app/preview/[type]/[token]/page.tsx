import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Render } from "@/components/pages/Render";
import { previewPage } from "@/lib/api";

/** Shareable, expiring preview of unpublished content (Laravel PreviewController). Never cached, never indexed. */
export const metadata: Metadata = { title: "Preview", robots: "noindex, nofollow" };

export default function PreviewRoute({ params }: PageProps<"/preview/[type]/[token]">) {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-steel">Loading preview…</div>}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: Pick<PageProps<"/preview/[type]/[token]">, "params">) {
  const { type, token } = await params;
  if (!/^[a-z_]+$/.test(type) || !/^[A-Za-z0-9]{48}$/.test(token)) notFound();
  const r = await previewPage(type, token);
  if (r.kind === "not_found") notFound();
  return <Render r={r} />;
}
