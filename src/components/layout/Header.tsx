"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/basics";
import { useSite } from "@/components/runtime/site-context";
import type { MenuItem } from "@/lib/types";
import { cn, lines } from "@/lib/utils";

/** Reads the URL (dynamic routes stream this part); see the Suspense wrapper in app/layout.tsx. */
export function HeaderWithPathname() {
  return <Header pathname={usePathname()} />;
}

/** Port of components/header.blade.php: utility bar, mega menu, floating pill on scroll, mobile slide-over. */
export function Header({ pathname }: { pathname: string }) {
  const { layout } = useSite();
  const s = layout.settings;
  const items = layout.menus.main ?? [];
  const mobileItems = layout.menus.mobile ?? [];
  const hours = lines(s.business_hours)[0];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menu = useMenuIntent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMobile = (open: boolean) => {
    setMobileOpen(open);
    document.body.classList.toggle("overflow-hidden", open);
  };

  // Close the mobile menu and any dropdown after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (mobileOpen) setMobileOpen(false);
    if (menu.openIdx !== null) menu.close();
  }
  useEffect(() => {
    if (!mobileOpen) document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && toggleMobile(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (url: string | null) => {
    if (!url) return false;
    try {
      return new URL(url, "http://x").pathname.replace(/\/?$/, "/") === pathname.replace(/\/?$/, "/");
    } catch {
      return false;
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar (desktop): collapses once the visitor scrolls */}
      <div className={cn("hidden overflow-hidden bg-night text-[0.78rem] text-white/60 transition-all duration-300 lg:block", scrolled ? "max-h-0" : "max-h-10")}>
        <div className="container-x flex h-10 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {s.phone && (
              <a href={s.phone_href ?? undefined} className="flex items-center gap-2 transition hover:text-white">
                <Icon name="phone" className="size-3.5 text-teal-200" />
                {s.phone}
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`} className="flex items-center gap-2 transition hover:text-white">
                <Icon name="mail" className="size-3.5 text-teal-200" />
                {s.email}
              </a>
            )}
            {hours && (
              <span className="flex items-center gap-2">
                <Icon name="clock" className="size-3.5 text-teal-200" />
                {hours}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Free consultation — reply within 1 business day
            </span>
            {layout.socials.length > 0 && <span className="h-3.5 w-px bg-white/15" />}
            {layout.socials.map((so) => (
              <a key={so.url} href={so.url} target="_blank" rel="noopener me" className="text-white/50 transition hover:text-white" aria-label={capitalize(so.platform)}>
                <Icon name={so.icon} className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main bar: full-width at the top, becomes a floating frosted pill once scrolled (desktop) */}
      <div
        className={cn(
          "transition-[padding,background-color,border-color] duration-300",
          scrolled ? "border-b border-line/80 bg-white/85 backdrop-blur-xl lg:border-transparent lg:bg-transparent lg:px-4 lg:pt-3 lg:backdrop-blur-none" : "border-b border-line/60 bg-white",
        )}
      >
        <div
          className={cn(
            "mx-auto transition-[max-width,border-radius,box-shadow,background-color] duration-300",
            scrolled ? "lg:max-w-[1240px] lg:rounded-full lg:border lg:border-ink/[0.07] lg:bg-white/80 lg:shadow-[0_18px_40px_-20px_rgb(6_20_24/0.35)] lg:backdrop-blur-xl" : "max-w-full",
          )}
        >
          <nav className={cn("container-x relative flex h-[68px] items-center justify-between gap-3 transition-[height] duration-300 xl:gap-6", scrolled ? "lg:h-[62px] lg:px-2.5 lg:pl-6" : "lg:h-[76px]")} aria-label="Main">
            <Logo settings={s} />

            {/* Desktop navigation */}
            <ul className="hidden items-center gap-0.5 self-stretch whitespace-nowrap lg:flex" role="list">
              {items.map((item, i) =>
                item.children.length ? (
                  <DesktopDropdown key={i} item={item} index={i} menu={menu} phone={s.phone} phoneHref={s.phone_href} ctaHeading={s.footer_cta_heading} ctaText={s.footer_cta_text} />
                ) : (
                  <li key={i}>
                    <Link
                      href={item.url ?? "#"}
                      aria-current={isActive(item.url) ? "page" : undefined}
                      className={cn("block whitespace-nowrap rounded-full px-2.5 py-2 text-[0.875rem] font-medium transition xl:px-3.5 xl:text-[0.9rem]", isActive(item.url) ? "bg-mist text-ink" : "text-ink-700 hover:bg-mist hover:text-ink")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            <div className="flex items-center gap-2">
              <Link href="/search/" className="hidden size-10 place-items-center rounded-full text-ink-600 transition hover:bg-mist hover:text-ink sm:grid" aria-label="Search">
                <Icon name="search" className="size-[18px]" />
              </Link>
              <Link href="/contact/" className="btn btn-dark group hidden sm:inline-flex" data-enquiry="header">
                Get a free quote <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              <button type="button" className="grid size-11 place-items-center rounded-full border border-line text-ink lg:hidden" onClick={() => toggleMobile(true)} aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-nav">
                <Icon name="menu" className="size-5" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile navigation (slide-over) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-nav">
          <div className="overlay-fade absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => toggleMobile(false)} />
          <div className="slide-in-right absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-[68px] items-center justify-between border-b border-line px-5">
              <Logo settings={s} />
              <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => toggleMobile(false)} aria-label="Close menu">
                <Icon name="x" className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile">
              <form action="/search/" method="get" className="mb-4" role="search">
                <label htmlFor="m-search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
                  <input id="m-search" type="search" name="q" placeholder="Search services, guides…" className="form-input pl-11" />
                </div>
              </form>
              <ul className="grid gap-0.5" role="list">
                {mobileItems.map((item, i) => (
                  <MobileNavItem key={i} item={item} depth={0} onNavigate={() => toggleMobile(false)} />
                ))}
              </ul>
            </nav>
            <div className="grid gap-2 border-t border-line p-4">
              <button type="button" className="btn btn-primary btn-lg w-full" data-enquiry="mobile-menu" onClick={() => toggleMobile(false)}>
                Get a free quote
              </button>
              {s.phone && (
                <a href={s.phone_href ?? undefined} className="btn btn-secondary btn-lg w-full">
                  <Icon name="phone" className="size-4" /> {s.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Hover intent shared by all desktop dropdowns: a menu opens at once when none is open, but switching to
 * another menu needs a short pause on its button, and closing waits a moment.
 */
function useMenuIntent() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    openIdx,
    enter(i: number) {
      window.clearTimeout(timer.current);
      if (openIdx === null || openIdx === i) setOpenIdx(i);
      else timer.current = window.setTimeout(() => setOpenIdx(i), 150);
    },
    leave() {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpenIdx(null), 350);
    },
    toggle(i: number) {
      window.clearTimeout(timer.current);
      setOpenIdx((cur) => (cur === i ? null : i));
    },
    close() {
      window.clearTimeout(timer.current);
      setOpenIdx(null);
    },
  };
}

type MenuIntent = ReturnType<typeof useMenuIntent>;

function DesktopDropdown({
  item,
  index,
  menu,
  phone,
  phoneHref,
  ctaHeading,
  ctaText,
}: {
  item: MenuItem;
  index: number;
  menu: MenuIntent;
  phone: string | null;
  phoneHref: string | null;
  ctaHeading: string | null;
  ctaText: string | null;
}) {
  const open = menu.openIdx === index;
  const cols = Math.max(1, Math.min(3, item.children.length));

  return (
    <li
      className={cn("flex items-center self-stretch", item.mega ? "static" : "relative")}
      onMouseEnter={() => menu.enter(index)}
      onMouseLeave={menu.leave}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node) && open) menu.close();
      }}
    >
      <button
        type="button"
        className={cn(
          "flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[0.875rem] font-medium transition xl:px-3.5 xl:text-[0.9rem]",
          open ? "bg-mist text-brand font-semibold" : "text-ink-700 hover:bg-mist hover:text-ink"
        )}
        onClick={() => menu.toggle(index)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="whitespace-nowrap">{item.label}</span>
        <Icon
          name="chevron-down"
          className={cn("size-3.5 shrink-0 opacity-60 transition-transform duration-200", open && "rotate-180 text-brand")}
        />
      </button>

      {open && item.mega && (
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-[calc(50%-1.25rem)]" />
      )}

      {open &&
        (item.mega ? (
          <div className="overlay-fade absolute inset-x-4 top-full pt-3 sm:inset-x-6 lg:inset-x-8">
            <div className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-lift)] lg:grid-cols-[1fr_300px]">
              <div className="grid gap-x-10 gap-y-6 p-8" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {item.children.map((col, i) => (
                  <div key={i}>
                    {col.url ? (
                      <Link href={col.url} className="group mb-4 flex items-center justify-between border-b border-line pb-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-ink-500 hover:text-brand">
                        {col.label} <Icon name="arrow-right" className="size-3.5 transition group-hover:translate-x-0.5" />
                      </Link>
                    ) : (
                      <p className="mb-4 border-b border-line pb-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-ink-500">{col.label}</p>
                    )}
                    <ul className={cn("grid gap-x-4 gap-y-0.5", col.children.length > 6 && "xl:grid-cols-2")} role="list">
                      {col.children.map((link, j) => (
                        <li key={j}>
                          <Link href={link.url ?? "#"} className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-mist" {...(link.new_tab ? { target: "_blank", rel: "noopener" } : {})}>
                            {link.icon && (
                              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink-500 transition group-hover:border-brand/30 group-hover:text-brand">
                                <Icon name={link.icon} className="size-[17px]" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-[0.88rem] font-semibold text-ink">{link.label}</span>
                              {link.description && <span className="block truncate text-xs text-ink-500">{link.description}</span>}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="section-dark noise hidden p-8 lg:block">
                <div className="mesh">
                  <span className="-right-20 -top-20 size-72 bg-teal/35" />
                  <span className="-bottom-24 -left-16 size-64 bg-amber/20 [animation-delay:-7s]" />
                </div>
                <div className="relative flex h-full flex-col">
                  <span className="badge-pill w-max border-white/15 bg-white/10 text-amber">
                    <Icon name="sparkles" className="size-3.5" /> Free audit
                  </span>
                  <p className="mt-5 font-display text-[1.4rem] font-bold leading-tight tracking-[-0.03em] text-white">{ctaHeading || "Not sure where to start?"}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{ctaText || "Get a free consultation and a growth plan tailored to your business."}</p>
                  <div className="mt-auto pt-6">
                    <button type="button" className="btn btn-light w-full" data-enquiry="mega-menu">
                      Book a free consultation
                    </button>
                    {phone && (
                      <a href={phoneHref ?? undefined} className="mt-3 flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white">
                        <Icon name="phone" className="size-4" /> {phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CascadingDropdown item={item} index={index} menu={menu} onClose={menu.close} />
        ))}
    </li>
  );
}

/** Multi-level cascading flyout dropdown matching agency layout (Levels 1, 2, 3 side-by-side on hover). */
function CascadingDropdown({
  item,
  index,
  menu,
  onClose,
}: {
  item: MenuItem;
  index: number;
  menu: MenuIntent;
  onClose: () => void;
}) {
  const [activeL1, setActiveL1] = useState<number | null>(null);
  const [activeL2, setActiveL2] = useState<number | null>(null);

  const currentL1 = activeL1 !== null ? item.children[activeL1] : null;
  const hasL2 = Boolean(currentL1 && currentL1.children && currentL1.children.length > 0);

  const currentL2 = hasL2 && activeL2 !== null && currentL1 ? currentL1.children[activeL2] : null;
  const hasL3 = Boolean(currentL2 && currentL2.children && currentL2.children.length > 0);

  return (
    <div
      className="overlay-fade absolute left-0 top-full pt-1.5 z-50 flex items-start"
      onMouseEnter={() => menu.enter(index)}
      onMouseLeave={() => {
        setActiveL1(null);
        setActiveL2(null);
      }}
    >
      {/* Level 1 Panel */}
      <div className="min-w-[210px] w-max rounded-md border border-gray-200 bg-[#f8f9fa] shadow-xl overflow-hidden py-0">
        <ul role="list">
          {item.children.map((child, j) => {
            const isHovered = activeL1 === j;
            const hasChildren = child.children && child.children.length > 0;
            return (
              <li
                key={j}
                className="border-b border-gray-200/70 last:border-b-0"
                onMouseEnter={() => {
                  setActiveL1(j);
                  setActiveL2(null);
                }}
              >
                {hasChildren ? (
                  <Link
                    href={child.url ?? "#"}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 text-[0.92rem] font-medium transition-colors select-none gap-3",
                      isHovered ? "bg-white text-brand" : "text-ink-700 hover:bg-white hover:text-ink"
                    )}
                  >
                    <span>{child.label}</span>
                    <Icon
                      name="chevron-down"
                      className={cn(
                        "size-3.5 shrink-0 transition-colors",
                        isHovered ? "text-brand" : "text-ink-400"
                      )}
                    />
                  </Link>
                ) : (
                  <Link
                    href={child.url ?? "#"}
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-2.5 text-[0.92rem] font-medium text-ink-700 hover:bg-white hover:text-brand transition-colors"
                  >
                    <span>{child.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Level 2 Panel */}
      {hasL2 && currentL1 && (
        <div className="min-w-[230px] w-max -ml-[1px] rounded-md border border-gray-200 bg-[#f8f9fa] shadow-xl overflow-hidden py-0">
          <ul role="list">
            {currentL1.children.map((sub, k) => {
              const isSubHovered = activeL2 === k;
              const hasSubChildren = sub.children && sub.children.length > 0;
              return (
                <li
                  key={k}
                  className="border-b border-gray-200/70 last:border-b-0"
                  onMouseEnter={() => {
                    setActiveL2(k);
                  }}
                >
                  {hasSubChildren ? (
                    <Link
                      href={sub.url ?? "#"}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 text-[0.92rem] font-medium transition-colors select-none gap-4",
                        isSubHovered ? "bg-white text-brand" : "text-ink-700 hover:bg-white hover:text-ink"
                      )}
                    >
                      <span className="truncate">{sub.label}</span>
                      <Icon
                        name="chevron-down"
                        className={cn(
                          "size-3.5 shrink-0 transition-colors",
                          isSubHovered ? "text-brand" : "text-ink-400"
                        )}
                      />
                    </Link>
                  ) : (
                    <Link
                      href={sub.url ?? "#"}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-2.5 text-[0.92rem] font-medium text-ink-700 hover:bg-white hover:text-brand transition-colors"
                    >
                      <span>{sub.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Level 3 Panel */}
      {hasL3 && currentL2 && (
        <div className="min-w-[260px] w-max -ml-[1px] rounded-md border border-gray-200 bg-[#f8f9fa] shadow-xl overflow-hidden py-0">
          <ul role="list">
            {currentL2.children.map((leaf, m) => (
              <li key={m} className="border-b border-gray-200/70 last:border-b-0">
                <Link
                  href={leaf.url ?? "#"}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-2.5 text-[0.92rem] font-medium text-ink-700 hover:bg-white hover:text-brand transition-colors"
                >
                  <span>{leaf.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Recursive mobile navigation item that smoothly supports any depth of nesting. */
function MobileNavItem({
  item,
  depth = 0,
  onNavigate,
}: {
  item: MenuItem;
  depth?: number;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <li className="border-b border-line/50 last:border-0">
        <Link
          href={item.url ?? "#"}
          onClick={onNavigate}
          className={cn(
            "flex min-h-11 items-center px-2 py-2 text-[0.95rem] text-ink-700 hover:bg-mist transition-colors",
            depth > 0 && "pl-6 text-[0.9rem]"
          )}
        >
          {item.icon && <Icon name={item.icon} className="size-4 mr-2 text-brand" />}
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="border-b border-line/60 last:border-0">
      <div className="flex min-h-12 w-full items-center justify-between hover:bg-mist/40 transition-colors">
        <Link
          href={item.url ?? "#"}
          onClick={onNavigate}
          className={cn(
            "flex-1 px-2 py-3 font-semibold text-ink hover:text-brand transition-colors",
            depth === 0 ? "text-[1.02rem]" : "pl-6 text-[0.92rem] text-ink-800"
          )}
        >
          {item.label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="p-3 text-ink-500 hover:text-ink focus:outline-none"
          aria-label={`Toggle ${item.label}`}
        >
          <Icon
            name="chevron-down"
            className={cn("size-4 transition-transform duration-200", open && "rotate-180 text-brand")}
          />
        </button>
      </div>

      {open && (
        <ul className="bg-mist/40 py-1 pl-1 border-l-2 border-brand/30 ml-3 my-1 rounded-r-lg">
          {item.children.map((child, idx) => (
            <MobileNavItem key={idx} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}
