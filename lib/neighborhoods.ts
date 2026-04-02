// ── Neighborhood Configuration ────────────────────────────────────────────────
// Maps city slugs → neighborhoods with address keywords for studio matching.
// Keywords are matched against the studio address field (case-insensitive).
// Add more cities/neighborhoods as new markets are scraped.

export type Neighborhood = {
  slug: string;
  name: string;
  /** Address substrings used to match studios to this neighborhood */
  keywords: string[];
  /** Short SEO paragraph about dance in this neighborhood */
  description: string;
};

export type CityConfig = {
  slug: string;
  name: string;
  state: string;
  stateAbbr: string;
  intro: string;
  tip: string;
  neighborhoods: Neighborhood[];
};

export const CITY_CONFIGS: CityConfig[] = [
  // ── Los Angeles ─────────────────────────────────────────────────────────────
  {
    slug: "los-angeles",
    name: "Los Angeles",
    state: "California",
    stateAbbr: "CA",
    intro:
      "Los Angeles is home to one of America's most vibrant private dance scenes — from Hollywood-adjacent ballrooms to beachside Latin studios in Santa Monica. Whether you're preparing for a wedding, competition, or simply want to move with more confidence, LA's elite instructors bring world-class technique to every session.",
    tip: "Many LA studios offer flexible scheduling and intro package deals. Ask about first-lesson specials to find the right instructor before committing.",
    neighborhoods: [
      {
        slug: "hollywood",
        name: "Hollywood",
        keywords: ["Hollywood", "N Highland", "N Vine", "Cahuenga", "Franklin Ave", "Selma"],
        description:
          "Hollywood's private dance studios draw from a creative community of performers, actors, and film industry professionals. Studios here often offer flexible evening scheduling to accommodate the entertainment industry's irregular hours.",
      },
      {
        slug: "beverly-hills",
        name: "Beverly Hills",
        keywords: ["Beverly Hills", "N Bedford", "N Rodeo", "N Camden", "N Canon", "Wilshire Blvd"],
        description:
          "Beverly Hills is home to some of the most upscale private dance studios in the country, with premium instruction for wedding couples, corporate clients, and dedicated enthusiasts. Expect world-class facilities and highly credentialed instructors.",
      },
      {
        slug: "santa-monica",
        name: "Santa Monica",
        keywords: ["Santa Monica", "Ocean Ave", "Pico Blvd", "Lincoln Blvd", "Main St", "Montana Ave"],
        description:
          "Santa Monica's dance studios reflect the beach city's relaxed yet health-conscious lifestyle. Studios here often blend fitness and artistic expression, with strong offerings in Latin dance styles and contemporary movement.",
      },
      {
        slug: "west-hollywood",
        name: "West Hollywood",
        keywords: ["West Hollywood", "WeHo", "Sunset Blvd", "Santa Monica Blvd", "Melrose Ave"],
        description:
          "West Hollywood's inclusive, arts-forward culture makes it a welcoming destination for dancers of all backgrounds. Studios in WeHo are known for their creative programming and affirming learning environments.",
      },
      {
        slug: "studio-city",
        name: "Studio City",
        keywords: ["Studio City", "Ventura Blvd", "Lankershim Blvd", "Tujunga Ave"],
        description:
          "Studio City's convenient Valley location and strong creative community support a healthy dance studio scene. Many local instructors have professional performance backgrounds and bring that expertise into private lessons.",
      },
      {
        slug: "pasadena",
        name: "Pasadena",
        keywords: ["Pasadena", "Colorado Blvd", "S Lake Ave", "Fair Oaks"],
        description:
          "Pasadena's classic California architecture and affluent residential community support an active ballroom and Latin dance scene. Studios here tend to have loyal, long-term student bases and strong social dance programs.",
      },
      {
        slug: "burbank",
        name: "Burbank",
        keywords: ["Burbank", "San Fernando Blvd", "Victory Blvd", "Hollywood Way"],
        description:
          "Burbank's entertainment industry workforce and family-friendly neighborhoods create consistent demand for private dance instruction. Studios here often cater to both recreational learners and performance-track students.",
      },
      {
        slug: "long-beach",
        name: "Long Beach",
        keywords: ["Long Beach", "E 4th St", "E Broadway", "Atlantic Ave", "Pine Ave"],
        description:
          "Long Beach's diverse, coastal community supports a wide range of dance styles from ballroom to salsa to hip-hop. Private studios here tend to be more accessible in pricing while still offering serious instruction.",
      },
    ],
  },

  // ── Chicago ──────────────────────────────────────────────────────────────────
  {
    slug: "chicago",
    name: "Chicago",
    state: "Illinois",
    stateAbbr: "IL",
    intro:
      "Chicago's dance studio scene reflects the city's deep artistic roots — from Magnificent Mile ballrooms to neighborhood gems in Lincoln Park and the South Loop. The city's diverse cultural fabric shows in the range of styles offered, from competitive ballroom to Afro-Cuban rhythms.",
    tip: "Chicago winters mean studios can fill up quickly in January and February. Book ahead for prime evening slots, especially during the holiday season when wedding planning peaks.",
    neighborhoods: [
      {
        slug: "lincoln-park",
        name: "Lincoln Park",
        keywords: ["Lincoln Park", "N Clark St", "N Halsted", "Armitage", "N Lincoln Ave"],
        description:
          "Lincoln Park's affluent residential character and proximity to DePaul University create a consistent market for private dance instruction. Studios here are known for well-maintained facilities and experienced instructors.",
      },
      {
        slug: "river-north",
        name: "River North",
        keywords: ["River North", "W Grand Ave", "N Orleans St", "W Illinois St", "N Wells St"],
        description:
          "River North's position as Chicago's gallery and entertainment district makes it a natural home for creative arts including dance. Studios in this neighborhood often cater to young professionals and the corporate event market.",
      },
      {
        slug: "wicker-park",
        name: "Wicker Park",
        keywords: ["Wicker Park", "N Milwaukee Ave", "N Damen Ave", "Division St", "North Ave"],
        description:
          "Wicker Park's artistic, counterculture community supports innovative dance studios that blend traditional technique with contemporary styles. Studios here tend to attract a younger, more experimental crowd.",
      },
      {
        slug: "gold-coast",
        name: "Gold Coast",
        keywords: ["Gold Coast", "N Rush St", "E Delaware Pl", "N Lake Shore", "E Oak St"],
        description:
          "Chicago's Gold Coast is home to premium private dance studios catering to the city's most affluent residents. Expect top-tier instructors, elegant facilities, and a client base serious about long-term skill development.",
      },
      {
        slug: "loop",
        name: "The Loop",
        keywords: ["Loop", "W Jackson", "W Madison", "State St", "W Randolph", "W Washington"],
        description:
          "Downtown Chicago's Loop district is a convenient destination for office workers looking to take lessons during lunch or after work. Studios here emphasize efficient scheduling and quick skill development.",
      },
      {
        slug: "lakeview",
        name: "Lakeview",
        keywords: ["Lakeview", "N Broadway", "W Belmont", "N Clark St", "W Addison"],
        description:
          "Lakeview's diverse, neighborhood-feel community supports accessible, community-oriented dance studios. This area is particularly known for its social dance community and regular dance socials and events.",
      },
    ],
  },

  // ── Dallas ───────────────────────────────────────────────────────────────────
  {
    slug: "dallas",
    name: "Dallas",
    state: "Texas",
    stateAbbr: "TX",
    intro:
      "Dallas has a passionate dance community built around both the social scene and the competitive circuit. From classic Texas Two-Step to sophisticated ballroom, Lone Star City studios offer world-class private instruction with Southern hospitality.",
    tip: "Dallas studios often specialize in either social or competitive dancing. Ask upfront which direction your instructor leans to make sure it aligns with your goals.",
    neighborhoods: [
      {
        slug: "uptown",
        name: "Uptown",
        keywords: ["Uptown", "McKinney Ave", "Cedar Springs", "N Hall St"],
        description:
          "Dallas's Uptown neighborhood, with its young professional demographic and active nightlife, drives strong demand for social dance instruction — particularly salsa, swing, and ballroom for the social scene.",
      },
      {
        slug: "downtown",
        name: "Downtown Dallas",
        keywords: ["Downtown", "Commerce St", "Main St", "Elm St", "N Akard", "Jackson St"],
        description:
          "Downtown Dallas offers convenient studio access for the city's large corporate and professional workforce. Studios here often offer lunch-hour lessons and post-work scheduling.",
      },
      {
        slug: "plano",
        name: "Plano",
        keywords: ["Plano", "Preston Rd", "Legacy Dr", "W Parker Rd"],
        description:
          "Plano's affluent suburban community and family-oriented culture create strong demand for ballroom lessons, wedding dance instruction, and children's programs at private studios.",
      },
      {
        slug: "frisco",
        name: "Frisco",
        keywords: ["Frisco", "Preston Rd", "Eldorado Pkwy"],
        description:
          "One of the fastest-growing cities in Texas, Frisco's young family demographic keeps private dance studios busy with wedding lessons, youth competitions, and social dance programs.",
      },
      {
        slug: "irving",
        name: "Irving",
        keywords: ["Irving", "MacArthur Blvd", "N Story Rd", "W Airport Fwy"],
        description:
          "Irving's diverse, multicultural community — anchored by the Las Colinas business district — supports a wide range of dance styles. Latin dance instruction is particularly prominent here.",
      },
    ],
  },

  // ── Miami ────────────────────────────────────────────────────────────────────
  {
    slug: "miami",
    name: "Miami",
    state: "Florida",
    stateAbbr: "FL",
    intro:
      "Miami is the Latin dance capital of the United States. With deep Cuban, Colombian, and Caribbean cultural roots, the city's private dance studios offer authentic instruction in Salsa, Mambo, Bachata, and beyond — often from native instructors who grew up in these traditions.",
    tip: "Many Miami studios stay open late and accommodate evening sessions after 8pm. Mention your schedule when booking — they're often more flexible than their listed hours suggest.",
    neighborhoods: [
      {
        slug: "south-beach",
        name: "South Beach",
        keywords: ["South Beach", "Miami Beach", "Ocean Dr", "Collins Ave", "Washington Ave", "Alton Rd"],
        description:
          "South Beach's world-famous energy and Latin cultural influence make it one of the best places in the country to learn Cuban salsa, bachata, and other Caribbean styles from authentic, experienced instructors.",
      },
      {
        slug: "brickell",
        name: "Brickell",
        keywords: ["Brickell", "Brickell Ave", "SW 8th St", "SE 1st Ave", "Coral Way"],
        description:
          "Miami's financial district attracts a professional clientele seeking private dance lessons for corporate events, wedding preparation, and social enrichment. Studios here emphasize efficiency and quick results.",
      },
      {
        slug: "coral-gables",
        name: "Coral Gables",
        keywords: ["Coral Gables", "Miracle Mile", "Ponce De Leon", "Salzedo St", "Giralda Ave"],
        description:
          "Coral Gables's elegant Mediterranean architecture and affluent residential character support upscale private dance studios with premium facilities and highly credentialed instructors from across Latin America.",
      },
      {
        slug: "coconut-grove",
        name: "Coconut Grove",
        keywords: ["Coconut Grove", "Grand Ave", "Main Hwy", "McFarlane Rd"],
        description:
          "Coconut Grove's bohemian, artistic community creates a welcoming environment for creative dance exploration. Studios here often blend traditional Latin styles with contemporary movement and wellness practices.",
      },
      {
        slug: "aventura",
        name: "Aventura",
        keywords: ["Aventura", "Biscayne Blvd", "NE 199th St"],
        description:
          "Aventura's affluent, internationally diverse community supports premium private dance instruction. The area's large Latin American and European expatriate populations keep studios busy with authentic style requests.",
      },
    ],
  },

  // ── Houston ──────────────────────────────────────────────────────────────────
  {
    slug: "houston",
    name: "Houston",
    state: "Texas",
    stateAbbr: "TX",
    intro:
      "Houston's remarkable cultural diversity makes it one of the most eclectic dance cities in America. From polished River Oaks studios to inclusive Montrose neighborhood spaces, Houston offers private instruction across virtually every style and budget.",
    tip: "Houston traffic is real — factor commute time into your studio choice. Many Galleria-area studios offer validated parking, and the Metro Rail reaches a few key dance corridors.",
    neighborhoods: [
      {
        slug: "galleria",
        name: "Galleria / Uptown",
        keywords: ["Galleria", "Post Oak Blvd", "Westheimer Rd", "San Felipe", "W Loop South"],
        description:
          "The Galleria area is Houston's upscale commercial hub and home to some of the city's most established private dance studios. Easy freeway access and validated parking make it a practical choice for the after-work crowd.",
      },
      {
        slug: "midtown",
        name: "Midtown",
        keywords: ["Midtown", "Gray St", "Bagby St", "Milam St", "Elgin St"],
        description:
          "Houston's Midtown neighborhood blends urban energy with cultural diversity. Dance studios here attract a young professional crowd seeking social dance skills for Houston's active nightlife and events scene.",
      },
      {
        slug: "montrose",
        name: "Montrose",
        keywords: ["Montrose", "W Alabama", "Westheimer", "Montrose Blvd", "Richmond Ave"],
        description:
          "Montrose's creative, inclusive community makes it one of Houston's most welcoming neighborhoods for dance. Studios here are known for affirming, judgment-free learning environments and diverse style offerings.",
      },
      {
        slug: "sugar-land",
        name: "Sugar Land",
        keywords: ["Sugar Land", "Town Center Blvd", "First Colony"],
        description:
          "Sugar Land's affluent suburban community and large South Asian and East Asian populations create unique demand for both classical dance forms and ballroom styles. Studios here often serve multi-generational families.",
      },
      {
        slug: "the-woodlands",
        name: "The Woodlands",
        keywords: ["Woodlands", "The Woodlands", "Sawdust Rd", "Research Forest"],
        description:
          "The Woodlands' prosperous, family-oriented community supports premium private dance studios with strong youth programs, wedding preparation services, and adult social dance instruction.",
      },
    ],
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getCityConfig(citySlug: string): CityConfig | undefined {
  return CITY_CONFIGS.find((c) => c.slug === citySlug);
}

export function getNeighborhood(
  citySlug: string,
  neighborhoodSlug: string
): { city: CityConfig; neighborhood: Neighborhood } | undefined {
  const city = getCityConfig(citySlug);
  if (!city) return undefined;
  const neighborhood = city.neighborhoods.find((n) => n.slug === neighborhoodSlug);
  if (!neighborhood) return undefined;
  return { city, neighborhood };
}

/** Match studios to a neighborhood using keyword search on address field */
export function matchStudiosToNeighborhood(
  studios: { address?: string; city?: string; [key: string]: unknown }[],
  keywords: string[]
): typeof studios {
  const lower = keywords.map((k) => k.toLowerCase());
  return studios.filter((s) => {
    const addr = ((s.address as string) || "").toLowerCase();
    return lower.some((kw) => addr.includes(kw));
  });
}
