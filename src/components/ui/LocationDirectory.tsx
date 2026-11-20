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

        {/* Content Area */}
        <div className="mt-5">
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

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {groupedByRegion.india.map((loc) => (
                      <CityCard key={loc.url + loc.name} loc={loc} serviceName={serviceName} />
                    ))}
                  </div>
                </div>
              )}

              {/* International Section */}
              {groupedByRegion.global.length > 0 && (
                <div className="border-t border-line/70 pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🌐</span>
                    <h3 className="font-display text-sm font-bold text-ink">International & North America Hubs</h3>
                    <span className="text-xs text-ink-400">({groupedByRegion.global.length} hubs)</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {groupedByRegion.global.map((loc) => (
                      <CityCard key={loc.url + loc.name} loc={loc} serviceName={serviceName} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* FILTERED GRID */
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredLocations.map((loc) => (
                <CityCard key={loc.url + loc.name} loc={loc} serviceName={serviceName} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CityCard({ loc, serviceName }: { loc: LocationItem; serviceName: string }) {
  const badge = REGION_BADGES[loc.name.toLowerCase()] || [loc.state, loc.country].filter(Boolean).join(" · ");
  const isIndia = (loc.country || "").toLowerCase() === "india";

  return (
    <Link
      href={loc.url}
      className="group relative flex flex-col justify-between rounded-xl border border-line bg-white p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[0.65rem] font-semibold text-ink-600">
            <span>{isIndia ? "🇮🇳" : loc.country?.toLowerCase() === "australia" ? "🇦🇺" : "🇺🇸"}</span>
            {loc.country}
          </span>
          <span className="text-[0.62rem] font-bold text-teal tracking-wide uppercase">
            {loc.type || "City"}
          </span>
        </div>

        {/* City Info with sleek Map Pin icon */}
        <div className="flex items-start gap-2.5">
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
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[0.72rem] font-semibold text-ink-600 group-hover:text-brand transition-colors">
        <span className="truncate">{serviceName} in {loc.name}</span>
        <Icon name="arrow-right" className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
