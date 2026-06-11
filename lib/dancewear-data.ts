// ─── Dancewear Brand Seed Data ─────────────────────────────────────────────────
// 11 ballroom/Latin dancewear brands (practice + competition).
// Phase 2 will migrate this to a WordPress CPT.

import type { DancewearBrand, DancewearCategory } from "@/types/dancewear";

export const DANCEWEAR_BRANDS: DancewearBrand[] = [

  // ── PRACTICE WEAR ────────────────────────────────────────────────────────────

  {
    slug:        "dance-and-sway",
    name:        "Dance and Sway",
    website:     "https://www.danceandsway.com",
    description: "One of the largest selections of fashionable dancewear, dance shoes, high heel boots, leotards, and costumes at great prices — a one-stop shop for ballroom and Latin practice attire.",
    phone:       null,
    email:       null,
    categories:  ["practice"],
    tier:        "free",
  },

  {
    slug:        "jeravae",
    name:        "Jeravae",
    website:     "https://www.jeravae.com",
    description: "Ballroom and Latin dancewear, shoes, and accessories with a focus on body-positive, inclusive collections that celebrate every dancer on the floor.",
    phone:       null,
    email:       null,
    categories:  ["practice"],
    tier:        "free",
  },

  {
    slug:        "danza",
    name:        "Danza",
    website:     "https://www.danzadanza.com",
    description: "Elegant practice wear for ballroom and Latin dancers — skirts, bodysuits, dresses, and jumpsuits designed for freedom of movement and style in every rehearsal.",
    phone:       null,
    email:       null,
    categories:  ["practice"],
    tier:        "free",
  },

  {
    slug:        "bravo-dance",
    name:        "Bravo Dance",
    website:     "https://www.bravo-dance.com",
    description: "Full-range ballroom and Latin dancewear and shoes, shipping from New Jersey with a wide selection for both men and women at competitive price points.",
    phone:       null,
    email:       null,
    categories:  ["practice"],
    tier:        "free",
  },

  {
    slug:        "zym-dance-style",
    name:        "ZYM Dance Style",
    website:     "https://www.zymdancestyle.com",
    description: "Simple yet stylish designs that combine fashion and functionality for the dance floor — ZYM offers practice wear that looks as good in the studio as it does on stage.",
    phone:       null,
    email:       null,
    categories:  ["practice"],
    tier:        "free",
  },

  {
    slug:        "drest-couture",
    name:        "Drest Couture",
    website:     "https://www.drestcouture.com",
    description: "Size-inclusive ballroom dance and practice wear in US sizes Small–4X, with custom sizing available — designed to fit and flatter every body type on the ballroom floor.",
    phone:       null,
    email:       null,
    categories:  ["practice"],
    tier:        "free",
  },

  {
    slug:        "dance-cake",
    name:        "Dance Cake",
    website:     "https://www.dancecake.com",
    description: "Custom designed and produced dance and practice wear, offering uniquely crafted pieces with luxurious packaging — couture-level practice attire for dancers who want to stand out.",
    phone:       null,
    email:       null,
    categories:  ["practice"],
    tier:        "free",
  },

  // ── COMPETITION WEAR ─────────────────────────────────────────────────────────

  {
    slug:        "dance-america",
    name:        "Dance America",
    website:     "https://www.dance-america.com",
    description: "Made-in-USA ballroom dancewear and shoes — a full attire line covering competition gowns, practice wear, and footwear for serious dancers at every level.",
    phone:       "(954) 601-1775",
    email:       "info@dance-america.com",
    categories:  ["competition"],
    tier:        "free",
  },

  {
    slug:        "dress4dance",
    name:        "Dress4Dance",
    website:     "https://dress4dance.com",
    description: "Award-winning designer of Latin and ballroom dance costumes for competition and training — couture gowns, men's attire, shoes, and accessories trusted by world champions.",
    phone:       "(609) 638-8533",
    email:       null,
    categories:  ["competition"],
    tier:        "free",
  },

  {
    slug:        "chrisanne-clover",
    name:        "Chrisanne Clover",
    website:     "https://www.chrisanne-clover.com",
    description: "The world's leading luxury dancewear brand — competition couture, practice wear, performance fabrics, and Preciosa crystals, available wholesale and retail worldwide.",
    phone:       "+44 20 8640 5921",
    email:       null,
    categories:  ["practice", "competition"],
    tier:        "free",
  },

  {
    slug:        "dore-designs",
    name:        "Doré Designs",
    website:     "https://doredesigns.com",
    description: "An internationally recognized name in ballroom fashion — Doré Designs creates high-quality Smooth, Ballroom, Rhythm, and Latin Dancesport dresses for competition.",
    phone:       "(239) 542-7708",
    email:       "info@doredesigns.com",
    categories:  ["competition"],
    tier:        "free",
  },

];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getByCategory(category: DancewearCategory): DancewearBrand[] {
  return DANCEWEAR_BRANDS.filter((b) => b.categories.includes(category));
}

export function getBySlug(slug: string): DancewearBrand | undefined {
  return DANCEWEAR_BRANDS.find((b) => b.slug === slug);
}
