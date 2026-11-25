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
  const [selectedLocName, setSelectedLocName] = useState<string | null>(null);

  const list = useMemo(() => locations ?? [], [locations]);

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
        const matches = name.includes(q) || country.includes(q) || state.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [list, activeCountry, currentLetter, search]);

  // Split into India vs International for clean sectioning when "All" is active
  const groupedByRegion = useMemo(() => {
    const indiaList = filteredLocations.filter((l) => (l.country || "").toLowerCase() === "india");
    const globalList = filteredLocations.filter((l) => (l.country || "").toLowerCase() !== "india");
    return { india: indiaList, global: globalList };
  }, [filteredLocations]);

  // All India & USA/Global locations for the side panel
  const allRegionGroups = useMemo(() => {
    const india = list.filter((l) => (l.country || "").toLowerCase() === "india");
    const usa = list.filter((l) => (l.country || "").toLowerCase() === "united states");
    const other = list.filter((l) => {
      const c = (l.country || "").toLowerCase();
      return c !== "india" && c !== "united states";
    });
    return { india, usa, global: [...usa, ...other] };
  }, [list]);

  // Selected location for the side panel
  const selectedLoc = useMemo(() => {
    if (selectedLocName) {
      const found = list.find((l) => l.name.toLowerCase() === selectedLocName.toLowerCase());
      if (found) return found;
    }
    if (activeCountry === "united states") {
      return (
        filteredLocations.find((l) => l.name.toLowerCase() === "los angeles") ??
        filteredLocations[0] ??
        allRegionGroups.usa[0] ??
        list[0]
      );
    }
    return (
      filteredLocations.find((l) => l.name.toLowerCase() === "noida") ??
      filteredLocations[0] ??
      allRegionGroups.india[0] ??
      list[0]
    );
  }, [selectedLocName, activeCountry, filteredLocations, allRegionGroups, list]);

  if (list.length === 0) return null;

  const defaultTitle = `${serviceName} Services Across Top Locations`;
  const defaultSubtitle = `Explore our dedicated ${serviceName.toLowerCase()} solutions tailored for businesses across India, North America, and Australia.`;

  return (
    <section className="py-7 sm:py-9 relative overflow-hidden bg-gradient-to-b from-mist/50 via-white to-mist/40 border-t border-line/80" id="locations">
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
              {Object.entries(COUNTRY_CONFIG).map(([key, config]) => {
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
                placeholder="Search city or state..."
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

        {/* Content Area + Side Panel */}
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_370px] lg:items-start">
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
              /* DUAL REGION VIEW */
              <div className="grid gap-6">
                {/* India Section */}
                {groupedByRegion.india.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🇮🇳</span>
                      <h3 className="font-display text-sm font-bold text-ink">India — Major Cities & Metros</h3>
                      <span className="text-xs text-ink-400">({groupedByRegion.india.length} hubs)</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {groupedByRegion.india.map((loc) => (
                        <CityCard
                          key={loc.url + loc.name}
                          loc={loc}
                          serviceName={serviceName}
                          isSelected={selectedLoc?.name === loc.name}
                          onSelect={() => setSelectedLocName(loc.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* International Section */}
                {groupedByRegion.global.length > 0 && (
                  <div className="border-t border-line/70 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🇺🇸</span>
                      <h3 className="font-display text-sm font-bold text-ink">United States & International Hubs</h3>
                      <span className="text-xs text-ink-400">({groupedByRegion.global.length} hubs)</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {groupedByRegion.global.map((loc) => (
                        <CityCard
                          key={loc.url + loc.name}
                          loc={loc}
                          serviceName={serviceName}
                          isSelected={selectedLoc?.name === loc.name}
                          onSelect={() => setSelectedLocName(loc.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* FILTERED GRID */
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredLocations.map((loc) => (
                  <CityCard
                    key={loc.url + loc.name}
                    loc={loc}
                    serviceName={serviceName}
                    isSelected={selectedLoc?.name === loc.name}
                    onSelect={() => setSelectedLocName(loc.name)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right-hand Side Panel: Selected City Pages + India & USA Location Pages Index */}
          <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start" aria-label="Created location pages">
            {selectedLoc && (
              <div className="rounded-2xl border border-brand/25 bg-white p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-start justify-between gap-2 border-b border-line pb-3">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand">
                      {getFlag(selectedLoc.country)} {selectedLoc.country} · Created Pages
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-bold text-ink">{selectedLoc.name}</h3>
                    {selectedLoc.state && selectedLoc.state !== selectedLoc.name && (
                      <p className="text-[0.72rem] text-ink-500">{selectedLoc.state}</p>
                    )}
                  </div>
                  <Link
                    href={selectedLoc.url}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand px-2.5 py-1 text-[0.7rem] font-bold text-white transition hover:bg-brand-600"
                  >
                    Open <Icon name="arrow-up-right" className="size-3" />
                  </Link>
                </div>

                <ul className="mt-3 grid max-h-[260px] gap-1.5 overflow-y-auto pr-1" role="list">
                  {(selectedLoc.pages && selectedLoc.pages.length > 0
                    ? selectedLoc.pages
                    : [{ title: selectedLoc.title || `${serviceName} in ${selectedLoc.name}`, url: selectedLoc.url, is_dedicated: true }]
                  ).map((pg) => (
                    <li key={pg.url}>
                      <Link
                        href={pg.url}
                        className="group flex items-center justify-between gap-2 rounded-lg border border-line/70 bg-mist/40 px-2.5 py-2 text-xs transition hover:border-brand/40 hover:bg-brand-50/50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink group-hover:text-brand">{pg.title}</span>
                          <span className="block truncate text-[0.65rem] text-ink-500">{pg.url}</span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold uppercase",
                            pg.is_dedicated ? "bg-teal/15 text-teal-700" : "bg-ink/5 text-ink-500",
                          )}
                        >
                          {pg.is_dedicated ? "Published" : "Live"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Directory: India & USA Location Pages */}
            <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-500">
                India &amp; USA Location Pages
              </p>

              {allRegionGroups.india.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-ink">
                    <span>🇮🇳 India ({allRegionGroups.india.length})</span>
                  </div>
                  <ul className="grid max-h-[180px] gap-1 overflow-y-auto pr-1" role="list">
                    {allRegionGroups.india.map((loc) => (
                      <li key={`side-in-${loc.name}`} className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLocName(loc.name)}
                          className={cn(
                            "flex-1 truncate rounded-md px-2 py-1 text-left text-xs font-medium transition",
                            selectedLoc?.name === loc.name
                              ? "bg-brand-50 font-bold text-brand"
                              : "text-ink-700 hover:bg-mist hover:text-ink",
                          )}
                        >
                          {loc.name}
                          {loc.pages && loc.pages.length > 0 && (
                            <span className="ml-1 text-[0.65rem] text-ink-400">({loc.pages.length})</span>
                          )}
                        </button>
                        <Link
                          href={loc.url}
                          className="shrink-0 rounded px-1.5 py-0.5 text-[0.68rem] font-semibold text-brand hover:bg-brand-50"
                          title={loc.title || loc.name}
                        >
                          View →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {allRegionGroups.global.length > 0 && (
                <div className="mt-3.5 border-t border-line pt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-ink">
                    <span>🇺🇸 USA &amp; Global ({allRegionGroups.global.length})</span>
                  </div>
                  <ul className="grid gap-1" role="list">
                    {allRegionGroups.global.map((loc) => (
                      <li key={`side-us-${loc.name}`} className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLocName(loc.name)}
                          className={cn(
                            "flex-1 truncate rounded-md px-2 py-1 text-left text-xs font-medium transition",
                            selectedLoc?.name === loc.name
                              ? "bg-brand-50 font-bold text-brand"
                              : "text-ink-700 hover:bg-mist hover:text-ink",
                          )}
                        >
                          {getFlag(loc.country)} {loc.name}
                          {loc.pages && loc.pages.length > 0 && (
                            <span className="ml-1 text-[0.65rem] text-ink-400">({loc.pages.length})</span>
                          )}
                        </button>
                        <Link
                          href={loc.url}
                          className="shrink-0 rounded px-1.5 py-0.5 text-[0.68rem] font-semibold text-brand hover:bg-brand-50"
                          title={loc.title || loc.name}
                        >
                          View →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function getFlag(country: string | null | undefined) {
  const c = (country || "").toLowerCase();
  if (c === "india") return "🇮🇳";
  if (c === "australia") return "🇦🇺";
  return "🇺🇸";
}

function CityCard({
  loc,
  serviceName,
  isSelected,
  onSelect,
}: {
  loc: LocationItem;
  serviceName: string;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const badge = REGION_BADGES[loc.name.toLowerCase()] || [loc.state, loc.country].filter(Boolean).join(" · ");
  const pageCount = loc.pages?.length ?? 0;

  return (
    <div
      onMouseEnter={onSelect}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border bg-white p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
        isSelected ? "border-brand/60 ring-2 ring-brand/10" : "border-line hover:border-brand/40",
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[0.65rem] font-semibold text-ink-600">
            <span>{getFlag(loc.country)}</span>
            {loc.country}
          </span>
          <span className="text-[0.62rem] font-bold text-teal tracking-wide uppercase">
            {pageCount > 0 ? `${pageCount} pages` : loc.type || "City"}
          </span>
        </div>

        {/* City Info with sleek Map Pin icon */}
        <Link href={loc.url} className="flex items-start gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand mt-0.5 group-hover:bg-brand group-hover:text-white transition-colors duration-200">
            <Icon name="map-pin" className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-[0.92rem] font-bold text-ink transition-colors group-hover:text-brand truncate">
              {loc.name}
            </h4>
            <p className="mt-0.5 text-[0.7rem] text-ink-500 leading-snug truncate">
              {badge}
            </p>
          </div>
        </Link>

        {/* Quick preview of top created pages for this location */}
        {loc.pages && loc.pages.length > 0 && (
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
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2 text-[0.72rem] font-semibold text-ink-600">
        <Link href={loc.url} className="truncate transition-colors hover:text-brand">
          {serviceName} in {loc.name}
        </Link>
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            className="shrink-0 text-[0.65rem] font-bold text-brand hover:underline"
          >
            Pages
          </button>
        )}
      </div>
    </div>
  );
}
