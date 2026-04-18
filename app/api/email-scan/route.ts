/**
 * /api/email-scan
 * ===============
 * Uses the same Google Places nearbysearch → Place Details pipeline
 * as fetch-studios.mjs, then scrapes each studio website for email
 * addresses (mailto: links + regex).
 *
 * GET /api/email-scan?city=chicago
 * GET /api/email-scan?city=los-angeles
 *
 * Returns JSON array of studio results with emails found.
 */

import { NextRequest, NextResponse } from "next/server";

const PLACES_KEY = process.env.PLACES_API_KEY!;
const RADIUS_METERS = 30_000;
const DETAIL_FIELDS = "name,formatted_address,formatted_phone_number,website,rating,url,business_status";

const CITIES: Record<string, { lat: number; lng: number; label: string }> = {
  "chicago":       { lat: 41.8781,  lng: -87.6298,  label: "Chicago, IL" },
  "los-angeles":   { lat: 34.0522,  lng: -118.2437, label: "Los Angeles, CA" },
  "new-york":      { lat: 40.7128,  lng: -74.0060,  label: "New York, NY" },
  "houston":       { lat: 29.7604,  lng: -95.3698,  label: "Houston, TX" },
  "dallas":        { lat: 32.7767,  lng: -96.7970,  label: "Dallas, TX" },
  "miami":         { lat: 25.7617,  lng: -80.1918,  label: "Miami, FL" },
  "atlanta":       { lat: 33.7490,  lng: -84.3880,  label: "Atlanta, GA" },
  "phoenix":       { lat: 33.4484,  lng: -112.0740, label: "Phoenix, AZ" },
  "seattle":       { lat: 47.6062,  lng: -122.3321, label: "Seattle, WA" },
  "denver":        { lat: 39.7392,  lng: -104.9903, label: "Denver, CO" },
};

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = new Set([
  "sentry.io","example.com","wixpress.com","squarespace.com",
  "googleapis.com","gstatic.com","cloudflare.com","amazonaws.com",
  "schema.org","2x.png","3x.png",
]);

// ── Places helpers ────────────────────────────────────────────────────────────

async function nearbySearch(lat: number, lng: number): Promise<any[]> {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(RADIUS_METERS),
    type: "dance_studio",
    key: PLACES_KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results ?? [];
}

async function getPlaceDetails(placeId: string): Promise<any> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: DETAIL_FIELDS,
    key: PLACES_KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result ?? {};
}

// ── Email scraper ─────────────────────────────────────────────────────────────

function cleanEmails(raw: string[], siteDomain: string): string[] {
  const filtered = raw.filter(e => {
    const domain = e.split("@")[1]?.toLowerCase() ?? "";
    if ([...SKIP_DOMAINS].some(s => domain.includes(s))) return false;
    if (domain.match(/\.(png|jpg|gif|svg|webp)$/)) return false;
    if (e.length > 80) return false;
    return true;
  });
  const sameDomain = filtered.filter(e =>
    e.split("@")[1]?.includes(siteDomain)
  );
  return [...new Set(sameDomain.length ? sameDomain : filtered)].map(e => e.toLowerCase());
}

async function scrapeEmailsFromUrl(url: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BDD-Scraper/1.0)" },
    });
    clearTimeout(timer);
    if (!res.ok) return [];

    const html = await res.text();
    const emails: string[] = [];

    // mailto: links
    const mailtoRe = /mailto:([^"'?\s>]+)/gi;
    let m;
    while ((m = mailtoRe.exec(html)) !== null) {
      const e = m[1].split("?")[0].trim();
      if (e.includes("@")) emails.push(e);
    }

    // Regex scan
    emails.push(...(html.match(EMAIL_RE) ?? []));

    return emails;
  } catch {
    return [];
  }
}

async function scrapeStudioEmail(website: string): Promise<string[]> {
  if (!website) return [];
  try {
    const parsed = new URL(website.startsWith("http") ? website : `https://${website}`);
    const siteDomain = parsed.hostname.replace("www.", "");
    const base = `${parsed.protocol}//${parsed.hostname}`;

    // Try homepage first
    let emails = await scrapeEmailsFromUrl(website);

    // If nothing, try /contact
    if (emails.length === 0) {
      emails = await scrapeEmailsFromUrl(`${base}/contact`);
    }
    // Try /contact-us
    if (emails.length === 0) {
      emails = await scrapeEmailsFromUrl(`${base}/contact-us`);
    }

    return cleanEmails(emails, siteDomain);
  } catch {
    return [];
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city") ?? "chicago";
  const city = CITIES[citySlug];

  if (!city) {
    return NextResponse.json(
      { error: `Unknown city. Valid: ${Object.keys(CITIES).join(", ")}` },
      { status: 400 }
    );
  }

  if (!PLACES_KEY) {
    return NextResponse.json({ error: "PLACES_API_KEY not set" }, { status: 500 });
  }

  // 1. Nearby search for dance studios
  const places = await nearbySearch(city.lat, city.lng);

  // 2. Place Details in parallel (website, phone, etc.)
  const detailResults = await Promise.allSettled(
    places.map(p => getPlaceDetails(p.place_id))
  );

  const studios = detailResults
    .filter(r => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<any>).value)
    .filter(d => d.name && d.business_status !== "CLOSED_PERMANENTLY");

  // 3. Scrape emails in parallel (4s timeout per site)
  const withEmails = await Promise.allSettled(
    studios.map(async (s) => {
      const emails = await scrapeStudioEmail(s.website ?? "");
      return {
        name:    s.name ?? "",
        city:    city.label,
        address: s.formatted_address ?? "",
        phone:   s.formatted_phone_number ?? "",
        website: s.website ?? "",
        emails,
        email_count: emails.length,
        status: !s.website ? "no_website" : emails.length > 0 ? "found" : "no_email",
        google_maps_url: s.url ?? "",
      };
    })
  );

  const results = withEmails
    .filter(r => r.status === "fulfilled")
    .map(r => (r as PromiseFulfilledResult<any>).value);

  // Summary stats
  const withWebsite = results.filter(r => r.website).length;
  const withEmail   = results.filter(r => r.email_count > 0).length;

  return NextResponse.json({
    city: city.label,
    total: results.length,
    with_website: withWebsite,
    with_email: withEmail,
    hit_rate: withWebsite > 0 ? `${Math.round(withEmail / withWebsite * 100)}%` : "0%",
    studios: results,
  });
}
