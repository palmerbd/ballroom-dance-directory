// ─── First Lesson Price Index ─────────────────────────────────────────────────
// Original data: what studios publish about their intro offers and prices, read
// from each studio's own website on a stated date. One report per metro, rendered
// by app/lesson-prices/[city]/page.tsx. Facts we haven't checked stay null and are
// not shown (booksOnline / paysOnline arrive with the monthly checker).

export interface LessonPriceStudio {
  name:          string;
  area:          string;          // city the studio is in
  slug:          string;          // BDD listing slug
  website:       string;          // studio home page
  source:        string;          // page the intro offer was read from
  introOffer:    string | null;   // as published, in our words
  introPrice:    number | null;   // USD, the intro offer's price
  otherPrices?:  string;          // other prices the site publishes
  noPartner:     boolean | null;  // site says no partner is needed
  beginnerClass: string | null;   // what the site says about a beginner class
  booksOnline?:  boolean | null;  // not checked yet → undefined/null
  paysOnline?:   boolean | null;
  featured?:     boolean;         // paid Featured listing on BDD
  note?:         string;
}

export interface LessonPriceReport {
  slug:        string;
  city:        string;
  state:       string;
  stateAbbr:   string;
  checkedOn:   string;            // ISO date the sites were read
  cityHub?:    string;
  bookingRank?: string;           // /dancebookingrank/<slug>
  studios:     LessonPriceStudio[];
}

export const LESSON_PRICES: LessonPriceReport[] = [
  {
    slug: "fort-worth-tx",
    city: "Fort Worth",
    state: "Texas",
    stateAbbr: "TX",
    checkedOn: "2026-11-07",
    cityHub: "/studios/city/fort-worth",
    bookingRank: "/dancebookingrank/fort-worth-tx",
    studios: [
      {
        name: "Dance With Me Fort Worth", area: "Fort Worth", slug: "dance-with-me-fort-worth-fort-worth",
        website: "https://dancewithmeusa.com/studio/fort-worth-tx-dance-studio/",
        source: "https://dancewithmeusa.com/studio/fort-worth-tx-dance-studio/",
        introOffer: "1 private lesson + 1 group class", introPrice: 49,
        otherPrices: "Group classes $30; private lessons $132 to $170",
        noPartner: true, beginnerClass: "Described as for beginners",
        note: "Site said the offer expires November 30.",
      },
      {
        name: "Fred Astaire Southlake", area: "Southlake", slug: "fred-astaire-dance-studio-southlake-southlake",
        website: "https://www.fredastaire.com/southlake/",
        source: "https://www.fredastaire.com/southlake/introductory-offer/",
        introOffer: "2 private intro lessons", introPrice: 75,
        noPartner: true, beginnerClass: "Described as for beginners", featured: true,
      },
      {
        name: "Arthur Murray Grapevine", area: "Grapevine", slug: "arthur-murray-dance-studio-of-grapevine-irving",
        website: "https://arthurmurraygrapevine.com/",
        source: "https://arthurmurraygrapevine.com/",
        introOffer: "First lesson and consultation", introPrice: 50,
        noPartner: true, beginnerClass: "Has a beginner lessons page",
      },
      {
        name: "Dance With Me Southlake", area: "Southlake", slug: "dance-with-me-southlake-southlake",
        website: "https://dancewithmeusa.com/studio/southlake-texas-dance-studio/",
        source: "https://dancewithmeusa.com/studio/southlake-texas-dance-studio/",
        introOffer: "1 private lesson + 1 group class or social party", introPrice: 49,
        noPartner: true, beginnerClass: "Beginner-friendly Social Patterns class, Tue to Thu 6:50 pm",
        note: "Site said the offer expires November 30.",
      },
      {
        name: "The Dance Place", area: "Grapevine", slug: "the-dance-place-grapevine",
        website: "https://thedanceplacetexas.com/",
        source: "https://thedanceplacetexas.com/",
        introOffer: "Introductory special (contents not listed)", introPrice: 74,
        otherPrices: "Weekly classes and socials $20 per person",
        noPartner: true, beginnerClass: "Beginner class 7:30 pm, no partner needed",
      },
      {
        name: "Volta Dance Studio", area: "Fort Worth", slug: "volta-dance-studio-fort-worth",
        website: "https://voltadancestudio.com/",
        source: "https://voltadancestudio.com/private-dance-lessons",
        introOffer: null, introPrice: null,
        otherPrices: "Lesson packages $600 to $2,250",
        noPartner: true, beginnerClass: "Group classes described as designed for beginners",
      },
      {
        name: "Fred Astaire Fort Worth", area: "Fort Worth", slug: "fred-astaire-dance-studio-fort-worth-fort-worth",
        website: "https://www.fredastaire.com/ft-worth/",
        source: "https://www.fredastaire.com/ft-worth/introductory-offer/",
        introOffer: "2 private sessions, 30 minutes each", introPrice: 99,
        noPartner: true, beginnerClass: "Beginners group class every Saturday",
      },
      {
        name: "Arthur Murray Fort Worth", area: "Fort Worth", slug: "arthur-murray-dance-studio-of-fort-worth-fort-worth",
        website: "https://fwdance.com/",
        source: "https://fwdance.com/",
        introOffer: "First private dance lessons (number not stated)", introPrice: 25,
        noPartner: null, beginnerClass: "Described as welcoming beginners",
      },
      {
        name: "Fred Astaire Colleyville", area: "Colleyville", slug: "fred-astaire-dance-of-colleyville-colleyville",
        website: "https://www.fredastaire.com/colleyville/",
        source: "https://www.fredastaire.com/colleyville/introductory-offer/",
        introOffer: "2 private lessons, 30 minutes each, + 1 social party", introPrice: 75,
        noPartner: true, beginnerClass: null,
      },
      {
        name: "Daily Dance Services", area: "Keller", slug: "daily-dance-services-keller",
        website: "http://www.dailydanceservices.com/",
        source: "http://www.dailydanceservices.com/",
        introOffer: null, introPrice: null,
        noPartner: null, beginnerClass: null,
      },
      {
        name: "RL Dance Studio", area: "Burleson", slug: "rl-dance-studio-burleson",
        website: "https://www.rldancestudio.com/",
        source: "https://www.rldancestudio.com/wedding-dance-lessons-burleson",
        introOffer: null, introPrice: null,
        otherPrices: "Group classes $20 for non-members; wedding package from $1,299 for 10 private lessons",
        noPartner: true, beginnerClass: null,
      },
      {
        name: "DanceMakers of Texas", area: "Fort Worth", slug: "dancemakers-of-texas-fort-worth",
        website: "https://dancemakersoftexas.com/",
        source: "https://dancemakersoftexas.com/pricing/",
        introOffer: null, introPrice: null,
        otherPrices: "6-week class series $135; social dances $20",
        noPartner: true, beginnerClass: "Described as beginner to advanced",
      },
    ],
  },
];

export function getLessonPriceReport(slug: string): LessonPriceReport | undefined {
  return LESSON_PRICES.find((r) => r.slug === slug);
}

/** Headline numbers, always computed from the rows so they can't drift. */
export function summarize(r: LessonPriceReport) {
  const prices = r.studios.map((s) => s.introPrice).filter((p): p is number => typeof p === "number").sort((a, b) => a - b);
  const mid = prices.length / 2;
  const median = prices.length === 0 ? null
    : prices.length % 2 ? prices[Math.floor(mid)] : (prices[mid - 1] + prices[mid]) / 2;
  return {
    total:        r.studios.length,
    withPrice:    prices.length,
    min:          prices[0] ?? null,
    max:          prices[prices.length - 1] ?? null,
    median,
    noPartner:    r.studios.filter((s) => s.noPartner === true).length,
    namedClass:   r.studios.filter((s) => /\b(class)\b.*\b(every|tue|mon|wed|thu|fri|sat|sun|\d{1,2}(:\d{2})?\s?(am|pm))/i.test(s.beginnerClass || "")).length,
    booksOnlineChecked: r.studios.some((s) => typeof s.booksOnline === "boolean"),
    paysOnlineChecked:  r.studios.some((s) => typeof s.paysOnline === "boolean"),
  };
}

export function fmtCheckedOn(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** The price-report row for a studio listing, if one of our reports covers it. */
export function findStudioPrice(studioSlug: string): { report: LessonPriceReport; studio: LessonPriceStudio } | null {
  for (const report of LESSON_PRICES) {
    const studio = report.studios.find((x) => x.slug === studioSlug);
    if (studio) return { report, studio };
  }
  return null;
}
