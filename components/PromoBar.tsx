// ─── PromoBar ─────────────────────────────────────────────────────────────────
// Renders a promotion banner for Featured studios in the hero area.
// Only shows when promo_text is set and promo_end_date is in the future (or null).

import React from "react";

export interface PromoBarProps {
  promoText:    string;
  promoType?:   string | null;
  promoSavings?: string | null;
  promoEndDate?: string | null;   // ISO date string "YYYY-MM-DD"
}

function isPromoActive(endDate?: string | null): boolean {
  if (!endDate) return true;
  return new Date(endDate) >= new Date(new Date().toDateString());
}

function promoLabel(type?: string | null, savings?: string | null): string | null {
  if (!savings) return null;
  switch (type) {
    case "percentage":  return `${savings} Off`;
    case "dollar":      return `${savings} Off`;
    case "free_trial":  return savings;
    case "custom":      return savings;
    default:            return savings;
  }
}

export default function PromoBar({ promoText, promoType, promoSavings, promoEndDate }: PromoBarProps) {
  if (!promoText || !isPromoActive(promoEndDate)) return null;

  const badge = promoLabel(promoType, promoSavings);

  const endDateFormatted = promoEndDate
    ? new Date(promoEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div
      className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
      style={{
        background: "linear-gradient(135deg, #451a03 0%, #78350f 100%)",
        border: "1.5px solid #d97706",
      }}
    >
      {/* Megaphone icon */}
      <span className="text-xl flex-shrink-0 mt-0.5">🎉</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Special Offer
          </span>
          {badge && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#d97706", color: "#fff" }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-amber-100 text-sm font-medium leading-snug">{promoText}</p>
        {endDateFormatted && (
          <p className="text-amber-400/70 text-xs mt-1">Offer ends {endDateFormatted}</p>
        )}
      </div>
    </div>
  );
}
