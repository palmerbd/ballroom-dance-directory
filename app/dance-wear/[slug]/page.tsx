import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DANCEWEAR_BRANDS, getBySlug } from "@/lib/dancewear-data";
import { DANCEWEAR_CATEGORY_LABELS } from "@/types/dancewear";

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

  return {
    title:       `${brand.name} | Dance Wear | Ballroom Dance Directory`,
    description: brand.description,
  };
}

export default function DancewearBrandPage({
  params,
}: {
  params: { slug: string };
}) {
  const brand = getBySlug(params.slug);
  if (!brand) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/dance-wear" className="hover:text-amber-700 transition-colors">Dance Wear</Link>
        {brand.categories.map((cat) => (
          <span key={cat} className="flex items-center gap-2">
            <span>/</span>
            <Link
              href={`/dance-wear/${cat === "practice" ? "practice-wear" : "competition-wear"}`}
              className="hover:text-amber-700 transition-colors"
            >
              {DANCEWEAR_CATEGORY_LABELS[cat]}
            </Link>
          </span>
        ))}
        <span>/</span>
        <span className="text-gray-900 font-medium">{brand.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {brand.categories.map((cat) => (
            <span
              key={cat}
              className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
            >
              {DANCEWEAR_CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {brand.name}
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed">
          {brand.description}
        </p>
      </div>

      {/* Contact card */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Contact &amp; Links
        </h2>
        <div className="flex flex-col gap-3">
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-amber-700 font-medium hover:text-amber-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {brand.website.replace(/^https?:\/\//, "")}
          </a>

          {brand.phone && (
            <a
              href={`tel:${brand.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {brand.phone}
            </a>
          )}

          {brand.email && (
            <a
              href={`mailto:${brand.email}`}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {brand.email}
            </a>
          )}
        </div>
      </div>

      {/* Visit button */}
      <a
        href={brand.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 transition-colors shadow-sm mb-10"
      >
        Visit {brand.name} &rarr;
      </a>

      {/* Back links */}
      <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-4">
        {brand.categories.map((cat) => (
          <Link
            key={cat}
            href={`/dance-wear/${cat === "practice" ? "practice-wear" : "competition-wear"}`}
            className="text-sm text-amber-700 hover:text-amber-900 transition-colors"
          >
            &larr; Back to {DANCEWEAR_CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

    </main>
  );
}
