import type { Metadata } from "next";
import { ErrorBody } from "@/components/pages/CollectionPages";
import { RevealScope } from "@/components/runtime/Runtime";

export const metadata: Metadata = { title: "Page not found", robots: "noindex, follow" };

export default function NotFound() {
  return (
    <>
      <ErrorBody code={404} title="Page not found" message="The page you are looking for may have moved or no longer exists." suggestions />
      <RevealScope />
    </>
  );
}
