import type { Metadata } from "next";
import Link from "next/link";
import { getByCategory } from "@/lib/dancewear-data";
import DancewearCard from "@/components/DancewearCard";

export const revalidate = 86400;

export const metadata: Metadata = {
  title:       "Competition Wear Brands | Dance Wear | Ballroom Dance Directory",
  description: "Find the best ballroom and Latin competition wear brands — crystal-encrusted gowns, tailored men's attire, and custom couture for the competitive floor.",
};

export default function CompetitionWearPage() {
  const brands = getByCategory("competition");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/dance-wear" className="hover:text-amber-700 transition-colors">Dance Wear</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Competition Wear</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Competition Wear
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Stage-worthy gowns, couture competition dresses, and tailored men's attire — brands trusted by professional and amateur competitors on the world's biggest ballroom stages.
        </p>
      </div>

      {/* Brand grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {brands.map((brand) => (
          <DancewearCard key={brand.slug} brand={brand} />
        ))}
      </div>

      {/* Cross-link */}
      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
        <p className="text-gray-600 text-sm mb-3">Need something for the studio?</p>
        <Link
          href="/dance-wear/practice-wear"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
        >
          Browse Practice Wear &rarr;
        </Link>
      </div>

    </main>
  );
}
