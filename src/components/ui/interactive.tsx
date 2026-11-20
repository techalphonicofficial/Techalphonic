"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/** Animated number (the [data-count] counter from app.js). Updates DOM text directly to avoid 60fps React re-renders. */
export function CountUp({ value }: { value: string | number | null | undefined }) {
  const raw = String(value ?? 0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = parseFloat(raw);
    if (!el || !isFinite(target) || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const decimals = (raw.split(".")[1] || "").length;
    let frame = 0;
    let last = "";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / 1100, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const next = (target * eased).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
          if (next !== last) {
            last = next;
            el.textContent = next;
          }
          if (p < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [raw]);

  return <span ref={ref}>{raw}</span>;
}

/** FAQ accordion (first item open), used by <x-faq>. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((faq, i) => (
        <div key={i} data-reveal="stagger">
          <h3 className="m-0 text-base">
            <button
              type="button"
              className="group flex w-full items-center justify-between gap-6 py-6 text-left text-[1.05rem] font-semibold text-ink transition hover:text-brand"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-a-${i}`}
              id={`faq-q-${i}`}
            >
              <span>{faq.question.replace(/<[^>]*>/g, "")}</span>
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border transition duration-300", open === i ? "rotate-45 border-brand bg-brand text-white" : "border-line text-ink group-hover:border-brand/40")}>
                <Icon name="plus" className="size-4" />
              </span>
            </button>
          </h3>
          {/* Answers stay in the DOM (hidden) so crawlers and the FAQPage schema see the same content. */}
          <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={open !== i}>
            <div className="prose-content max-w-2xl pb-6 pr-12 text-[0.98rem] !text-ink-500" dangerouslySetInnerHTML={{ __html: faq.answer }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/*
 * Tabs that server components can compose: <TabGroup> holds the state, <TabButton>/<TabPanel> read it.
 * Inactive panels stay in the HTML (hidden) so all services remain crawlable.
 */
const TabContext = createContext<{ tab: string; setTab: (t: string) => void }>({ tab: "", setTab: () => {} });

export function TabGroup({ initial, children }: { initial: string; children: ReactNode }) {
  const [tab, setTab] = useState(initial);
  return <TabContext.Provider value={{ tab, setTab }}>{children}</TabContext.Provider>;
}

export function TabButton({ id, className, activeClass, inactiveClass, children }: { id: string; className: string; activeClass: string; inactiveClass: string; children: ReactNode }) {
  const { tab, setTab } = useContext(TabContext);
  return (
    <button type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn(className, tab === id ? activeClass : inactiveClass)}>
      {children}
    </button>
  );
}

export function TabPanel({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const { tab } = useContext(TabContext);
  return (
    <div role="tabpanel" hidden={tab !== id} className={cn(className, tab === id && "overlay-fade")}>
      {children}
    </div>
  );
}

/** Show/hide by the active tab without tab semantics (portfolio filter). */
export function TabFilter({ match, className, children }: { match: string; className?: string; children: ReactNode }) {
  const { tab } = useContext(TabContext);
  const visible = tab === "all" || tab === match;
  return (
    <div hidden={!visible} className={cn(className, visible && "overlay-fade")}>
      {children}
    </div>
  );
}
