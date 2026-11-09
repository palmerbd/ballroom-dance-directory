import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSON_PRICES, getLessonPriceReport, summarize, fmtCheckedOn, type LessonPriceStudio } from "@/lib/lesson-prices";

// ─── /lesson-prices/[city] — First Lesson Price Index ─────────────────────────
// What studios in a metro publish about intro offers and prices, read from each
// studio's own website on a stated date (data: lib/lesson-prices.ts). Every
// headline number is computed from the rows.

const BASE_URL = "https://www.ballroomdancedirectory.com";

export const dynamicParams = false;

export function generateStaticParams() {
  return LESSON_PRICES.map((r) => ({ city: r.slug }));
}

function monthYear(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const r = getLessonPriceReport(city);
  if (!r) return { title: "Page Not Found" };
  const s = summarize(r);
  const title = `What Ballroom Dance Lessons Cost in ${r.city}, ${r.stateAbbr} (${monthYear(r.checkedOn)})`;
  const description = `${s.withPrice} of ${s.total} ${r.city}-area studios publish an intro offer price, from $${s.min} to $${s.max} (median $${s.median}). Read from each studio's own website on ${fmtCheckedOn(r.checkedOn)}.`;
  const url = `${BASE_URL}/lesson-prices/${r.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "article", url },
  };
}

function YesNo({ value }: { value: boolean | null | undefined }) {
  if (value === true) return <span className="font-medium text-emerald-700">Yes</span>;
  if (value === false) return <span className="text-gray-700">No</span>;
  return <span className="text-gray-400">Not stated</span>;
}

export default async function LessonPricesPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const r = getLessonPriceReport(city);
  if (!r) notFound();
  const s = summarize(r);
  const checked = fmtCheckedOn(r.checkedOn);
  const url = `${BASE_URL}/lesson-prices/${r.slug}`;

  const priced = r.studios
    .filter((x): x is LessonPriceStudio & { introPrice: number } => typeof x.introPrice === "number")
    .sort((a, b) => a.introPrice - b.introPrice || a.name.localeCompare(b.name));
  const unpriced = r.studios.filter((x) => typeof x.introPrice !== "number");
  const withOther = r.studios.filter((x) => x.otherPrices);
  const expiring = r.studios.filter((x) => x.note && /expire/i.test(x.note));
  const expiryDate = expiring[0]?.note?.match(/expires\s+([A-Z][a-z]+ \d{1,2})/)?.[1] ?? "soon";
  const maxPrice = s.max ?? 1;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${r.city} ballroom dance lesson prices, ${monthYear(r.checkedOn)}`,
      description: `Intro offers and published lesson prices for ${s.total} dance studios in the ${r.city}, ${r.stateAbbr} area, read from each studio's own website on ${checked}.`,
      url,
      temporalCoverage: r.checkedOn,
      spatialCoverage: { "@type": "Place", name: `${r.city}, ${r.state}` },
      variableMeasured: ["Intro offer", "Intro offer price (USD)", "Other published prices", "No partner needed", "Beginner class"],
      creator: { "@type": "Organization", name: "Ballroom Dance Directory", url: BASE_URL },
      dateModified: r.checkedOn,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        ...(r.cityHub ? [{ "@type": "ListItem", position: 2, name: `${r.city} studios`, item: `${BASE_URL}${r.cityHub}` }] : []),
        { "@type": "ListItem", position: r.cityHub ? 3 : 2, name: "Lesson prices", item: url },
      ],
    },
  ];

  return (
    <main style={{ background: "#f9f6f0", minHeight: "100vh" }}>
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}

      {/* Header */}
      <section className="px-6 py-14" style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs text-white/50 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            {r.cityHub && <> <span className="mx-1.5">/</span> <Link href={r.cityHub} className="hover:text-white">{r.city} studios</Link></>}
            <span className="mx-1.5">/</span> <span className="text-white/70">Lesson prices</span>
          </nav>
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#e8c560" }}>
            First Lesson Price Index · {r.city}, {r.stateAbbr}
          </p>
          <h1 className="font-display text-white font-bold mb-4" style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", lineHeight: 1.15 }}>
            What Ballroom Dance Lessons Cost in {r.city} ({monthYear(r.checkedOn)})
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-3xl">
            Intro offers and published prices from {s.total} studios in the {r.city} area, read from each
            studio’s own website on {checked}.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* Key numbers */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { big: s.median !== null ? `$${s.median}` : "—", label: "median intro offer" },
            { big: `${s.withPrice} of ${s.total}`, label: "publish an intro price" },
            { big: `${s.noPartner} of ${s.total}`, label: "say no partner is needed" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="font-display font-bold text-3xl" style={{ color: "#0c1428" }}>{k.big}</div>
              <div className="text-sm text-gray-500 mt-1">{k.label}</div>
            </div>
          ))}
        </section>

        {/* The answer, in sentences people and AI answers can quote */}
        <section className="rounded-xl bg-white border border-gray-100 shadow-sm p-8">
          <h2 className="font-display font-bold text-gray-900 text-xl mb-4">The short answer</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            In the {r.city} area, a first ballroom lesson usually starts with an intro offer. Of the {s.total} studios
            we checked, {s.withPrice} publish the price online: it ranges from ${s.min} to ${s.max}, and the median is
            ${s.median}.
          </p>
          <p className="text-gray-700 leading-relaxed">
            {s.noPartner} of the {s.total} say you don’t need a partner to start, and {s.namedClass} name a
            beginner class on their schedule. What an intro offer includes varies a lot, from one lesson to two
            30-minute private lessons plus a social party, so compare what you get, not only the price.
          </p>
        </section>

        {/* Intro offers, lowest to highest */}
        <section className="rounded-xl bg-white border border-gray-100 shadow-sm p-8">
          <h2 className="font-display font-bold text-gray-900 text-xl mb-1">Intro offers, lowest to highest</h2>
          <p className="text-sm text-gray-500 mb-6">As published on each studio’s website, {checked}.</p>
          <ul className="space-y-4">
            {priced.map((x) => (
              <li key={x.slug}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/studios/${x.slug}`} className="font-semibold text-gray-900 hover:underline">{x.name}</Link>
                    {x.featured && (
                      <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide align-middle"
                        style={{ background: "#fdf4e3", color: "#7a5c18" }}>Featured (paid)</span>
                    )}
                    <div className="text-sm text-gray-500">{x.area} · {x.introOffer}</div>
                  </div>
                  <div className="font-display font-bold text-xl shrink-0" style={{ color: "#0c1428" }}>${x.introPrice}</div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(6, (x.introPrice / maxPrice) * 100)}%`, background: "#b8922a" }} />
                </div>
              </li>
            ))}
          </ul>
          {unpriced.length > 0 && (
            <p className="text-sm text-gray-500 mt-6">
              No intro price on the website: {unpriced.map((x, i) => (
                <span key={x.slug}>
                  <Link href={`/studios/${x.slug}`} className="hover:underline">{x.name}</Link>
                  {i < unpriced.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          )}
        </section>

        {/* Full table */}
        <section className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 pb-4">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-1">All {s.total} studios</h2>
            <p className="text-sm text-gray-500">Each row links to the page we read the price from.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Studio</th>
                  <th className="px-4 py-3">Intro offer</th>
                  <th className="px-4 py-3">No partner needed</th>
                  <th className="px-4 py-3">Beginner class</th>
                  {s.booksOnlineChecked && <th className="px-4 py-3">Books online</th>}
                  {s.paysOnlineChecked && <th className="px-4 py-3">Pays online</th>}
                  <th className="px-6 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {r.studios.map((x) => (
                  <tr key={x.slug} className="align-top">
                    <td className="px-6 py-4">
                      <Link href={`/studios/${x.slug}`} className="font-medium text-gray-900 hover:underline">{x.name}</Link>
                      <div className="text-xs text-gray-500">{x.area}{x.featured ? " · Featured (paid)" : ""}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {typeof x.introPrice === "number"
                        ? <><span className="font-semibold">${x.introPrice}</span> · {x.introOffer}</>
                        : <span className="text-gray-400">Not published</span>}
                      {x.note && <div className="text-xs text-gray-500 mt-1">{x.note}</div>}
                    </td>
                    <td className="px-4 py-4"><YesNo value={x.noPartner} /></td>
                    <td className="px-4 py-4 text-gray-700">{x.beginnerClass ?? <span className="text-gray-400">Not stated</span>}</td>
                    {s.booksOnlineChecked && <td className="px-4 py-4"><YesNo value={x.booksOnline} /></td>}
                    {s.paysOnlineChecked && <td className="px-4 py-4"><YesNo value={x.paysOnline} /></td>}
                    <td className="px-6 py-4">
                      <a href={x.source} target="_blank" rel="noopener nofollow" className="text-xs underline" style={{ color: "#9a7620" }}>
                        Studio website
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Other published prices */}
        {withOther.length > 0 && (
          <section className="rounded-xl bg-white border border-gray-100 shadow-sm p-8">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Other prices studios publish</h2>
            <ul className="space-y-2 text-gray-700">
              {withOther.map((x) => (
                <li key={x.slug}><span className="font-medium">{x.name}:</span> {x.otherPrices}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Before you book */}
        <section className="rounded-xl bg-white border border-gray-100 shadow-sm p-8">
          <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Before you book</h2>
          <ul className="space-y-2 text-gray-700 list-disc pl-5">
            <li>Ask how long each intro lesson is. Some offers are one lesson; others are two 30-minute lessons.</li>
            <li>Ask what comes after the intro offer. Only a few studios publish their regular lesson or package prices.</li>
            {expiring.length > 0 && (
              <li>Intro prices change. {expiring.map((x) => x.name).join(" and ")} said {expiring.length > 1 ? "their offers expire" : "its offer expires"} {expiryDate}.</li>
            )}
          </ul>
        </section>

        {/* Method + disclosure */}
        <section className="rounded-xl border border-gray-200 p-8 text-sm text-gray-600 leading-relaxed space-y-3" style={{ background: "#fdfcf9" }}>
          <h2 className="font-display font-bold text-gray-900 text-lg">How we got these numbers</h2>
          <p>
            On {checked}, we read each studio’s own website, including its intro-offer, pricing, class and contact
            pages, and recorded what it says. We didn’t contact the studios for this edition, so every price is
            as published and can change. The median counts only studios that publish a price.
          </p>
          <p>
            Next for {r.city}: how quickly each studio replies to a new-student inquiry, and whether you can book and
            pay online. See <Link href="/how-we-verify" className="underline" style={{ color: "#9a7620" }}>how we verify</Link>.
          </p>
          <p>
            Featured is a paid placement on Ballroom Dance Directory and is labelled. It doesn’t change what we
            publish here. Ballroom Dance Directory is run by the team behind BookDanceLessons, which sells marketing
            services to dance studios, and some studios listed may be its clients. Every price on this page is copied
            from the studio’s own website either way.
          </p>
          <p>
            Spot something out of date? Email{" "}
            <a href={`mailto:info@ballroomdancedirectory.com?subject=${encodeURIComponent(`${r.city} lesson prices`)}`} className="underline" style={{ color: "#9a7620" }}>
              info@ballroomdancedirectory.com
            </a>.
          </p>
        </section>

        {/* Related */}
        <section className="flex flex-wrap gap-3">
          {r.cityHub && (
            <Link href={r.cityHub} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              All {r.city} studios
            </Link>
          )}
          {r.bookingRank && (
            <Link href={r.bookingRank} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {r.city} Dance Booking Rank
            </Link>
          )}
          <Link href="/how-we-verify" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            How we verify
          </Link>
        </section>
      </div>
    </main>
  );
}
