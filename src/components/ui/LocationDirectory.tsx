"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { LocationItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const REGION_BADGES: Record<string, string> = {
  noida: "Delhi NCR",
  delhi: "Delhi NCR",
  gurgaon: "Delhi NCR",
  "greater noida": "Delhi NCR",
  faridabad: "Delhi NCR",
  ghaziabad: "Delhi NCR",
  bangalore: "Tech Hub · Karnataka",
  mumbai: "Commercial Capital · Maharashtra",
  pune: "IT Hub · Maharashtra",
  hyderabad: "HITEC City · Telangana",
  chennai: "Automotive & SaaS · Tamil Nadu",
  ahmedabad: "Business Hub · Gujarat",
  kolkata: "East India HQ · West Bengal",
  jaipur: "Enterprise Hub · Rajasthan",
  lucknow: "North India Hub · Uttar Pradesh",
  chandigarh: "North Region · Punjab/Haryana",
  india: "National Headquarters",
  "los angeles": "West Coast HQ · California",
  "san diego": "Southern California · Tech",
  chicago: "Midwest Region · Illinois",
  dallas: "Central Tech Hub · Texas",
  australia: "Asia-Pacific Region",
};

const COUNTRY_CONFIG: Record<string, { flag: string; label: string }> = {
  all: { flag: "🌐", label: "All Hubs" },
  india: { flag: "🇮🇳", label: "India" },
  "united states": { flag: "🇺🇸", label: "United States" },
  australia: { flag: "🇦🇺", label: "Australia" },
};

export function LocationDirectory({
  locations,
  serviceName = "Website Development",
  eyebrow = "Global Presence · Local Expertise",
  title,
  subtitle,
}: {
  locations: LocationItem[];
  serviceName?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  const [activeCountry, setActiveCountry] = useState<string>("all");
  const [activeLetter, setActiveLetter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const list = useMemo(() => locations ?? [], [locations]);

  // Country tabs: the known ones first, then any other country added in the admin panel
  const countryTabs = useMemo(() => {
    const tabs = Object.entries(COUNTRY_CONFIG);
    const seen = new Set(Object.keys(COUNTRY_CONFIG));
    for (const loc of list) {
      const key = (loc.country || "").toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        tabs.push([key, { flag: getFlag(key), label: loc.country }]);
      }
    }
    return tabs;
  }, [list]);

  // Live counts per country
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: list.length };
    for (const loc of list) {
      const c = (loc.country || "").toLowerCase();
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }, [list]);

  // Active letters that have at least 1 city for current country selection
  const lettersWithCount = useMemo(() => {
    const pool =
      activeCountry === "all"
        ? list
        : list.filter((l) => (l.country || "").toLowerCase() === activeCountry.toLowerCase());

    const map = new Map<string, number>();
    for (const loc of pool) {
      const first = (loc.name || "").trim().charAt(0).toUpperCase();
      if (first) {
        map.set(first, (map.get(first) || 0) + 1);
      }
    }
    return map;
  }, [list, activeCountry]);

  const sortedLetters = useMemo(() => {
    return Array.from(lettersWithCount.keys()).sort();
  }, [lettersWithCount]);

  // Fall back to "ALL" if the selected letter is not present in the active country
  const currentLetter = activeLetter !== "ALL" && !lettersWithCount.has(activeLetter) ? "ALL" : activeLetter;

  // Filter locations by Country, Letter, and Search Query
  const filteredLocations = useMemo(() => {
    return list.filter((loc) => {
      const name = (loc.name || "").toLowerCase();
      const country = (loc.country || "").toLowerCase();
      const state = (loc.state || "").toLowerCase();
      const first = (loc.name || "").trim().charAt(0).toUpperCase();

      // Country filter
      if (activeCountry !== "all" && country !== activeCountry.toLowerCase()) {
        return false;
      }

      // Letter filter
      if (currentLetter !== "ALL" && first !== currentLetter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const inArea = (loc.areas ?? []).some((a) => a.name.toLowerCase().includes(q));
        const matches = name.includes(q) || country.includes(q) || state.includes(q) || inArea;
        if (!matches) return false;
      }

      return true;
    });
  }, [list, activeCountry, currentLetter, search]);

  // One section per country (same order as the tabs) when "All" is active
  const groupedByCountry = useMemo(
    () =>
      countryTabs
        .filter(([key]) => key !== "all")
        .map(([key, config]) => ({ key, ...config, cities: filteredLocations.filter((l) => (l.country || "").toLowerCase() === key) }))
        .filter((g) => g.cities.length > 0),
    [countryTabs, filteredLocations],
  );

  if (list.length === 0) return null;

  const defaultTitle = `${serviceName} Services Across Top Locations`;
  const defaultSubtitle = `Explore our dedicated ${serviceName.toLowerCase()} solutions tailored for businesses across India, North America, and Australia.`;

  return (
    <section className="py-7 sm:py-9 relative bg-gradient-to-b from-mist/50 via-white to-mist/40 border-t border-line/80" id="locations">
      <div className="container-x relative">
        {/* Header - Compact Spacing */}
        <div className="mx-auto max-w-3xl text-center mb-6" data-reveal="">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50/70 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand mb-2">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
            </span>
            {eyebrow}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">{title || defaultTitle}</h2>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-600/80 max-w-xl mx-auto">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Top Control Bar (Tabs + Search + A-Z pills) */}
        <div className="rounded-2xl border border-line bg-white p-3.5 sm:p-4 shadow-xs">
          {/* Main Controls Row */}
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Country Segmented Pills */}
            <div className="flex flex-wrap items-center gap-1 p-0.5 rounded-xl bg-mist/70 border border-line/60">
              {countryTabs.map(([key, config]) => {
                const isActive = activeCountry === key;
                const count = countryCounts[key] ?? 0;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveCountry(key);
                      setActiveLetter("ALL");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150",
                      isActive
                        ? "bg-white text-ink shadow-xs ring-1 ring-black/5"
                        : "text-ink-600 hover:text-ink hover:bg-white/60"
                    )}
                  >
                    <span>{config.flag}</span>
                    <span>{config.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[0.68rem] font-semibold",
                        isActive ? "bg-brand/10 text-brand" : "bg-black/5 text-ink-500"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative w-full lg:max-w-xs">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city, area or state..."
                className="w-full rounded-lg border border-line bg-mist/50 pl-8 pr-7 py-1.5 text-xs text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink"
                >
                  <Icon name="x" className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Minimalist A-Z Alphabet Filter Strip */}
          <div className="mt-2.5 pt-2.5 border-t border-line/60 flex flex-wrap items-center gap-1">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-ink-400 mr-1.5">
              Initial:
            </span>

            <button
              type="button"
              onClick={() => setActiveLetter("ALL")}
              className={cn(
                "rounded-md px-2 py-0.5 text-[0.72rem] font-bold transition",
                currentLetter === "ALL"
                  ? "bg-brand text-white shadow-xs"
                  : "bg-mist/60 text-ink-600 hover:bg-mist hover:text-ink"
              )}
            >
              All ({filteredLocations.length})
            </button>

            {sortedLetters.map((letter) => {
              const isSelected = currentLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setActiveLetter(letter)}
                  className={cn(
                    "size-6 rounded-md text-[0.72rem] font-bold transition flex items-center justify-center",
                    isSelected
                      ? "bg-brand text-white shadow-xs scale-105"
                      : "text-ink-700 hover:bg-brand-50 hover:text-brand"
                  )}
                >
                  {letter}
                </button>
              );
            })}

            {(currentLetter !== "ALL" || activeCountry !== "all" || search) && (
              <button
                type="button"
                onClick={() => {
                  setActiveCountry("all");
                  setActiveLetter("ALL");
                  setSearch("");
                }}
                className="ml-auto text-xs font-semibold text-brand hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-5">
          <div>
            {filteredLocations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
                <p className="text-sm font-bold text-ink">No matching location found</p>
                <p className="mt-1 text-xs text-ink-500">Try searching for a different city or reset the filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCountry("all");
                    setActiveLetter("ALL");
                    setSearch("");
                  }}
                  className="btn btn-dark btn-xs mt-3"
                >
                  Show all {list.length} locations
                </button>
              </div>
            ) : activeCountry === "all" && currentLetter === "ALL" && !search ? (
              /* COUNTRY → CITY VIEW */
              <div className="grid gap-6">
                {groupedByCountry.map((group, i) => (
                  <div key={group.key} className={cn(i > 0 && "border-t border-line/70 pt-5")}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{group.flag}</span>
                      <h3 className="font-display text-sm font-bold text-ink">{group.label} — Major Cities & Metros</h3>
                      <span className="text-xs text-ink-400">({group.cities.length} {group.cities.length === 1 ? "hub" : "hubs"})</span>
                    </div>

                    <CityGrid cities={group.cities} serviceName={serviceName} />
                  </div>
                ))}
              </div>
            ) : (
              /* FILTERED GRID */
              <CityGrid key={`${activeCountry}|${currentLetter}|${search}`} cities={filteredLocations} serviceName={serviceName} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getFlag(country: string | null | undefined) {
  const c = (country || "").toLowerCase();
  if (c === "india") return "🇮🇳";
  if (c === "australia") return "🇦🇺";
  if (c === "united states") return "🇺🇸";
  return "🌐";
}

/** Cities shown before "Show more". */
const CITY_PREVIEW = 4;

/** City cards; the ones past the preview stay in the HTML (crawlable links) and are only hidden. */
function CityGrid({ cities, serviceName }: { cities: LocationItem[]; serviceName: string }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cities.map((loc, i) => (
          <CityCard key={loc.url + loc.name} loc={loc} serviceName={serviceName} hidden={!showAll && i >= CITY_PREVIEW} />
        ))}
      </div>
      {cities.length > CITY_PREVIEW && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className="btn btn-secondary group">
            {showAll ? "Show less" : "Show more"}
            <Icon name="chevron-down" className={cn("size-4 transition-transform", showAll && "rotate-180")} />
          </button>
        </div>
      )}
    </>
  );
}

/** Area links shown in a card before "+ more". */
const AREA_PREVIEW = 4;

function CityCard({ loc, serviceName, hidden }: { loc: LocationItem; serviceName: string; hidden?: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const badge = REGION_BADGES[loc.name.toLowerCase()] || [loc.state, loc.country].filter(Boolean).join(" · ");
  const areas = loc.areas ?? [];
  const visibleAreas = showAll ? areas : areas.slice(0, AREA_PREVIEW);

  return (
    <div
      hidden={hidden}
      onMouseLeave={() => setShowAll(false)}
      className="group relative hover:z-40 focus-within:z-40"
    >
      {/* Compact City Name Trigger */}
      <Link
        href={loc.url}
        className="flex items-center justify-between gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 transition-all duration-200 group-hover:border-brand/50 group-hover:bg-brand-50/20 group-hover:shadow-sm"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand transition-colors duration-200 group-hover:bg-brand group-hover:text-white">
            <Icon name="map-pin" className="size-3.5" />
          </div>
          <h4 className="truncate font-display text-[0.92rem] font-bold text-ink transition-colors group-hover:text-brand">
            {loc.name}
          </h4>
        </div>
        <Icon
          name="chevron-down"
          className="size-3.5 shrink-0 text-ink-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-brand"
        />
      </Link>

      {/* Hover Popover Box with Other Details */}
      <div className="pointer-events-none invisible absolute left-0 right-0 top-full z-40 pt-1.5 opacity-0 translate-y-1 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-xl border border-brand/25 bg-white p-3.5 shadow-[var(--shadow-lift)] ring-1 ring-black/5">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[0.65rem] font-semibold text-ink-600">
              <span>{getFlag(loc.country)}</span>
              {loc.country}
            </span>
            <span className="text-[0.62rem] font-bold text-teal tracking-wide uppercase">
              {loc.type || "City"}
            </span>
          </div>

          {/* Region / Subtitle */}
          {badge && (
            <p className="text-[0.72rem] font-medium text-ink-500 leading-snug truncate">
              {badge}
            </p>
          )}

          {/* City → areas: this service's page in each area */}
          {areas.length > 0 ? (
            <div className="mt-2.5">
              <p className="text-[0.62rem] font-bold uppercase tracking-wide text-ink-500">Areas in {loc.name}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1" role="list">
                {visibleAreas.map((area) => (
                  <li key={area.slug} className="max-w-full">
                    <Link
                      href={area.url}
                      className="inline-flex max-w-full items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-[0.68rem] font-semibold text-brand transition hover:bg-brand hover:text-white"
                    >
                      <Icon name="map-pin" className="size-3 shrink-0" />
                      <span className="truncate">{area.name}</span>
                    </Link>
                  </li>
                ))}
                {areas.length > AREA_PREVIEW && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setShowAll((v) => !v)}
                      aria-expanded={showAll}
                      className="rounded-md px-2 py-1 text-[0.68rem] font-bold text-brand hover:underline"
                    >
                      {showAll ? "Show less" : `+${areas.length - AREA_PREVIEW} more`}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            /* Quick preview of top created pages for this location */
            loc.pages && loc.pages.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {loc.pages.slice(0, 2).map((pg) => (
                  <Link
                    key={pg.url}
                    href={pg.url}
                    className="truncate max-w-full rounded-md bg-mist/70 px-1.5 py-0.5 text-[0.64rem] font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand"
                    title={pg.title}
                  >
                    {pg.service || pg.title}
                  </Link>
                ))}
              </div>
            )
          )}

          {/* Footer Link */}
          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/60 pt-2 text-[0.72rem] font-semibold text-ink-600">
            <Link href={loc.url} className="truncate transition-colors hover:text-brand">
              {serviceName} in {loc.name}
            </Link>
            <Icon name="arrow-right" className="size-3.5 shrink-0 text-brand" />
          </div>
        </div>
      </div>
    </div>
  );
}
