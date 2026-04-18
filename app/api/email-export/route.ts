/**
 * /api/email-export
 * =================
 * Runs all 25 cities concurrently via textsearch + Place Details + email scrape,
 * then returns a combined CSV file for download.
 *
 * GET /api/email-export
 * GET /api/email-export?cities=dallas,miami,houston  (subset)
 */

import { NextRequest, NextResponse } from "next/server";

const PLACES_KEY = process.env.PLACES_API_KEY!;
const DETAIL_FIELDS = "name,formatted_address,formatted_phone_number,website,rating,url,business_status";

const ALL_CITIES: Record<string, { label: string }> = {
  "chicago":       { label: "Chicago, IL" },
  "los-angeles":   { label: "Los Angeles, CA" },
  "new-york":      { label: "New York, NY" },
  "houston":       { label: "Houston, TX" },
  "dallas":        { label: "Dallas, TX" },
  "miami":         { label: "Miami, FL" },
  "atlanta":       { label: "Atlanta, GA" },
  "phoenix":       { label: "Phoenix, AZ" },
  "seattle":       { label: "Seattle, WA" },
  "denver":        { label: "Denver, CO" },
  "las-vegas":     { label: "Las Vegas, NV" },
  "boston":        { label: "Boston, MA" },
  "san-diego":     { label: "San Diego, CA" },
  "austin":        { label: "Austin, TX" },
  "tampa":         { label: "Tampa, FL" },
  "nashville":     { label: "Nashville, TN" },
  "orlando":       { label: "Orlando, FL" },
  "portland":      { label: "Portland, OR" },
  "minneapolis":   { label: "Minneapolis, MN" },
  "charlotte":     { label: "Charlotte, NC" },
  "san-antonio":   { label: "San Antonio, TX" },
  "sacramento":    { label: "Sacramento, CA" },
  "kansas-city":   { label: "Kansas City, MO" },
  "columbus":      { label: "Columbus, OH" },
  "indianapolis":  { label: "Indianapolis, IN" },
};

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = new Set([
  "sentry.io","example.com","wixpress.com","squarespace.com",
  "googleapis.com","gstatic.com","cloudflare.com","amazonaws.com",
  "schema.org","2x.png","3x.png",
]);

async function textSearch(cityLabel: string): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      query: `ballroom dance studio in ${cityLabel}`,
      type: "establishment",
      key: PLACES_KEY,
    });
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
    const data = await res.json();
    return data.results ?? [];
  } catch { return []; }
}

async function getPlaceDetails(placeId: string): Promise<any> {
  try {
    const params = new URLSearchParams({ place_id: placeId, fields: DETAIL_FIELDS, key: PLACES_KEY });
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    const data = await res.json();
    return data.result ?? {};
  } catch { return {}; }
}

function cleanEmails(raw: string[], siteDomain: string): string[] {
  const filtered = raw.filter(e => {
    const domain = e.split("@")[1]?.toLowerCase() ?? "";
    if ([...SKIP_DOMAINS].some(s => domain.includes(s))) return false;
    if (domain.match(/\.(png|jpg|gif|svg|webp)$/)) return false;
    if (e.length > 80) return false;
    if (e.includes("user@domain")) return false;
    return true;
  });
  const sameDomain = filtered.filter(e => e.split("@")[1]?.includes(siteDomain));
  return [...new Set(sameDomain.length ? sameDomain : filtered)].map(e => e.toLowerCase());
}

async function scrapeEmailsFromUrl(url: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BDD-Scraper/1.0)" },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const html = await res.text();
    const emails: string[] = [];
    const mailtoRe = /mailto:([^"'?\s>]+)/gi;
    let m;
    while ((m = mailtoRe.exec(html)) !== null) {
      const e = m[1].split("?")[0].trim();
      if (e.includes("@")) emails.push(e);
    }
    emails.push(...(html.match(EMAIL_RE) ?? []));
    return emails;
  } catch { return []; }
}

async function scrapeStudioEmail(website: string): Promise<string[]> {
  if (!website) return [];
  try {
    const parsed = new URL(website.startsWith("http") ? website : `https://${website}`);
    const siteDomain = parsed.hostname.replace("www.", "");
    const base = `${parsed.protocol}//${parsed.hostname}`;
    let emails = await scrapeEmailsFromUrl(website);
    if (emails.length === 0) emails = await scrapeEmailsFromUrl(`${base}/contact`);
    if (emails.length === 0) emails = await scrapeEmailsFromUrl(`${base}/contact-us`);
    if (emails.length === 0) emails = await scrapeEmailsFromUrl(`${base}/about`);
    return cleanEmails(emails, siteDomain);
  } catch { return []; }
}

async function scrapeCity(slug: string, label: string) {
  const places = await textSearch(label);
  const detailResults = await Promise.allSettled(places.map(p => getPlaceDetails(p.place_id)));
  const studios = detailResults
    .filter(r => r.status === "fulfilled")
    .map(r => (r as PromiseFulfilledResult<any>).value)
    .filter(d => d.name && d.business_status !== "CLOSED_PERMANENTLY");

  const withEmails = await Promise.allSettled(
    studios.map(async (s) => {
      const emails = await scrapeStudioEmail(s.website ?? "");
      return {
        name: s.name ?? "",
        city: label,
        address: s.formatted_address ?? "",
        phone: s.formatted_phone_number ?? "",
        website: s.website ?? "",
        emails: emails.join("; "),
        email_count: emails.length,
        status: !s.website ? "no_website" : emails.length > 0 ? "found" : "no_email",
        google_maps_url: s.url ?? "",
      };
    })
  );
  return withEmails
    .filter(r => r.status === "fulfilled")
    .map(r => (r as PromiseFulfilledResult<any>).value);
}

function escCsv(v: string) {
  return '"' + String(v ?? "").replace(/"/g, '""') + '"';
}

export async function GET(req: NextRequest) {
  if (!PLACES_KEY) {
    return NextResponse.json({ error: "PLACES_API_KEY not set" }, { status: 500 });
  }

  const cityParam = req.nextUrl.searchParams.get("cities");
  const cityKeys = cityParam
    ? cityParam.split(",").filter(c => ALL_CITIES[c.trim()])
    : Object.keys(ALL_CITIES);

  // Run all cities concurrently
  const cityResults = await Promise.allSettled(
    cityKeys.map(slug => scrapeCity(slug, ALL_CITIES[slug].label))
  );

  const allStudios = cityResults
    .filter(r => r.status === "fulfilled")
    .flatMap(r => (r as PromiseFulfilledResult<any>).value);

  // Build CSV
  const header = "name,city,address,phone,website,emails,email_count,status,google_maps_url\n";
  const rows = allStudios.map(s =>
    [
      escCsv(s.name), escCsv(s.city), escCsv(s.address), escCsv(s.phone),
      escCsv(s.website), escCsv(s.emails), s.email_count,
      escCsv(s.status), escCsv(s.google_maps_url),
    ].join(",")
  );

  const withEmail = allStudios.filter(s => s.email_count > 0).length;
  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="bdd-studios-${new Date().toISOString().slice(0,10)}.csv"`,
      "X-Total-Studios": String(allStudios.length),
      "X-With-Email": String(withEmail),
      "X-Hit-Rate": allStudios.length > 0 ? `${Math.round(withEmail / allStudios.length * 100)}%` : "0%",
    },
  });
}
