"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  StudioCard,
  CHAIN_CONFIG,
  STYLE_LABELS,
  DANCE_STYLES,
  DanceStyle,
  StudioChain,
} from "@/types/studio";

// ── Constants ─────────────────────────────────────────────────────────────────

const CITIES = ["Los Angeles", "Chicago", "Dallas", "Miami", "Houston"];

const SELECT_CLASS =
  "px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent " +
  "cursor-pointer hover:border-gray-300 transition-colors";

// ── Star rating ───────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5 text-sm" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full  }).map((_, i) => (
        <span key={`f${i}`} style={{ color: "#e8c560" }}>★</span>
      ))}
      {half && <span style={{ color: "#e8c560" }}>½</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="text-gray-300">★</span>
      ))}
      <span className="ml-1 text-gray-500 text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Studio card ───────────────────────────────────────────────────────────────

function StudioListCard({ studio }: { studio: StudioCard }) {
  const chain  = CHAIN_CONFIG[studio.studioChain];
  const styles = studio.danceStyles.slice(0, 4);

  return (
    <Link
      href={`/studios/${studio.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-yellow-400
                 hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #b8922a, #e8c560)" }} />

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ color: chain.color, background: chain.bg }}
          >
            {chain.label}
          </span>
          {studio.tier === "paid" && (
            <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
              Featured
            </span>
          )}
        </div>

        <h2 className="font-display font-bold text-gray-900 text-xl leading-snug mb-1
                       group-hover:text-yellow-800 transition-colors">
          {studio.title}
        </h2>

        {studio.tagline ? (
          <p className="text-sm text-gray-500 italic mb-3">{studio.tagline}</p>
        ) : studio.description ? (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{studio.description}</p>
        ) : null}

        {studio.rating ? (
          <div className="flex items-center gap-2 mb-3">
            <Stars rating={studio.rating} />
            {studio.reviewCount ? (
              <span className="text-xs text-gray-400">({studio.reviewCount.toLocaleString()} reviews)</span>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
          {(studio.city || studio.state) && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {studio.city}{studio.city && studio.state ? ", " : ""}{studio.state}
            </span>
          )}
          {studio.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              {studio.phone}
            </span>
          )}
          {studio.privateLessonRate && (
            <span className="flex items-center gap-1 font-medium" style={{ color: "#b8922a" }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              From {studio.privateLessonRate}
            </span>
          )}
        </div>

        {styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {styles.map((style) => (
              <span key={style}
                className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {STYLE_LABELS[style as DanceStyle]}
              </span>
            ))}
            {studio.danceStyles.length > 4 && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                +{studio.danceStyles.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-5 pt-0">
        <span className="text-sm font-bold tracking-wide transition-colors" style={{ color: "#b8922a" }}>
          View Studio Details →
        </span>
      </div>
    </Link>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function StudioSearch({ studios }: { studios: StudioCard[] }) {
  const searchParams = useSearchParams();

  const [query,     setQuery]     = useState(searchParams.get("q") ?? "");
  const [city,      setCity]      = useState(searchParams.get("city") ?? "");
  const [style,     setStyle]     = useState(searchParams.get("style") ?? "");
  const [chain,     setChain]     = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy,    setSortBy]    = useState("rating");

  // Sync state if params change (e.g. browser back/forward)
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCity(searchParams.get("city") ?? "");
    setStyle(searchParams.get("style") ?? "");
  }, [searchParams]);

  const hasFilters = !!(query || city || style || chain || minRating);

  const filtered = useMemo(() => {
    let result = studios;

    // Text search across name, city, address
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          (s.address || "").toLowerCase().includes(q)
      );
    }

    if (city)      result = result.filter((s) => s.city === city);
    if (style)     result = result.filter((s) => s.danceStyles.includes(style as DanceStyle));
    if (chain)     result = result.filter((s) => s.studioChain === (chain as StudioChain));
    if (minRating) result = result.filter((s) => s.rating !== undefined && s.rating >= minRating);

    // Sort
    result = [...result];
    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "reviews") {
      result.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [studios, query, city, style, chain, minRating, sortBy]);

  function clearFilters() {
    setQuery("");
    setCity("");
    setStyle("");
    setChain("");
    setMinRating(0);
  }

  return (
    <>
      {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-3">

          {/* Search input */}
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search studios by name or city…"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter dropdowns row */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* City */}
            <select value={city} onChange={(e) => setCity(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Dance style */}
            <select value={style} onChange={(e) => setStyle(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Styles</option>
              {DANCE_STYLES.map((s) => (
                <option key={s} value={s}>{STYLE_LABELS[s]}</option>
              ))}
            </select>

            {/* Chain / Studio type */}
            <select value={chain} onChange={(e) => setChain(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Types</option>
              {(Object.entries(CHAIN_CONFIG) as [StudioChain, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Min rating */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className={SELECT_CLASS}
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4★ &amp; up</option>
              <option value={4.5}>4.5★ &amp; up</option>
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={SELECT_CLASS}>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">A → Z</option>
            </select>

            {/* Clear button */}
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

      {/* ── Results grid ──────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6" style={{ background: "#f9f6f0" }}>
        <div className="max-w-6xl mx-auto">

          {/* Result count + active filter chips */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
              studio{filtered.length !== 1 ? "s" : ""}
              {hasFilters ? " match your filters" : " in the directory"}
            </p>

            {/* Active filter chips */}
            {city && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {city}
                <button onClick={() => setCity("")} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
            {style && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {STYLE_LABELS[style as DanceStyle]}
                <button onClick={() => setStyle("")} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
            {chain && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {CHAIN_CONFIG[chain as StudioChain]?.label}
                <button onClick={() => setChain("")} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {minRating}★ &amp; up
                <button onClick={() => setMinRating(0)} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🕺</div>
              <p className="text-gray-500 text-lg mb-2">No studios match your filters.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((studio) => (
                <StudioListCard key={studio.id} studio={studio} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
