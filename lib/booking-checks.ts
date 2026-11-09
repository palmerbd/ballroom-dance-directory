// ─── Online booking & payment check ───────────────────────────────────────────
// What each studio's own website offers for booking and paying online, from an
// automated read of the site (home page plus up to four likely pages: booking,
// schedule, pricing, shop). Data: lib/booking-checks.json, written by
// SEO Reports/booking_payment_checker.py.
//
// Row = [booksVia, booksUrl, paysVia, paysUrl]; "" = not found on the site.
// A studio missing from the file wasn't checked (no website, the site didn't
// load, or it points to a social or aggregator page) → show "Not checked yet".
// We never show a flat "No": a scan can miss a booking link, so a miss reads
// "Not found on its website".

import data from "./booking-checks.json";

export const BOOKING_CHECKED_ON = "2026-11-09";

type Row = [string, string, string, string];
const ROWS = data as unknown as Record<string, Row>;

/** Class-registration systems: you enrol in a class or term rather than book a slot. */
const REGISTRATION = new Set([
  "Jackrabbit", "DanceStudio-Pro", "The Studio Director", "iClassPro", "Sawyer",
  "Amilia", "MyStudio", "Opus1", "Akada", "PerfectMind",
]);

export interface BookingHit {
  via: string;            // provider name, or "on its website"
  url: string;            // where a reader can see it
  registration: boolean;  // class registration rather than slot booking
}

export interface BookingCheck {
  checkedOn: string;
  books: BookingHit | null;
  pays: BookingHit | null;
}

function hit(via: string, url: string): BookingHit | null {
  if (!via) return null;
  const own = via.startsWith("Online booking page") || via.startsWith("Online checkout");
  return { via: own ? "on its website" : via, url, registration: REGISTRATION.has(via) };
}

export function getBookingCheck(slug: string): BookingCheck | null {
  const row = ROWS[slug];
  if (!row) return null;
  return { checkedOn: BOOKING_CHECKED_ON, books: hit(row[0], row[1]), pays: hit(row[2], row[3]) };
}

/** "via Mindbody", "class registration via Jackrabbit", "on its website" */
export function hitLabel(h: BookingHit): string {
  if (h.via === "on its website") return "on its website";
  return h.registration ? `class registration via ${h.via}` : `via ${h.via}`;
}

export function fmtShort(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
