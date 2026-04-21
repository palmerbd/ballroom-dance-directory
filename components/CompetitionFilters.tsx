"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CompetitionCard } from "@/components/CompetitionCard";
import {
  Competition,
  COMP_STYLE_LABELS,
  COMP_ORG_LABELS,
  COMP_LEVEL_LABELS,
  COMP_REGION_LABELS,
  CompStyle,
  CompOrg,
  CompLevel,
  CompRegion,
  MONTHS,
} from "@/types/competition";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

const SELECT_CLASS =
  "px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent " +
  "cursor-pointer hover:border-gray-300 transition-colors";

const COMP_STYLES = Object.keys(COMP_STYLE_LABELS) as CompStyle[];
const COMP_ORGS   = Object.keys(COMP_ORG_LABELS)   as CompOrg[];
const COMP_LEVELS = Object.keys(COMP_LEVEL_LABELS)  as CompLevel[];
const COMP_REGIONS = Object.keys(COMP_REGION_LABELS) as CompRegion[];

// ── Sort helper ───────────────────────────────────────────────────────────────

function sortDate(a: Competition, b: Competition): number {
  const da = a.dateStart ?? `${a.typicalMonth.toString().padStart(2, "0")}-99`;
  const db = b.dateStart ?? `${b.typicalMonth.toString().padStart(2, "0")}-99`;
  return da < db ? -1 : da > db ? 1 : 0;
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompetitionFilters({
  competitions,
  defaultRegion = "",
  defaultStyle  = "",
}: {
  competitions: Competition[];
  defaultRegion?: string;
  defaultStyle?:  string;
}) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const [query,  setQuery]  = useState(() => searchParams.get("q")      ?? "");
  const [style,  setStyle]  = useState(() => searchParams.get("style")  ?? defaultStyle);
  const [org,    setOrg]    = useState(() => searchParams.get("org")    ?? "");
  const [level,  setLevel]  = useState(() => searchParams.get("level")  ?? "");
  const [region, setRegion] = useState(() => searchParams.get("region") ?? defaultRegion);
  const [month,  setMonth]  = useState(() => searchParams.get("month")  ?? "");
  const [sortBy, setSortBy] = useState(() => searchParams.get("sort")   ?? "date");
  const [page,   setPage]   = useState(() => Math.max(1, Number(searchParams.get("page") ?? "1")));

  const hasFilters = !!(query || style || org || level || region || month);

  // ── Sync state → URL ──────────────────────────────────────────────────────

  const updateURL = useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === 0 || (k === "sort" && v === "date") || (k === "page" && v === 1)) {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  function handleQuery(v: string)  { setQuery(v);  setPage(1); updateURL({ q: v,      page: 1 }); }
  function handleStyle(v: string)  { setStyle(v);  setPage(1); updateURL({ style: v,  page: 1 }); }
  function handleOrg(v: string)    { setOrg(v);    setPage(1); updateURL({ org: v,    page: 1 }); }
  function handleLevel(v: string)  { setLevel(v);  setPage(1); updateURL({ level: v,  page: 1 }); }
  function handleRegion(v: string) { setRegion(v); setPage(1); updateURL({ region: v, page: 1 }); }
  function handleMonth(v: string)  { setMonth(v);  setPage(1); updateURL({ month: v,  page: 1 }); }
  function handleSort(v: string)   { setSortBy(v); setPage(1); updateURL({ sort: v,   page: 1 }); }
  function handlePage(v: number)   { setPage(v);              updateURL({ page: v }); }

  function clearFilters() {
    setQuery(""); setStyle(""); setOrg(""); setLevel(""); setRegion(""); setMonth(""); setPage(1);
    router.replace(pathname, { scroll: false });
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = competitions;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.venue.toLowerCase().includes(q)
      );
    }

    if (style)  result = result.filter((c) => c.styles.includes(style as CompStyle));
    if (org)    result = result.filter((c) => c.organization === (org as CompOrg));
    if (level)  result = result.filter((c) => c.levels.includes(level as CompLevel));
    if (region) result = result.filter((c) => c.region === (region as CompRegion));
    if (month)  result = result.filter((c) => {
      const m = Number(month);
      if (c.dateStart) return new Date(c.dateStart + "T12:00:00").getMonth() + 1 === m;
      return c.typicalMonth === m;
    });

    // Float paid (Featured) to top, then sort within groups
    const sortFn = (a: Competition, b: Competition): number => {
      if (sortBy === "date") return sortDate(a, b);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    };

    const paid = result.filter((c) => c.tier === "paid").sort(sortFn);
    const rest = result.filter((c) => c.tier !== "paid").sort(sortFn);
    return [...paid, ...rest];
  }, [competitions, query, style, org, level, region, month, sortBy]);

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
      updateURL({ page: 1 });
    }
  }, [page, totalPages, updateURL]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Sticky filter bar ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-3">

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Search competitions by name or city…"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => handleQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2 items-center">

            <select value={region} onChange={(e) => handleRegion(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Regions</option>
              {COMP_REGIONS.map((r) => (
                <option key={r} value={r}>{COMP_REGION_LABELS[r]}</option>
              ))}
            </select>

            <select value={style} onChange={(e) => handleStyle(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Styles</option>
              {COMP_STYLES.map((s) => (
                <option key={s} value={s}>{COMP_STYLE_LABELS[s]}</option>
              ))}
            </select>

            <select value={level} onChange={(e) => handleLevel(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Levels</option>
              {COMP_LEVELS.map((l) => (
                <option key={l} value={l}>{COMP_LEVEL_LABELS[l]}</option>
              ))}
            </select>

            <select value={org} onChange={(e) => handleOrg(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Organizations</option>
              {COMP_ORGS.map((o) => (
                <option key={o} value={o}>{COMP_ORG_LABELS[o]}</option>
              ))}
            </select>

            <select value={month} onChange={(e) => handleMonth(e.target.value)} className={SELECT_CLASS}>
              <option value="">Any Month</option>
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => handleSort(e.target.value)} className={SELECT_CLASS}>
              <option value="date">Soonest First</option>
              <option value="name">A → Z</option>
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900
                           border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
              >
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6" style={{ background: "#f9f6f0" }}>
        <div className="max-w-6xl mx-auto">

          {/* Count + filter chips */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
              competition{filtered.length !== 1 ? "s" : ""}{" "}
              {hasFilters ? "match your filters" : "listed"}
              {totalPages > 1 && (
                <span className="text-gray-400"> — page {safePage} of {totalPages}</span>
              )}
            </p>

            {region && (
              <FilterChip label={COMP_REGION_LABELS[region as CompRegion]} onRemove={() => handleRegion("")} />
            )}
            {style && (
              <FilterChip label={COMP_STYLE_LABELS[style as CompStyle]} onRemove={() => handleStyle("")} />
            )}
            {level && (
              <FilterChip label={COMP_LEVEL_LABELS[level as CompLevel]} onRemove={() => handleLevel("")} />
            )}
            {org && (
              <FilterChip label={COMP_ORG_LABELS[org as CompOrg]} onRemove={() => handleOrg("")} />
            )}
            {month && (
              <FilterChip label={MONTHS[Number(month) - 1]} onRemove={() => handleMonth("")} />
            )}
          </div>

          {/* Grid or empty state */}
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-gray-500 text-lg mb-2">No competitions match your filters.</p>
              <p className="text-gray-400 text-sm mb-6">Try removing a filter or broadening your search.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-lg font-bold text-gray-900 hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pageItems.map((comp) => (
                  <CompetitionCard key={comp.slug} comp={comp} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                  <button
                    onClick={() => { handlePage(safePage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={safePage === 1}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white
                               text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => { handlePage(item as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-10 py-2 text-sm font-medium rounded-lg border transition-colors
                            ${safePage === item
                              ? "border-yellow-400 text-yellow-800 bg-yellow-50"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => { handlePage(safePage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={safePage === totalPages}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white
                               text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── CTA — list your competition ──────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
            Is Your Competition Listed?
          </h2>
          <p className="text-gray-500 mb-6">
            Claim your free listing to update dates, add your website, and connect with dancers
            across the country. Upgrade to Featured to advertise on city pages.
          </p>
          <a
            href="/competitions/claim"
            className="inline-block px-8 py-3 rounded-lg font-bold text-gray-900 hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
          >
            Claim Your Competition Listing
          </a>
        </div>
      </section>
    </>
  );
}

// ── Filter chip helper ────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                     text-yellow-800 text-xs font-medium rounded-full">
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-yellow-600">✕</button>
    </span>
  );
}
