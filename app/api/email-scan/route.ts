/**
 * /api/email-scan
 * ===============
 * Uses Google Places textsearch for "ballroom dance studio in [city]"
 * → Place Details to get website/phone, then scrapes each studio website
 * for email addresses (mailto: links + regex).
 *
 * GET /api/email-scan?city=chicago
 * GET /api/email-scan?city=los-angeles
 *
 * Returns JSON array of studio results with emails found.
 */

import { NextRequest, NextResponse } from "next/server";

const PLACES_KEY = process.env.PLACES_API_KEY!;
// NOTE: "rating" deliberately excluded — it triggers the Atmosphere Data Enterprise SKU
// (only 1,000 free/month vs 5,000 for Contact Data). Not needed for email outreach.
const DETAIL_FIELDS = "name,formatted_address,formatted_phone_number,website,url,business_status";

const CITIES: Record<string, { label: string; searchLabel: string }> = {
  // Tier 1 — largest markets (original 25)
  "chicago":          { label: "Chicago, IL",           searchLabel: "Chicago, IL" },
  "los-angeles":      { label: "Los Angeles, CA",       searchLabel: "Los Angeles, CA" },
  "new-york":         { label: "New York, NY",          searchLabel: "New York, NY" },
  "houston":          { label: "Houston, TX",           searchLabel: "Houston, TX" },
  "dallas":           { label: "Dallas, TX",            searchLabel: "Dallas, TX" },
  "miami":            { label: "Miami, FL",             searchLabel: "Miami, FL" },
  "atlanta":          { label: "Atlanta, GA",           searchLabel: "Atlanta, GA" },
  "phoenix":          { label: "Phoenix, AZ",           searchLabel: "Phoenix, AZ" },
  "seattle":          { label: "Seattle, WA",           searchLabel: "Seattle, WA" },
  "denver":           { label: "Denver, CO",            searchLabel: "Denver, CO" },
  "las-vegas":        { label: "Las Vegas, NV",         searchLabel: "Las Vegas, NV" },
  "boston":           { label: "Boston, MA",            searchLabel: "Boston, MA" },
  "san-diego":        { label: "San Diego, CA",         searchLabel: "San Diego, CA" },
  "austin":           { label: "Austin, TX",            searchLabel: "Austin, TX" },
  "tampa":            { label: "Tampa, FL",             searchLabel: "Tampa, FL" },
  "nashville":        { label: "Nashville, TN",         searchLabel: "Nashville, TN" },
  "orlando":          { label: "Orlando, FL",           searchLabel: "Orlando, FL" },
  "portland":         { label: "Portland, OR",          searchLabel: "Portland, OR" },
  "minneapolis":      { label: "Minneapolis, MN",       searchLabel: "Minneapolis, MN" },
  "charlotte":        { label: "Charlotte, NC",         searchLabel: "Charlotte, NC" },
  "san-antonio":      { label: "San Antonio, TX",       searchLabel: "San Antonio, TX" },
  "sacramento":       { label: "Sacramento, CA",        searchLabel: "Sacramento, CA" },
  "kansas-city":      { label: "Kansas City, MO",       searchLabel: "Kansas City, MO" },
  "columbus":         { label: "Columbus, OH",          searchLabel: "Columbus, OH" },
  "indianapolis":     { label: "Indianapolis, IN",      searchLabel: "Indianapolis, IN" },
  // Tier 4 — new expansion cities
  "philadelphia":     { label: "Philadelphia, PA",      searchLabel: "Philadelphia, PA" },
  "san-jose":         { label: "San Jose, CA",          searchLabel: "San Jose, CA" },
  "fort-worth":       { label: "Fort Worth, TX",        searchLabel: "Fort Worth, TX" },
  "jacksonville":     { label: "Jacksonville, FL",      searchLabel: "Jacksonville, FL" },
  "raleigh":          { label: "Raleigh, NC",           searchLabel: "Raleigh, NC" },
  "memphis":          { label: "Memphis, TN",           searchLabel: "Memphis, TN" },
  "louisville":       { label: "Louisville, KY",        searchLabel: "Louisville, KY" },
  "richmond":         { label: "Richmond, VA",          searchLabel: "Richmond, VA" },
  "new-orleans":      { label: "New Orleans, LA",       searchLabel: "New Orleans, LA" },
  "salt-lake-city":   { label: "Salt Lake City, UT",    searchLabel: "Salt Lake City, UT" },
  "tucson":           { label: "Tucson, AZ",            searchLabel: "Tucson, AZ" },
  "albuquerque":      { label: "Albuquerque, NM",       searchLabel: "Albuquerque, NM" },
  "st-louis":         { label: "St. Louis, MO",         searchLabel: "St. Louis, MO" },
  "pittsburgh":       { label: "Pittsburgh, PA",        searchLabel: "Pittsburgh, PA" },
  "cleveland":        { label: "Cleveland, OH",         searchLabel: "Cleveland, OH" },
  "cincinnati":       { label: "Cincinnati, OH",        searchLabel: "Cincinnati, OH" },
  "milwaukee":        { label: "Milwaukee, WI",         searchLabel: "Milwaukee, WI" },
  "detroit":          { label: "Detroit, MI",           searchLabel: "Detroit, MI" },
  "baltimore":        { label: "Baltimore, MD",         searchLabel: "Baltimore, MD" },
  "washington-dc":    { label: "Washington, DC",        searchLabel: "Washington, DC" },
  "virginia-beach":   { label: "Virginia Beach, VA",    searchLabel: "Virginia Beach, VA" },
  "oklahoma-city":    { label: "Oklahoma City, OK",     searchLabel: "Oklahoma City, OK" },
  "el-paso":          { label: "El Paso, TX",           searchLabel: "El Paso, TX" },
  "colorado-springs": { label: "Colorado Springs, CO",  searchLabel: "Colorado Springs, CO" },
  "omaha":            { label: "Omaha, NE",             searchLabel: "Omaha, NE" },
  // Tier 5 — third expansion batch
  "fresno":           { label: "Fresno, CA",            searchLabel: "Fresno, CA" },
  "long-beach":       { label: "Long Beach, CA",        searchLabel: "Long Beach, CA" },
  "bakersfield":      { label: "Bakersfield, CA",       searchLabel: "Bakersfield, CA" },
  "riverside":        { label: "Riverside, CA",         searchLabel: "Riverside, CA" },
  "corpus-christi":   { label: "Corpus Christi, TX",    searchLabel: "Corpus Christi, TX" },
  "lexington":        { label: "Lexington, KY",         searchLabel: "Lexington, KY" },
  "greensboro":       { label: "Greensboro, NC",        searchLabel: "Greensboro, NC" },
  "buffalo":          { label: "Buffalo, NY",           searchLabel: "Buffalo, NY" },
  "madison":          { label: "Madison, WI",           searchLabel: "Madison, WI" },
  "lubbock":          { label: "Lubbock, TX",           searchLabel: "Lubbock, TX" },
  "durham":           { label: "Durham, NC",            searchLabel: "Durham, NC" },
  "spokane":          { label: "Spokane, WA",           searchLabel: "Spokane, WA" },
  "boise":            { label: "Boise, ID",             searchLabel: "Boise, ID" },
  "rochester":        { label: "Rochester, NY",         searchLabel: "Rochester, NY" },
  "baton-rouge":      { label: "Baton Rouge, LA",       searchLabel: "Baton Rouge, LA" },
  "des-moines":       { label: "Des Moines, IA",        searchLabel: "Des Moines, IA" },
  "knoxville":        { label: "Knoxville, TN",         searchLabel: "Knoxville, TN" },
  "birmingham":       { label: "Birmingham, AL",        searchLabel: "Birmingham, AL" },
  "huntsville":       { label: "Huntsville, AL",        searchLabel: "Huntsville, AL" },
  "columbia-sc":      { label: "Columbia, SC",          searchLabel: "Columbia, SC" },
  "greenville-sc":    { label: "Greenville, SC",        searchLabel: "Greenville, SC" },
  "tacoma":           { label: "Tacoma, WA",            searchLabel: "Tacoma, WA" },
  "little-rock":      { label: "Little Rock, AR",       searchLabel: "Little Rock, AR" },
  "wichita":          { label: "Wichita, KS",           searchLabel: "Wichita, KS" },
  "scottsdale":       { label: "Scottsdale, AZ",        searchLabel: "Scottsdale, AZ" },
  // Tier 6 — fourth expansion batch
  "san-francisco":    { label: "San Francisco, CA",     searchLabel: "San Francisco, CA" },
  "fort-lauderdale":  { label: "Fort Lauderdale, FL",   searchLabel: "Fort Lauderdale, FL" },
  "st-petersburg":    { label: "St. Petersburg, FL",    searchLabel: "St. Petersburg, FL" },
  "tallahassee":      { label: "Tallahassee, FL",       searchLabel: "Tallahassee, FL" },
  "savannah":         { label: "Savannah, GA",          searchLabel: "Savannah, GA" },
  "honolulu":         { label: "Honolulu, HI",          searchLabel: "Honolulu, HI" },
  "grand-rapids":     { label: "Grand Rapids, MI",      searchLabel: "Grand Rapids, MI" },
  "ann-arbor":        { label: "Ann Arbor, MI",         searchLabel: "Ann Arbor, MI" },
  "reno":             { label: "Reno, NV",              searchLabel: "Reno, NV" },
  "henderson":        { label: "Henderson, NV",         searchLabel: "Henderson, NV" },
  "jersey-city":      { label: "Jersey City, NJ",       searchLabel: "Jersey City, NJ" },
  "newark":           { label: "Newark, NJ",            searchLabel: "Newark, NJ" },
  "allentown":        { label: "Allentown, PA",         searchLabel: "Allentown, PA" },
  "providence":       { label: "Providence, RI",        searchLabel: "Providence, RI" },
  "chattanooga":      { label: "Chattanooga, TN",       searchLabel: "Chattanooga, TN" },
  "plano":            { label: "Plano, TX",             searchLabel: "Plano, TX" },
  "arlington-tx":     { label: "Arlington, TX",         searchLabel: "Arlington, TX" },
  "irving":           { label: "Irving, TX",            searchLabel: "Irving, TX" },
  "amarillo":         { label: "Amarillo, TX",          searchLabel: "Amarillo, TX" },
  "norfolk":          { label: "Norfolk, VA",           searchLabel: "Norfolk, VA" },
  "chesapeake":       { label: "Chesapeake, VA",        searchLabel: "Chesapeake, VA" },
  "bellevue":         { label: "Bellevue, WA",          searchLabel: "Bellevue, WA" },
  "green-bay":        { label: "Green Bay, WI",         searchLabel: "Green Bay, WI" },
  "sioux-falls":      { label: "Sioux Falls, SD",       searchLabel: "Sioux Falls, SD" },
};

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = new Set([
  "sentry.io","example.com","wixpress.com","squarespace.com",
  "googleapis.com","gstatic.com","cloudflare.com","amazonaws.com",
  "schema.org","2x.png","3x.png",
]);

// ── Places helpers ────────────────────────────────────────────────────────────

async function textSearch(cityLabel: string): Promise<any[]> {
  const params = new URLSearchParams({
    query: `ballroom dance studio in ${cityLabel}`,
    type: "establishment",
    key: PLACES_KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.error("Places textsearch error:", data.status, data.error_message);
  }
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

  // 1. Text search for ballroom dance studios in the city
  const places = await textSearch(city.searchLabel);

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
