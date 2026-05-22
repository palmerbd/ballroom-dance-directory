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

// Pages to try in order — most likely to have owner names first
// Kept short to stay within Vercel's 60s serverless timeout
const ABOUT_PATHS = [
  "/about",
  "/about-us",
  "/our-team",
  "/staff",
  "/instructors",
  "", // homepage last
];

// Trigger words that signal a person's role
const OWNER_TRIGGERS = [
  "owner",
  "co-owner",
  "founder",
  "co-founder",
  "director",
  "studio director",
  "head instructor",
  "chief instructor",
  "principal instructor",
  "lead instructor",
  "principal",
];

// Words that must NEVER appear as any word in a valid person name
// (business nouns, job titles, abstract words)
const NOT_IN_NAME = new Set([
  "manager","director","instructor","teacher","coach","trainer",
  "staff","admin","assistant","coordinator","specialist","consultant",
  "professional","development","scholarship","class","classes","lessons",
  "lesson","program","programs","foundation","services","solutions",
  "sales","membership","marketing","support","service","representative",
  "rep","executive","associate","partner","agent","advisor","liaison",
  "specialist","technician","analyst","operations","communications",
  "media","digital","creative","events","production","management",
]);

// CSS class/id fragments that typically wrap a person's name in team/bio sections
const NAME_CONTAINER_PATTERNS = [
  "staff-name", "member-name", "team-name", "person-name",
  "bio-name", "instructor-name", "author-name", "owner-name",
  "team_name", "member_name", "instructor_name", "person_title",
  "card-title", "card-name",
];

// 400 most common American first names (covers ~95% of real names encountered)
const COMMON_FIRST_NAMES = new Set([
  "james","john","robert","michael","william","david","richard","joseph","thomas","charles",
  "christopher","daniel","matthew","anthony","mark","donald","steven","paul","andrew","kenneth",
  "george","joshua","kevin","brian","edward","ronald","timothy","jason","jeffrey","ryan",
  "jacob","gary","nicholas","eric","jonathan","stephen","larry","justin","scott","brandon",
  "benjamin","samuel","raymond","frank","gregory","frank","raymond","alexander","patrick","jack",
  "dennis","jerry","tyler","aaron","jose","adam","henry","nathan","douglas","zachary","peter",
  "kyle","walter","ethan","jeremy","harold","terry","sean","christian","austin","joe","arthur",
  "lawrence","dylan","jesse","jordan","bryan","billy","joe","bruce","ralph","roy","eugene",
  "alan","juan","wayne","albert","bobby","carlos","joe","luis","johnny","adam","lance","derek",
  "mary","patricia","jennifer","linda","barbara","elizabeth","susan","jessica","sarah","karen",
  "lisa","nancy","betty","margaret","sandra","ashley","dorothy","kimberly","emily","donna",
  "michelle","carol","amanda","melissa","deborah","stephanie","rebecca","sharon","laura","cynthia",
  "kathleen","amy","angela","shirley","anna","brenda","pamela","emma","nicole","helen","samantha",
  "katherine","christine","debra","rachel","carolyn","janet","catherine","maria","heather","diane",
  "julie","joyce","victoria","kelly","christina","joan","evelyn","lauren","judith","olivia","megan",
  "cheryl","andrea","katharine","meredith","julia","jacqueline","grace","amber","alice","jean",
  "denise","danielle","brittany","diana","abigail","chelsea","natalie","sophia","madison","tiffany",
  "marie","crystal","rita","claire","april","virginia","teresa","janice","vanessa","gloria",
  "connie","tammy","dawn","stacy","leah","renee","dawn","gina","monica","wendy","robin","tracy",
  "beverly","holly","erin","courtney","jill","natasha","kathy","alyssa","caitlin","brooke",
  "autumn","miranda","candice","bridget","kate","paige","haley","alexis","taylor","jessica",
  "brittney","audrey","veronica","kelsey","tara","lori","marissa","shannon","melanie","shelby",
  "allison","gillian","lorraine","sherri","marcia","jenna","dana","faith","penny","kristin",
  "marlene","sheila","elaine","ann","sue","peggy","ruth","eileen","georgia","ellen","linda",
  "leann","kathryn","petra","lana","gail","carol","fiona","valerie","dee","lisa",
]);

function isLikelyFirstName(word: string): boolean {
  return COMMON_FIRST_NAMES.has(word.toLowerCase());
}

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
 * Strict name validation:
 * - 2–3 words only
 * - Each word Title Case
 * - No digits
 * - FIRST word must be a recognized common English first name
 * - Min 2 chars per word, max 18
 */
function isValidPersonName(candidate: string): boolean {
  if (!candidate) return false;
  const words = candidate.trim().split(/\s+/);
  if (words.length < 2 || words.length > 3) return false;
  const allTitleCase = words.every(
    w => w.length >= 2 && w.length <= 18 && /^[A-Z][a-zA-Z'\-]+$/.test(w) && !/\d/.test(w)
  );
  if (!allTitleCase) return false;
  // First word must be a real first name
  if (!isLikelyFirstName(words[0])) return false;
  // No word in the name can be a business noun / job title
  return !words.some(w => NOT_IN_NAME.has(w.toLowerCase()));
}

/**
 * Split a full name into first and last.
 */
function splitName(fullName: string): { first: string; last: string } {
  const words = fullName.trim().split(/\s+/);
  const honorifics = /^(Mr|Mrs|Ms|Dr|Prof|Sir)\.?$/i;
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

// Business type words that often follow an owner name in a studio name
const BUSINESS_SUFFIXES =
  /\s+(?:dance|dancing|ballroom|studio|studios|school|academy|center|centre|arts|ballet|movement|fitness|instruction|lessons|training|inc|llc)[\s,.]*/i;

/**
 * Strategy -1: Extract owner name directly from the studio business name.
 * "Nancy Thompson Dance Studio" → "Nancy Thompson"
 * "Kim Lesher Ballroom" → "Kim Lesher"
 * Only fires if the name leads with a valid person name before a known suffix.
 */
function tryStudioName(studioName: string): string | null {
  const cleaned = studioName
    .replace(/\bby\b/i, "")  // "Dance Studio by Sandra" → skip (format not handled)
    .trim();

  // Pattern: starts with "First Last" followed by a business suffix
  const m = cleaned.match(/^([A-Z][a-z'\-]{1,17}\s+[A-Z][a-z'\-]{1,17})(?:'s?)?\s+(?:dance|dancing|ballroom|studio|studios|school|academy|center|centre|arts|ballet|movement|fitness)/i);
  if (m) {
    const candidate = m[1].trim();
    if (isValidPersonName(candidate)) return candidate;
  }
  return null;
}

/**
 * Strategy 0: HTML class/id attribute scan
 * Looks for elements whose class or id contains known name-container patterns.
 */
function tryClassPatterns(html: string): string | null {
  const pattern = new RegExp(
    `(?:class|id)="[^"]*(?:${NAME_CONTAINER_PATTERNS.join("|")})[^"]*"[^>]*>([^<]{2,50})<`,
    "gi"
  );
  let m;
  while ((m = pattern.exec(html)) !== null) {
    const candidate = htmlToText(m[1]).trim();
    if (isValidPersonName(candidate)) return candidate;
  }
  return null;
}

/**
 * Strategy 1: schema.org Person markup
 */
function trySchemaOrg(html: string): string | null {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const entries = Array.isArray(data) ? data : [data];
      for (const entry of entries) {
        const nodes = entry["@graph"] ? [...entry["@graph"], entry] : [entry];
        for (const node of nodes) {
          if (node["@type"] === "Person" && typeof node["name"] === "string") {
            const candidate = node["name"].trim();
            const jobTitle = (node["jobTitle"] ?? "").toLowerCase();
            const isOwner =
              OWNER_TRIGGERS.some(t => jobTitle.includes(t)) || jobTitle.length === 0;
            if (isOwner && isValidPersonName(candidate)) return candidate;
          }
        }
      }
    } catch {
      // malformed JSON
    }
  }
  return null;
}

/**
 * Strategy 2: Trigger-word proximity scan
 * Finds a trigger word (owner/founder/director) then looks within ±150 chars
 * for a valid person name.
 */
function tryTriggerProximity(text: string): string | null {
  const triggerPattern = new RegExp(
    `(${OWNER_TRIGGERS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );
  const namePattern = /\b([A-Z][a-z'\-]{1,17})(?:\s+[A-Z][a-z'\-]{1,17}){1,2}\b/g;

  let m: RegExpExecArray | null;
  while ((m = triggerPattern.exec(text)) !== null) {
    const start = Math.max(0, m.index - 150);
    const end = Math.min(text.length, m.index + 150);
    const window = text.slice(start, end);

    let nm: RegExpExecArray | null;
    const nameRe = new RegExp(namePattern.source, "g");
    while ((nm = nameRe.exec(window)) !== null) {
      const candidate = nm[0].trim();
      if (isValidPersonName(candidate)) return candidate;
    }
  }
  return null;
}

/**
 * Strategy 3: "Hi I'm / My name is" patterns
 * Common in small business about pages.
 */
function tryIntroPattern(text: string): string | null {
  const introPattern = /(?:hi[,!]?\s+i(?:'m|'m|`m|\s+am)|my name is|i(?:'m|'m|`m)\s+)([A-Z][a-z'\-]{1,17}(?:\s+[A-Z][a-z'\-]{1,17}){1,2})/gi;
  let m;
  while ((m = introPattern.exec(text)) !== null) {
    const candidate = m[1].trim();
    if (isValidPersonName(candidate)) return candidate;
  }
  return null;
}

/**
 * Strategy 4: Headings on about pages — restricted to 2-3 words matching a real name
 */
function tryHeadings(html: string): string | null {
  const headingRe = /<h[123][^>]*>([\s\S]*?)<\/h[123]>/gi;
  let m;
  while ((m = headingRe.exec(html)) !== null) {
    const text = htmlToText(m[1]).trim();
    if (isValidPersonName(text)) return text;
  }
  return null;
}

/**
 * Fetch a URL with 6s timeout.
 */
async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
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
 * Run all extraction strategies against a fetched HTML page.
 */
function extractOwner(html: string, isAboutPage: boolean): string | null {
  // 0. HTML class patterns — most precise
  const cls = tryClassPatterns(html);
  if (cls) return cls;

  // 1. Schema.org
  const schema = trySchemaOrg(html);
  if (schema) return schema;

  const text = htmlToText(html);

  // 2. "Hi I'm..." intro patterns
  const intro = tryIntroPattern(text);
  if (intro) return intro;

  // 3. Trigger-word proximity
  const trigger = tryTriggerProximity(text);
  if (trigger) return trigger;

  // 4. Headings — only on about/team pages
  if (isAboutPage) {
    const heading = tryHeadings(html);
    if (heading) return heading;
  }

  return null;
}

async function findOwnerForStudio(studioName: string, website: string): Promise<OwnerResult | null> {
  // Strategy -1: extract name from the studio business name (zero network cost)
  const fromTitle = tryStudioName(studioName);
  if (fromTitle) {
    const { first, last } = splitName(fromTitle);
    return { owner_name: fromTitle, owner_first: first, owner_last: last, source_page: "studio_name" };
  }

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
      const result = await findOwnerForStudio(s.name, s.website);
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
