import type { Metadata } from "next";
import Link from "next/link";
import { DANCEWEAR_BRANDS } from "@/lib/dancewear-data";
import DancewearCard from "@/components/DancewearCard";

export const revalidate = 86400;

export const metadata: Metadata = {
  title:       "Dance Wear | Ballroom Dance Directory",
  description: "Find the best ballroom and Latin dancewear brands for practice and competition — curated listings with contact info and direct links.",
};

const practiceCount    = DANCEWEAR_BRANDS.filter((b) => b.categories.includes("practice")).length;
const competitionCount = DANCEWEAR_BRANDS.filter((b) => b.categories.includes("competition")).length;

export default function DanceWearPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Dance Wear
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our curated collection of ballroom and Latin dancewear brands — from rehearsal-ready practice wear to stage-worthy competition gowns.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">

        <Link
          href="/dance-wear/practice-wear"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-amber-300 transition-all p-8 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👗</span>
            <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-amber-800 transition-colors">
              Practice Wear
            </h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Studio-ready skirts, bodysuits, tops, and dresses designed to move with you through every rehearsal — stylish enough for the floor, durable enough for daily training.
          </p>
          <span className="mt-auto text-sm font-medium text-amber-700">
            {practiceCount} brands &rarr;
          </span>
        </Link>

        <Link
          href="/dance-wear/competition-wear"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-amber-300 transition-all p-8 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">✨</span>
            <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-amber-800 transition-colors">
              Competition Wear
            </h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Crystal-encrusted gowns, tailored men's attire, and custom couture built for the spotlight — brands trusted by world champions on the biggest stages.
          </p>
          <span className="mt-auto text-sm font-medium text-amber-700">
            {competitionCount} brands &rarr;
          </span>
        </Link>

      </div>

      {/* All brands */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">All Brands</h2>
        <p className="text-sm text-gray-500">All {DANCEWEAR_BRANDS.length} dancewear brands in the directory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DANCEWEAR_BRANDS.map((brand) => (
          <DancewearCard key={brand.slug} brand={brand} />
        ))}
      </div>

    </main>
  );
}
