"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Responsive multi-card layout:
 * - Tablet & Desktop (sm+): renders standard multi-column grid untouched.
 * - Mobile (< 640px): renders cards inside a pure GPU-composited transform slider
 *   (no native scroll-snap fighting) with slow ease-out-expo transitions, 5.2s interval,
 *   touch swipe support, and an interactive floating Card Dock.
 */
export function MobileCardCarousel({
  children,
  gridClassName,
  leadingSlot,
  dark = false,
  intervalMs = 5200,
  resetKey,
  as = "div",
  slideClassName = "",
}: {
  children: ReactNode;
  gridClassName: string;
  leadingSlot?: ReactNode;
  dark?: boolean;
  intervalMs?: number;
  resetKey?: string | number;
  as?: "div" | "ul" | "ol";
  slideClassName?: string;
}) {
  const items = Children.toArray(children).filter(Boolean);
  const total = items.length;
  const wrapRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setActive(0);
  }
  const safeActive = active < total ? active : 0;

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const resumeTimerRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; lock: "x" | "y" | null } | null>(null);
  const pageScrollingRef = useRef(false);
  const pageScrollTimerRef = useRef<number>(0);

  const Tag = as;

  const goTo = useCallback(
    (idx: number) => {
      if (total <= 1) return;
      setActive(((idx % total) + total) % total);
    },
    [total],
  );

  const pauseTemporarily = useCallback((delay = 8000) => {
    setPaused(true);
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setPaused(false), delay);
  }, []);

  // Only auto-advance while visible on screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause auto-advance briefly while the user is actively scrolling the page vertically
  useEffect(() => {
    const onScroll = () => {
      pageScrollingRef.current = true;
      window.clearTimeout(pageScrollTimerRef.current);
      pageScrollTimerRef.current = window.setTimeout(() => {
        pageScrollingRef.current = false;
      }, 650);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(pageScrollTimerRef.current);
    };
  }, []);

  // Slow, calm GPU-accelerated auto-advance on mobile (< 640px)
  useEffect(() => {
    if (total <= 1 || paused || !visible || dragging) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(max-width: 639px)").matches) return;

    const timer = window.setInterval(() => {
      if (pageScrollingRef.current) return;
      setActive((prev) => (prev + 1) % total);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [total, paused, visible, dragging, intervalMs]);

  useEffect(() => {
    return () => window.clearTimeout(resumeTimerRef.current);
  }, []);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY, lock: null };
    setDragging(true);
    pauseTemporarily(8500);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const t = e.touches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (!start.lock) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      start.lock = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    }

    if (start.lock === "y") {
      setDragging(false);
      setDragX(0);
      return;
    }

    // Dampen rubber-band edges on first/last slide
    const isEdge = (safeActive === 0 && dx > 0) || (safeActive === total - 1 && dx < 0);
    setDragX(isEdge ? dx * 0.25 : dx);
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    setDragging(false);
    if (start?.lock === "x") {
      if (dragX <= -38) {
        goTo(safeActive + 1);
      } else if (dragX >= 38) {
        goTo(safeActive - 1);
      }
    }
    setDragX(0);
  };

  if (total <= 1) {
    return (
      <Tag className={gridClassName} role={as !== "div" ? "list" : undefined}>
        {leadingSlot}
        {items}
      </Tag>
    );
  }

  return (
    <>
      {/* Tablet & Desktop: untouched multi-column grid */}
      <Tag className={cn("hidden sm:grid", gridClassName)} role={as !== "div" ? "list" : undefined}>
        {leadingSlot}
        {items}
      </Tag>

      {/* Mobile (< 640px): single-card GPU transform carousel + interactive dock */}
      <div className="w-full min-w-0 sm:hidden" ref={wrapRef}>
        {leadingSlot && <div className="mb-4">{leadingSlot}</div>}

        <div
          className={cn("mobile-carousel-track -mx-1 overflow-hidden pb-1 touch-pan-y", slideClassName)}
          aria-roledescription="carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div
            className="flex will-change-transform"
            style={{
              transform: `translate3d(calc(-${safeActive * 100}% + ${dragX}px), 0, 0)`,
              transition: dragging ? "none" : "transform 780ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {items.map((child, idx) => (
              <div key={idx} className="w-full min-w-0 shrink-0 px-1 [&>*]:h-full">
                {child}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Card Dock */}
        <div className="mt-4 flex items-center justify-center">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-xs",
              dark
                ? "border-white/15 bg-night-800/95 text-white"
                : "border-line bg-white text-ink",
            )}
          >
            <button
              type="button"
              onClick={() => {
                pauseTemporarily();
                goTo(safeActive - 1);
              }}
              aria-label="Previous card"
              className={cn(
                "grid size-7 place-items-center rounded-full transition",
                dark ? "text-white/80 hover:bg-white/10" : "text-ink-600 hover:bg-mist",
              )}
            >
              <Icon name="chevron-right" className="size-3.5 rotate-180" />
            </button>

            <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label="Slide navigation">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={safeActive === i}
                  aria-label={`Slide ${i + 1} of ${total}`}
                  onClick={() => {
                    pauseTemporarily();
                    goTo(i);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    safeActive === i
                      ? cn("w-5", dark ? "bg-teal-200" : "bg-brand")
                      : cn("w-2", dark ? "bg-white/25" : "bg-line"),
                  )}
                />
              ))}
            </div>

            <span
              className={cn(
                "px-1 text-[0.7rem] font-bold tabular-nums",
                dark ? "text-white/60" : "text-ink-500",
              )}
            >
              {safeActive + 1}/{total}
            </span>

            <button
              type="button"
              onClick={() => {
                pauseTemporarily();
                goTo(safeActive + 1);
              }}
              aria-label="Next card"
              className={cn(
                "grid size-7 place-items-center rounded-full transition",
                dark ? "text-white/80 hover:bg-white/10" : "text-ink-600 hover:bg-mist",
              )}
            >
              <Icon name="chevron-right" className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
