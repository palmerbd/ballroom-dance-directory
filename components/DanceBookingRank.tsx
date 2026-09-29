import Link from "next/link";
import type { DbrCity, DbrPage } from "@/lib/dancebookingrank";
import { DBR_CSS } from "@/lib/dancebookingrank-styles";

const BASE_URL = "https://www.ballroomdancedirectory.com";

type Crumb = { href?: string; label: string };

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Shared shell for the Dance Booking Rank pages: site hero, body fragment, browse CTA, footer. */
export default function DanceBookingRank({
  city,
  page,
  crumbs,
  wide = false,
}: {
  city: DbrCity;
  page: DbrPage;
  crumbs: Crumb[];
  wide?: boolean;
}) {
  const width = wide ? "max-w-5xl" : "max-w-4xl";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${BASE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <main>
      {[...(page.jsonLd ?? []), breadcrumbSchema].map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
      <style>{DBR_CSS}</style>

      {/* Hero */}
      <section className="py-14 px-6" style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className={`${width} mx-auto`}>
          <nav className="text-sm mb-6">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="text-white/30 mx-2">/</span>}
                {c.href ? (
                  <Link href={c.href} className="text-white/50 hover:text-white transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white/70">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
          <p className="text-amber-400 font-semibold text-xs uppercase tracking-widest mb-3">{page.kicker}</p>
          <h1
            className="font-display text-white font-bold mb-4 leading-tight"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
          >
            {page.h1}
          </h1>
          <p className="text-white/70 max-w-3xl">{page.intro}</p>
          <p className="text-white/50 text-sm mt-4">Measured {formatDate(city.published)}</p>
        </div>
      </section>

      {/* Report body (generated fragment) */}
      <section className="py-14 px-6 bg-white">
        <div className={`${width} mx-auto dbr`} dangerouslySetInnerHTML={{ __html: page.html }} />
      </section>

      {/* Browse CTA */}
      <section className="py-14 px-6" style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Find a Dance Studio in {city.city}</h2>
          <p className="text-white/60 mb-6">
            {`Browse the private dance studios we list in and around ${city.city} — ballroom, Latin, swing, country and wedding dance lessons.`}
          </p>
          <Link
            href={city.cityPage ?? "/studios"}
            className="inline-block px-8 py-3 rounded-full font-bold text-white transition-colors"
            style={{ background: "#c9a227" }}
          >
            Browse {city.city} Studios →
          </Link>
        </div>
      </section>

      {/* Footer (same as the city pages) */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-display font-bold text-gray-900">Ballroom Dance Directory</div>
            <p className="text-gray-400 text-sm mt-1">America&apos;s premier resource for private dance instruction</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/studios" className="hover:text-gray-900 transition-colors">All Studios</Link>
            <Link href="/cities" className="hover:text-gray-900 transition-colors">Cities</Link>
            <Link href="/claim" className="hover:text-gray-900 transition-colors">Claim Studio</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
