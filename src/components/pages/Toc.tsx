"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Blog table of contents with the current heading highlighted (Alpine `toc` component). */
export function Toc({ items }: { items: { id: string; text: string; level: number }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const heads = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!heads.length || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)), { rootMargin: "-20% 0px -70% 0px" });
    heads.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-28">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">On this page</p>
      <ol className="mt-4 grid gap-1 border-l border-line text-sm" role="list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={cn("-ml-px block border-l-2 py-1.5 transition", item.level === 3 ? "pl-7" : "pl-4", active === item.id ? "border-brand font-semibold text-brand" : "border-transparent text-ink-600 hover:text-ink")}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
