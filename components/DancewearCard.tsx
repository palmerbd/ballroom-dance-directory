import Link from "next/link";
import type { DancewearBrand } from "@/types/dancewear";
import { DANCEWEAR_CATEGORY_LABELS } from "@/types/dancewear";

interface Props {
  brand: DancewearBrand;
}

export default function DancewearCard({ brand }: Props) {
  return (
    <Link
      href={`/dance-wear/${brand.slug}`}
      className="group block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
    >
      {/* Category badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {brand.categories.map((cat) => (
          <span
            key={cat}
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
          >
            {DANCEWEAR_CATEGORY_LABELS[cat]}
          </span>
        ))}
      </div>

      {/* Brand name */}
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-800 transition-colors mb-2">
        {brand.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
        {brand.description}
      </p>

      {/* Contact / website row */}
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        <span className="text-amber-700 font-medium truncate">
          {brand.website.replace(/^https?:\/\//, "")}
        </span>
        {brand.phone && <span>{brand.phone}</span>}
        {brand.email && <span>{brand.email}</span>}
      </div>
    </Link>
  );
}
