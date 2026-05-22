// ─── ReviewsSection ───────────────────────────────────────────────────────────
// Displays cached Google reviews on a Featured studio's detail page.
// Reviews are fetched server-side from the studio_reviews Supabase table.

import React from "react";

export interface GoogleReview {
  id:               string;
  studio_slug:      string;
  author_name:      string;
  author_photo_url: string | null;
  rating:           number;
  review_text:      string;
  time_description: string;
}

interface Props {
  reviews: GoogleReview[];
}

function StarRow({ rating }: { rating: number }) {
  const full  = Math.round(rating);
  const empty = 5 - full;
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: full  }).map((_, i) => (
        <span key={`f${i}`} style={{ color: "#e8c560" }}>&#9733;</span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="text-gray-300">&#9733;</span>
      ))}
    </span>
  );
}

export default function ReviewsSection({ reviews }: Props) {
  if (!reviews.length) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-bold text-gray-900 text-xl">Google Reviews</h2>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#d1fae5", color: "#065f46" }}
        >
          Verified via Google
        </span>
      </div>

      <div className="grid gap-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-3">
              {r.author_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.author_photo_url}
                  alt={r.author_name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
                >
                  {r.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{r.author_name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRow rating={r.rating} />
                  <span className="text-xs text-gray-400">{r.time_description}</span>
                </div>
              </div>
            </div>
            {r.review_text && (
              <p className="text-gray-600 text-sm leading-relaxed">{r.review_text}</p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Reviews sourced from Google. Ratings reflect customer feedback at time of collection.
      </p>
    </section>
  );
}
