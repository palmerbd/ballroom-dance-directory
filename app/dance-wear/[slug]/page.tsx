// Dance Wear brand landing page — styled to match studio profile pages
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DANCEWEAR_BRANDS, getBySlug, getByCategory } from "@/lib/dancewear-data";
import { DANCEWEAR_CATEGORY_LABELS, type DancewearCategory } from "@/types/dancewear";

export const revalidate = 86400;

export async function generateStaticParams() {
  return DANCEWEAR_BRANDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brand = getBySlug(params.slug);
  if (!brand) return { title: "Brand Not Found" };

  const catLabels = brand.categories.map((c) => DANCEWEAR_CATEGORY_LABELS[c]).join(" & ");
  return {
    title:       `${brand.name} | ${catLabels} | Ballroom Dance Directory`,
    description: brand.description,
    alternates: {
      canonical: `https://www.ballroomdancedirectory.com/dance-wear/${brand.slug}`,
    },
  };
}

// ── Icon helpers ──────────────────────────────────────────────────────────────

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function InfoRow({ icon, label, value, href }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</div>
        <div className="text-gray-800 font-medium break-all">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="block hover:bg-gray-50 -mx-1 px-1 rounded transition-colors">
      {content}
    </a>
  ) : <div>{content}</div>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DancewearBrandPage({
  params,
}: {
  params: { slug: string };
}) {
  const brand = getBySlug(params.slug);
  if (!brand) notFound();

  const catLabel = brand.categories.map((c) => DANCEWEAR_CATEGORY_LABELS[c]).join(" & ");

  // Related brands: same primary category, exclude self, max 3
  const primaryCat = brand.categories[0] as DancewearCategory;
  const relatedBrands = getByCategory(primaryCat)
    .filter((b) => b.slug !== brand.slug)
    .slice(0, 3);

  // Schema.org
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": brand.name,
    "description": brand.description,
    "url": brand.website,
    ...(brand.phone ? { "telephone": brand.phone } : {}),
    ...(brand.email ? { "email": brand.email } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",       "item": "https://www.ballroomdancedirectory.com" },
      { "@type": "ListItem", "position": 2, "name": "Dance Wear", "item": "https://www.ballroomdancedirectory.com/dance-wear" },
      { "@type": "ListItem", "position": 3, "name": catLabel,     "item": `https://www.ballroomdancedirectory.com/dance-wear/${primaryCat === "practice" ? "practice-wear" : "competition-wear"}` },
      { "@type": "ListItem", "position": 4, "name": brand.name,   "item": `https://www.ballroomdancedirectory.com/dance-wear/${brand.slug}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="py-14 px-6"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <nav className="text-sm mb-6">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
            <span className="text-white/30 mx-2">/</span>
            <Link href="/dance-wear" className="text-white/50 hover:text-white transition-colors">Dance Wear</Link>
            {brand.categories.map((cat) => (
              <span key={cat}>
                <span className="text-white/30 mx-2">/</span>
                <Link
                  href={`/dance-wear/${cat === "practice" ? "practice-wear" : "competition-wear"}`}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {DANCEWEAR_CATEGORY_LABELS[cat]}
                </Link>
              </span>
            ))}
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white/80">{brand.name}</span>
          </nav>

          {/* Category badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {brand.categories.map((cat) => (
              <span
                key={cat}
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{ background: "#b8922a22", color: "#e8c560", border: "1px solid #b8922a" }}
              >
                {DANCEWEAR_CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>

          {/* Brand name */}
          <h1
            className="font-display text-white font-bold mb-3"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            {brand.name}
          </h1>

          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            {brand.description}
          </p>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main (2/3) ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">
                About {brand.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">{brand.description}</p>
            </section>

            {/* What they offer */}
            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-4">
                What They Offer
              </h2>
              <div className="flex flex-wrap gap-2">
                {brand.categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/dance-wear/${cat === "practice" ? "practice-wear" : "competition-wear"}`}
                    className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors hover:bg-amber-50"
                    style={{ borderColor: "#b8922a", color: "#b8922a", background: "#fdf8f0" }}
                  >
                    {DANCEWEAR_CATEGORY_LABELS[cat]}
                  </Link>
                ))}
              </div>
            </section>

            {/* Visit CTA — mobile only; sidebar has it on desktop */}
            <div className="lg:hidden">
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-900 text-sm
                           transition-all hover:brightness-110 shadow-sm"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
              >
                <GlobeIcon /> Visit {brand.name} &rarr;
              </a>
            </div>

          </div>

          {/* ── Sidebar (1/3) ───────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 text-lg mb-4">
                Contact &amp; Links
              </h3>

              <InfoRow
                icon={<GlobeIcon />}
                label="Website"
                value={brand.website.replace(/^https?:\/\//, "")}
                href={brand.website}
              />
              {brand.phone && (
                <InfoRow
                  icon={<PhoneIcon />}
                  label="Phone"
                  value={brand.phone}
                  href={`tel:${brand.phone.replace(/\D/g, "")}`}
                />
              )}
              {brand.email && (
                <InfoRow
                  icon={<MailIcon />}
                  label="Email"
                  value={brand.email}
                  href={`mailto:${brand.email}`}
                />
              )}

              {/* Primary CTA */}
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl
                           font-bold text-gray-900 text-sm transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
              >
                <GlobeIcon /> Visit {brand.name}
              </a>
            </div>

            {/* Back links */}
            <div className="flex flex-col gap-2">
              {brand.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/dance-wear/${cat === "practice" ? "practice-wear" : "competition-wear"}`}
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
                >
                  &larr; All {DANCEWEAR_CATEGORY_LABELS[cat]} Brands
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Related Brands ─────────────────────────────────────────────────── */}
      {relatedBrands.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-bold text-gray-900 text-2xl mb-2">
              More {DANCEWEAR_CATEGORY_LABELS[primaryCat]} Brands
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Other {DANCEWEAR_CATEGORY_LABELS[primaryCat].toLowerCase()} brands in the directory
              &nbsp;&middot;&nbsp;
              <Link
                href={`/dance-wear/${primaryCat === "practice" ? "practice-wear" : "competition-wear"}`}
                className="text-amber-700 font-semibold hover:underline"
              >
                See all {DANCEWEAR_CATEGORY_LABELS[primaryCat].toLowerCase()} brands &rarr;
              </Link>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/dance-wear/${b.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm
                             hover:shadow-md hover:border-yellow-300 transition-all block"
                >
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {b.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                      >
                        {DANCEWEAR_CATEGORY_LABELS[cat]}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-base mb-1 group-hover:text-amber-800 transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{b.description}</p>
                  <span className="text-xs text-gray-400">View brand &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-display font-bold text-gray-900">Ballroom Dance Directory</div>
            <p className="text-gray-400 text-sm mt-1">America&apos;s premier resource for private dance instruction</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/studios" className="hover:text-gray-900 transition-colors">Studios</Link>
            <Link href="/dance-wear" className="hover:text-gray-900 transition-colors">Dance Wear</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
