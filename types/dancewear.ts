// ─── Dancewear Data Types ──────────────────────────────────────────────────────

export type DancewearCategory = "practice" | "competition";

export type DancewearTier = "free" | "claimed" | "paid";

export const DANCEWEAR_CATEGORY_LABELS: Record<DancewearCategory, string> = {
  practice:    "Practice Wear",
  competition: "Competition Wear",
};

// ── Core interface ─────────────────────────────────────────────────────────────

export interface DancewearBrand {
  /** URL slug — e.g. "chrisanne-clover" */
  slug:        string;
  /** Brand display name */
  name:        string;
  /** Full website URL */
  website:     string;
  /** 1–2 sentence description of the brand */
  description: string;
  /** Phone number if available, else null */
  phone:       string | null;
  /** Email if available, else null */
  email:       string | null;
  /** One or both categories */
  categories:  DancewearCategory[];
  /** Listing tier */
  tier:        DancewearTier;
}
