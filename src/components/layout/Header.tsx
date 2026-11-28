"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const items = useMemo(() => organizeMenuItems(layout.menus.main ?? [], layout.menus.footer_development ?? []), [layout.menus.main, layout.menus.footer_development]);
  const mobileItems = useMemo(() => organizeMenuItems(layout.menus.mobile ?? [], layout.menus.footer_development ?? []), [layout.menus.mobile, layout.menus.footer_development]);
  const hours = lines(s.business_hours)[0];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menu = useMenuIntent();

  const scrolledRef = useRef(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = window.scrollY;
      const next = scrolledRef.current ? y > 12 : y > 28;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
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
    <header className="sticky top-0 z-50 h-[68px] lg:h-[110px] pointer-events-none">
      <div
        className={cn(
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled ? "lg:-translate-y-[30px]" : "lg:translate-y-0",
        )}
      >
        {/* Utility bar (desktop): glides out with GPU transform/opacity instead of layout-thrashing max-height */}
        <div
          className={cn(
            "hidden h-10 bg-night text-[0.78rem] text-white/60 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
            scrolled ? "pointer-events-none -translate-y-2.5 opacity-0" : "pointer-events-auto translate-y-0 opacity-100",
          )}
        >
          <div className="container-x flex h-10 items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {s.phone && (
                <a href={s.phone_href ?? undefined} className="flex items-center gap-2 transition-colors hover:text-white">
                  <Icon name="phone" className="size-3.5 text-teal-200" />
                  {s.phone}
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="flex items-center gap-2 transition-colors hover:text-white">
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
                <a key={so.url} href={so.url} target="_blank" rel="noopener me" className="text-white/50 transition-colors hover:text-white" aria-label={capitalize(so.platform)}>
                  <Icon name={so.icon} className="size-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Main bar: omit max-width from CSS transitions to prevent scroll-start layout reflows */}
        <div
          className={cn(
            "pointer-events-auto mx-auto transition-[border-radius,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "max-w-[100vw] border-b border-line/80 bg-white/[0.98] shadow-[0_10px_28px_-14px_rgb(6_20_24/0.18)] lg:max-w-[min(1240px,calc(100vw-2rem))] lg:rounded-[35px] lg:border lg:border-ink/[0.08] lg:bg-white/[0.98] lg:shadow-[0_16px_36px_-16px_rgb(6_20_24/0.26)]"
              : "max-w-[100vw] rounded-none border-b border-line/60 bg-white shadow-none",
          )}
        >
          <nav className="container-x relative flex h-[68px] items-center justify-between gap-3 lg:h-[70px] xl:gap-6" aria-label="Main">
              <Logo settings={s} />

              {/* Desktop navigation */}
              <ul className="hidden items-center gap-0.5 self-stretch whitespace-nowrap lg:flex" role="list">
                {items.map((item, i) =>
                  item.children.length ? (
                    <DesktopDropdown key={i} item={item} index={i} menu={menu} phone={s.phone} phoneHref={s.phone_href} ctaHeading={s.footer_cta_heading} ctaText={s.footer_cta_text} />
                  ) : (
                    <li key={i} className="flex items-center" onMouseEnter={menu.close}>
                      <Link
                        href={item.url ?? "#"}
                        aria-current={isActive(item.url) ? "page" : undefined}
                        className={cn(
                          "block whitespace-nowrap rounded-full px-2.5 py-2 text-[0.875rem] font-medium transition-colors duration-150 xl:px-3.5 xl:text-[0.9rem]",
                          isActive(item.url) ? "bg-mist text-ink" : "text-ink-700 hover:bg-mist hover:text-ink",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>

              <div className="flex items-center gap-2" onMouseEnter={menu.close}>
                <Link href="/search/" className="hidden size-10 place-items-center rounded-full text-ink-600 transition-colors duration-150 hover:bg-mist hover:text-ink sm:grid" aria-label="Search">
                  <Icon name="search" className="size-[18px]" />
                </Link>
                <Link href="/contact/" className="btn btn-dark group hidden sm:inline-flex" data-enquiry="header">
                  Get a free quote <Icon name="arrow-right" className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
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
        <div className="pointer-events-auto fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-nav">
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

function organizeMenuItems(rawItems: MenuItem[], devChildren: MenuItem[] = []): MenuItem[] {
  return rawItems.map((item) => {
    const label = item.label?.trim().toLowerCase();
    const url = item.url?.trim().replace(/\/$/, "");
    if ((label === "development" || url === "/development") && item.children.length === 0 && devChildren.length > 0) {
      return { ...item, mega: false, children: devChildren };
    }
    return item;
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Hover intent shared by all desktop dropdowns: immediate open when hovering any top-level button,
 * and a short grace period on leave so diagonal cursor movement into the panel never drops the menu.
 */
function useMenuIntent() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    openIdx,
    enter(i: number) {
      window.clearTimeout(timer.current);
      setOpenIdx(i);
    },
    leave() {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpenIdx(null), 160);
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
          "flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[0.875rem] font-medium transition-colors duration-150 xl:px-3.5 xl:text-[0.9rem]",
          open ? "bg-mist text-brand" : "text-ink-700 hover:bg-mist hover:text-ink"
        )}
        onClick={() => menu.toggle(index)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="whitespace-nowrap">{item.label}</span>
        <Icon
          name="chevron-down"
          className={cn("size-3.5 shrink-0 opacity-60 transition-transform duration-200 ease-out", open && "rotate-180 text-brand opacity-100")}
        />
      </button>

      {open && item.mega && (
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-[calc(50%-1.25rem)]" />
      )}

      {item.mega ? (
        <div
          aria-hidden={!open}
          className={cn(
            "absolute inset-x-4 top-full z-50 mx-auto max-w-[980px] pt-2 sm:inset-x-6 lg:inset-x-8 origin-top will-change-[opacity,transform] transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open
              ? "visible translate-y-0 scale-100 opacity-100 pointer-events-auto"
              : "invisible -translate-y-1.5 scale-[0.985] opacity-0 pointer-events-none",
          )}
        >
          <div className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-lift)] lg:grid-cols-[1fr_220px]">
            <div className="grid max-h-[calc(100vh-110px)] gap-x-6 gap-y-3 overflow-y-auto px-5 py-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {item.children.map((col, i) => (
                <div key={i}>
                  {col.url ? (
                    <Link href={col.url} onClick={menu.close} className="group mb-2 flex items-center justify-between border-b border-line pb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-500 transition-colors hover:text-brand">
                      {col.label} <Icon name="arrow-right" className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <p className="mb-2 border-b border-line pb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-500">{col.label}</p>
                  )}
                  <ul className={cn("grid gap-x-2 gap-y-0.5", col.children.length > 6 && "lg:grid-cols-2")} role="list">
                    {col.children.map((link, j) => (
                      <li key={j}>
                        <Link href={link.url ?? "#"} onClick={menu.close} className="group flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors duration-150 hover:bg-mist" {...(link.new_tab ? { target: "_blank", rel: "noopener" } : {})}>
                          {link.icon && (
                            <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line bg-white text-ink-500 transition-colors duration-150 group-hover:border-brand/30 group-hover:text-brand">
                              <Icon name={link.icon} className="size-3.5" />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-[0.76rem] font-semibold leading-tight text-ink transition-colors duration-150 group-hover:text-brand">{link.label}</span>
                            {link.description && <span className="block truncate text-[0.65rem] leading-tight text-ink-500">{link.description}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="section-dark noise hidden p-4 lg:block">
              <div className="mesh">
                <span className="-right-20 -top-20 size-52 bg-teal/35" />
                <span className="-bottom-24 -left-16 size-48 bg-amber/20" />
              </div>
              <div className="relative flex h-full flex-col">
                <span className="badge-pill w-max border-white/15 bg-white/10 px-2.5 py-0.5 text-[0.68rem] text-amber">
                  <Icon name="sparkles" className="size-3" /> Free audit
                </span>
                <p className="mt-3 font-display text-[1.02rem] font-bold leading-snug tracking-[-0.02em] text-white">{ctaHeading || "Not sure where to start?"}</p>
                <p className="mt-1.5 text-[0.74rem] leading-relaxed text-white/60">{ctaText || "Get a free consultation and a growth plan tailored to your business."}</p>
                <div className="mt-auto pt-4">
                  <button type="button" className="btn btn-light w-full py-2 text-xs" data-enquiry="mega-menu" onClick={menu.close}>
                    Book a free consultation
                  </button>
                  {phone && (
                    <a href={phoneHref ?? undefined} className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/60 transition-colors hover:text-white">
                      <Icon name="phone" className="size-3.5" /> {phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CascadingDropdown item={item} index={index} open={open} menu={menu} onClose={menu.close} />
      )}
    </li>
  );
}

/** Multi-level cascading flyout dropdown matching agency layout (Levels 1, 2, 3 side-by-side on hover). */
function CascadingDropdown({
  item,
  index,
  open,
  menu,
  onClose,
}: {
  item: MenuItem;
  index: number;
  open: boolean;
  menu: MenuIntent;
  onClose: () => void;
}) {
  const [activeL1, setActiveL1] = useState<number | null>(null);
  const [activeL2, setActiveL2] = useState<number | null>(null);

  const currentL1 = open && activeL1 !== null ? item.children[activeL1] : null;
  const hasL2 = Boolean(currentL1 && currentL1.children && currentL1.children.length > 0);

  const currentL2 = hasL2 && activeL2 !== null && currentL1 ? currentL1.children[activeL2] : null;
  const hasL3 = Boolean(currentL2 && currentL2.children && currentL2.children.length > 0);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "absolute left-0 top-full z-50 flex items-start pt-2.5 origin-top-left will-change-[opacity,transform] transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        open
          ? "visible translate-y-0 scale-100 opacity-100 pointer-events-auto"
          : "invisible -translate-y-1.5 scale-[0.985] opacity-0 pointer-events-none",
      )}
      onMouseEnter={() => menu.enter(index)}
      onMouseLeave={() => {
        setActiveL1(null);
        setActiveL2(null);
      }}
    >
      {/* Level 1 Panel */}
      <div className="min-w-[220px] w-max overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lift)]">
        <ul role="list" className="grid gap-0.5">
          {item.children.map((child, j) => {
            const isHovered = activeL1 === j;
            const hasChildren = child.children && child.children.length > 0;
            return (
              <li
                key={j}
                onMouseEnter={() => {
                  if (activeL1 !== j) {
                    setActiveL1(j);
                    setActiveL2(null);
                  }
                }}
              >
                {hasChildren ? (
                  <Link
                    href={child.url ?? "#"}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium transition-colors duration-150 select-none",
                      isHovered ? "bg-mist text-brand" : "text-ink-700 hover:bg-mist hover:text-ink"
                    )}
                  >
                    <span>{child.label}</span>
                    <Icon
                      name="chevron-right"
                      className={cn(
                        "size-3.5 shrink-0 transition-transform duration-150",
                        isHovered ? "translate-x-0.5 text-brand" : "text-ink-400"
                      )}
                    />
                  </Link>
                ) : (
                  <Link
                    href={child.url ?? "#"}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium text-ink-700 transition-colors duration-150 hover:bg-mist hover:text-brand"
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
        <div className="ml-1.5 min-w-[230px] w-max overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lift)] overlay-fade">
          <ul role="list" className="grid gap-0.5">
            {currentL1.children.map((sub, k) => {
              const isSubHovered = activeL2 === k;
              const hasSubChildren = sub.children && sub.children.length > 0;
              return (
                <li
                  key={k}
                  onMouseEnter={() => {
                    if (activeL2 !== k) setActiveL2(k);
                  }}
                >
                  {hasSubChildren ? (
                    <Link
                      href={sub.url ?? "#"}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium transition-colors duration-150 select-none",
                        isSubHovered ? "bg-mist text-brand" : "text-ink-700 hover:bg-mist hover:text-ink"
                      )}
                    >
                      <span className="truncate">{sub.label}</span>
                      <Icon
                        name="chevron-right"
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-150",
                          isSubHovered ? "translate-x-0.5 text-brand" : "text-ink-400"
                        )}
                      />
                    </Link>
                  ) : (
                    <Link
                      href={sub.url ?? "#"}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium text-ink-700 transition-colors duration-150 hover:bg-mist hover:text-brand"
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
        <div className="ml-1.5 min-w-[250px] w-max overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lift)] overlay-fade">
          <ul role="list" className="grid gap-0.5">
            {currentL2.children.map((leaf, m) => (
              <li key={m}>
                <Link
                  href={leaf.url ?? "#"}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium text-ink-700 transition-colors duration-150 hover:bg-mist hover:text-brand"
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
