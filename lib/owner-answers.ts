// ─── Owner answers ────────────────────────────────────────────────────────────
// Three questions every claimed studio owner can answer in the Owner Portal (free
// on every plan). Their words appear on the public studio page, quoted with their
// first name and the date — first-party content nobody else has.

export type OwnerAnswerKey = "first_visit" | "typical_student" | "what_different";

export interface OwnerAnswers {
  studio_slug:      string;
  claim_id?:        string | null;
  first_visit?:     string | null;
  typical_student?: string | null;
  what_different?:  string | null;
  answered_by?:     string | null;
  updated_at?:      string | null;
}

export const OWNER_QUESTIONS: { key: OwnerAnswerKey; question: string; hint: string }[] = [
  {
    key: "first_visit",
    question: "What should a first-timer expect at their first lesson?",
    hint: "How long it is, what you cover, what to wear, whether they need a partner.",
  },
  {
    key: "typical_student",
    question: "Who are your students, and who is your studio a great fit for?",
    hint: "Couples, singles, wedding couples, social dancers, competitors, ages.",
  },
  {
    key: "what_different",
    question: "What makes your teaching or your studio different?",
    hint: "Your approach, your instructors, your floor, your community.",
  },
];

export const OWNER_ANSWER_MAX = 600;
export const OWNER_ANSWER_MIN = 20;

/** Plain text only: tags stripped, whitespace collapsed, length capped. */
export function cleanAnswer(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, OWNER_ANSWER_MAX);
}

/** The answers worth showing publicly, in question order. */
export function publishedAnswers(a: OwnerAnswers | null | undefined) {
  if (!a) return [];
  return OWNER_QUESTIONS
    .map((q) => ({ ...q, answer: (a[q.key] || "").trim() }))
    .filter((q) => q.answer.length >= OWNER_ANSWER_MIN);
}

export function firstName(name?: string | null): string {
  return (name || "").replace(/\(.*?\)/g, "").trim().split(/\s+/)[0] || "";
}
