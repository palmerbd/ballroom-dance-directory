/**
 * /api/crawl-owners
 * =================
 * Crawls studio website pages (About, Team, Staff, Instructors) to extract
 * the studio owner / founder / director name.
 * No Google API calls — zero cost.
 *
 * POST /api/crawl-owners
 * Body: { studios: Array<{ name: string, website: string }> }
 * Returns: Array<{ name, website, owner_first, owner_last, owner_name, source_page, status }>
 *
 * Max batch size: 30 (Vercel serverless 60s timeout)
 */

import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Pages to try, in order — most likely to have owner names first
const ABOUT_PATHS = [
  "/about",
  "/about-us",
  "/about-us/",
  "/our-team",
  "/meet-us",
  "/meet-the-team",
  "/staff",
  "/instructors",
  "/our-instructors",
  "/meet-your-instructor",
  "/team",
  "", // homepage last — least specific
];

// Trigger words that signal a person's role (case-insensitive)
const OWNER_TRIGGERS = [
  "owner",
  "founder",
  "co-founder",
  "co founder",
  "director",
  "studio director",
  "head instructor",
  "chief instructor",
  "principal instructor",
  "lead instructor",
  "principal",
];

// Noise names to reject
const NOISE_NAMES = new Set([
  "About Us", "Our Team", "Meet Us", "The Team", "Our Staff",
  "Dance Studio", "Ballroom Dance", "Dance Lessons", "Dance School",
  "Contact Us", "Home", "Welcome", "Read More", "Learn More",
  "Follow Us", "Sign Up", "Log In", "Book Now", "Get Started",
  "All Rights", "Privacy Policy", "Terms Of Service",
]);

/**
 * Extract clean text from HTML — strip tags, decode basic entities.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Check if a string looks like a real person name:
 * - 2–4 words
 * - Each word is Title Case (first letter uppercase, rest lowercase or hyphen)
 * - No digits
 * - Min 2 chars per word
 */
function looksLikeName(candidate: string): boolean {
  if (!candidate) return false;
  const words = candidate.trim().split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  if (NOISE_NAMES.has(candidate)) return false;
  return words.every(w =>
    w.length >= 2 &&
    /^[A-Z][a-zA-Z'\-\.]+$/.test(w) &&
    !/\d/.test(w)
  );
}

/**
 * Split a full name into first and last components.
 * Handles: "First Last", "First Middle Last", "First de Last", "Mr. First Last"
 */
function splitName(fullName: string): { first: string; last: string } {
  const words = fullName.trim().split(/\s+/);
  // Drop honorifics
  const honorifics = /^(Mr|Mrs|Ms|Dr|Prof|Sir|Mme|Mde|Msr)\.?$/i;
  const filtered = words.filter(w => !honorifics.test(w));
  if (filtered.length === 0) return { first: "", last: "" };
  if (filtered.length === 1) return { first: filtered[0], last: "" };
  const last = filtered[filtered.length - 1];
  const first = filtered.slice(0, -1).join(" ");
  return { first, last };
}

interface OwnerResult {
  owner_name: string;
  owner_first: string;
  owner_last: string;
  source_page: string;
}

/**
 * Strategy 1: schema.org Person markup
 * Looks for <script type="application/ld+json"> with @type: Person
 */
function trySchemaOrg(html: string): string | null {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const entries = Array.isArray(data) ? data : [data];
      for (const entry of entries) {
        // Could be top-level or nested under @graph
        const nodes = entry["@graph"] ? [...entry["@graph"], entry] : [entry];
        for (const node of nodes) {
          if (
            node["@type"] === "Person" &&
            typeof node["name"] === "string" &&
            node["name"].trim().length > 0
          ) {
            // Check for role keyword
            const jobTitle = (node["jobTitle"] ?? "").toLowerCase();
            const description = (node["description"] ?? "").toLowerCase();
            const isOwner = OWNER_TRIGGERS.some(t =>
              jobTitle.includes(t) || description.includes(t)
            );
            if (isOwner || jobTitle.length === 0) {
              return node["name"].trim();
            }
          }
        }
      }
    } catch {
      // malformed JSON — skip
    }
  }
  return null;
}

/**
 * Strategy 2: Trigger-word proximity scan
 * Searches text for an owner/founder/director trigger word,
 * then looks within ±120 chars for a Title Case name pattern.
 */
function tryTriggerProximity(text: string): string | null {
  const triggerPattern = new RegExp(
    `(${OWNER_TRIGGERS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  // Title Case name: 2-4 words, each starting with capital
  const namePattern = /\b([A-Z][a-z'\-]{1,20})(?:\s+[A-Z][a-z'\-]{1,20}){1,3}\b/g;

  let m: RegExpExecArray | null;
  while ((m = triggerPattern.exec(text)) !== null) {
    const start = Math.max(0, m.index - 120);
    const end = Math.min(text.length, m.index + 120);
    const window = text.slice(start, end);

    let nm: RegExpExecArray | null;
    const nameRe = new RegExp(namePattern.source, "g");
    while ((nm = nameRe.exec(window)) !== null) {
      const candidate = nm[0].trim();
      if (looksLikeName(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

/**
 * Strategy 3: Heading tags on about/team pages
 * On pages like /about or /our-team, the first meaningful h1/h2/h3
 * that looks like a name is likely the owner.
 */
function tryHeadings(html: string): string | null {
  const headingRe = /<h[123][^>]*>([\s\S]*?)<\/h[123]>/gi;
  let m;
  while ((m = headingRe.exec(html)) !== null) {
    const text = htmlToText(m[1]).trim();
    if (looksLikeName(text)) {
      return text;
    }
  }
  return null;
}

/**
 * Fetch a URL with 6s timeout and standard browser-like headers.
 */
async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BDD-Directory/1.0; +https://ballroomdancedirectory.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Run all three extraction strategies against an HTML page.
 */
function extractOwner(html: string, isAboutPage: boolean): string | null {
  // 1. Schema.org — most reliable when present
  const schema = trySchemaOrg(html);
  if (schema && looksLikeName(schema)) return schema;

  const text = htmlToText(html);

  // 2. Trigger-word proximity
  const trigger = tryTriggerProximity(text);
  if (trigger) return trigger;

  // 3. Headings — only reliable on about/team pages, not homepage
  if (isAboutPage) {
    const heading = tryHeadings(html);
    if (heading) return heading;
  }

  return null;
}

async function findOwnerForStudio(website: string): Promise<OwnerResult | null> {
  if (!website || !website.startsWith("http")) return null;

  let base: string;
  try {
    const parsed = new URL(website);
    base = `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return null;
  }

  for (const path of ABOUT_PATHS) {
    const url = path === "" ? website : `${base}${path}`;
    const isAboutPage = path !== "";

    const html = await fetchPage(url);
    if (!html) continue;

    const name = extractOwner(html, isAboutPage);
    if (name) {
      const { first, last } = splitName(name);
      return {
        owner_name: name,
        owner_first: first,
        owner_last: last,
        source_page: path || "/",
      };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let body: { studios?: Array<{ name: string; website: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const studios = body.studios ?? [];
  if (!studios.length) {
    return NextResponse.json(
      { error: "No studios provided" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  if (studios.length > 30) {
    return NextResponse.json(
      { error: "Max batch size is 30" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const results = await Promise.allSettled(
    studios.map(async (s) => {
      const result = await findOwnerForStudio(s.website);
      return {
        name: s.name,
        website: s.website,
        owner_name: result?.owner_name ?? "",
        owner_first: result?.owner_first ?? "",
        owner_last: result?.owner_last ?? "",
        source_page: result?.source_page ?? "",
        status: result ? "found" : "no_owner",
      };
    })
  );

  const output = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          name: studios[i].name,
          website: studios[i].website,
          owner_name: "",
          owner_first: "",
          owner_last: "",
          source_page: "",
          status: "error",
        }
  );

  const found = output.filter((r) => r.owner_name).length;

  return NextResponse.json(
    {
      total: output.length,
      found,
      hit_rate: `${Math.round((found / output.length) * 100)}%`,
      results: output,
    },
    { headers: CORS_HEADERS }
  );
}
