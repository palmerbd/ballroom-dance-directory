"use client";

// ─── /competitions/claim — Competition Organizer Claim Flow ──────────────────
// 3-step wizard:
//   Step 1 → Search for your competition (client-side filter of COMPETITIONS array)
//   Step 2 → Confirm selection + enter organizer info
//   Step 3 → Email sent — check inbox for magic link

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { COMPETITIONS } from "@/lib/competitions-data";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CompetitionResult {
  slug:  string;
  name:  string;
  city:  string;
  state: string;
  style: string;
}

type Step = "search" | "confirm" | "sent" | "already_claimed";

// ── Constants ──────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

// ── Helpers ────────────────────────────────────────────────────────────────────

function searchCompetitions(query: string): CompetitionResult[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];
  return COMPETITIONS
    .filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q) ||
      c.style?.toLowerCase().includes(q)
    )
    .slice(0, 8)
    .map((c) => ({
      slug:  c.slug,
      name:  c.name,
      city:  c.city  || "",
      state: c.state || "",
      style: c.style || "",
    }));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ["Find your competition", "Confirm & verify", "Check your email"];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const num    = i + 1;
        const active = num === current;
        const done   = num < current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: done ? "#1d4ed8" : active ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : "#e5e7eb",
                  color:      done || active ? "#fff" : "#9ca3af",
                }}
              >
                {done ? "✓" : num}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? "text-gray-900" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-0.5 w-12 mx-2 mb-5"
                style={{ background: done ? "#1d4ed8" : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

function CompetitionClaimPageInner() {
  const searchParams  = useSearchParams();
  const preloadSlug   = searchParams.get("slug") || "";

  const [step,           setStep]           = useState<Step>("search");
  const [query,          setQuery]          = useState("");
  const [results,        setResults]        = useState<CompetitionResult[]>([]);
  const [selected,       setSelected]       = useState<CompetitionResult | null>(null);
  const [organizerName,  setOrganizerName]  = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-select when ?slug= is passed from competition detail page
  useEffect(() => {
    if (!preloadSlug) return;
    const match = COMPETITIONS.find((c) => c.slug === preloadSlug);
    if (!match) return;
    const result: CompetitionResult = {
      slug:  match.slug,
      name:  match.name,
      city:  match.city  || "",
      state: match.state || "",
      style: match.style || "",
    };
    setSelected(result);
    setQuery(match.name);
    setStep("confirm");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadSlug]);

  // Live search as user types (200 ms debounce)
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(searchCompetitions(query));
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function handleSelect(comp: CompetitionResult) {
    setSelected(comp);
    setQuery(comp.name);
    setResults([]);
    setStep("confirm");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !organizerName.trim() || !organizerEmail.trim()) return;
    setSubmitting(true);
    setError("");

    // Check if already claimed before sending the magic link
    try {
      const statusRes = await fetch(
        `/api/competition-claim/status?slug=${encodeURIComponent(selected.slug)}`
      );
      if (statusRes.ok) {
        const { claimed } = await statusRes.json();
        if (claimed) {
          setStep("already_claimed");
          setSubmitting(false);
          return;
        }
      }
    } catch { /* non-fatal — proceed to OTP */ }

    // Save claim data to localStorage (same-device fallback)
    localStorage.setItem("pendingCompetitionClaim", JSON.stringify({
      competition_slug:  selected.slug,
      competition_name:  selected.name,
      organizer_name:    organizerName.trim(),
      organizer_email:   organizerEmail.trim(),
      organizer_phone:   organizerPhone.trim(),
    }));

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: organizerEmail.trim(),
      options: {
        emailRedirectTo: `${SITE_URL}/competitions/claim/callback`,
        // Embed claim fields in OTP metadata for cross-device fallback
        data: {
          competition_slug:  selected.slug,
          competition_name:  selected.name,
          organizer_name:    organizerName.trim(),
          organizer_email:   organizerEmail.trim(),
          organizer_phone:   organizerPhone.trim(),
        },
      },
    });

    setSubmitting(false);
    if (authError) {
      const raw = authError.message?.toLowerCase() || "";
      if (raw.includes("rate limit") || raw.includes("exceeded") || raw.includes("too many")) {
        setError(
          "Too many verification emails sent to this address. Please wait a few minutes, then try again — or check your spam folder for a previous magic link."
        );
      } else {
        setError(authError.message || "Something went wrong. Please try again.");
      }
      return;
    }
    setStep("sent");
  }

  const stepNum = step === "search" ? 1 : step === "confirm" ? 2 : 3;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
      {/* Hero */}
      <div
        style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
        className="py-12 px-6 text-center"
      >
        <nav className="text-sm mb-6">
          <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
          <span className="text-white/30 mx-2">/</span>
          <Link href="/competitions" className="text-white/50 hover:text-white transition-colors">Competitions</Link>
          <span className="text-white/30 mx-2">/</span>
          <span className="text-white/80">Claim Your Listing</span>
        </nav>
        <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>
          Claim Your Competition Listing
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-base">
          Are you the organizer of a competition listed here? Claim your listing to manage
          dates, venues, registration links, and more.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Wizard card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step !== "already_claimed" && <StepIndicator current={stepNum} />}

          {/* ── Step 1: Search ── */}
          {step === "search" && (
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Find your competition</h2>
              <p className="text-gray-500 text-sm mb-5">Search by competition name, city, or dance style.</p>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Ohio Star Ball"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  autoFocus
                />
              </div>
              {results.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {results.map((c, i) => (
                    <button
                      key={c.slug}
                      onClick={() => handleSelect(c)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group ${i > 0 ? "border-t border-gray-100" : ""}`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-800">{c.name}</div>
                        {(c.city || c.state) && (
                          <div className="text-gray-400 text-xs mt-0.5">{[c.city, c.state].filter(Boolean).join(", ")}</div>
                        )}
                      </div>
                      <span className="text-blue-500 text-xs font-semibold opacity-0 group-hover:opacity-100">Select →</span>
                    </button>
                  ))}
                </div>
              )}
              {query.length >= 2 && results.length === 0 && (
                <p className="text-gray-400 text-sm mt-3 text-center">
                  No competitions found for &ldquo;{query}&rdquo;.{" "}
                  <Link href="/contact" className="text-blue-700 hover:underline">Contact us</Link>{" "}
                  if your competition isn&apos;t listed yet.
                </p>
              )}
            </div>
          )}

          {/* ── Step 2: Confirm + form ── */}
          {step === "confirm" && selected && (
            <form onSubmit={handleSubmit}>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Confirm your competition</h2>
              <p className="text-gray-500 text-sm mb-5">Verify this is the correct listing, then enter your contact info.</p>

              {/* Selected competition card */}
              <div
                className="rounded-xl p-4 mb-6 flex items-start justify-between"
                style={{ background: "#eff6ff", border: "1.5px solid #3b82f6" }}
              >
                <div>
                  <div className="font-bold text-gray-900">{selected.name}</div>
                  {(selected.city || selected.state) && (
                    <div className="text-gray-500 text-sm mt-0.5">
                      {[selected.city, selected.state].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <Link
                    href={`/competitions/${selected.slug}`}
                    target="_blank"
                    className="text-xs text-blue-700 hover:underline mt-1 inline-block"
                  >
                    View listing ↗
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setStep("search"); setQuery(""); }}
                  className="text-xs text-gray-400 hover:text-gray-700 ml-2 shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Organizer fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    placeholder="you@yourcompetition.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">We&apos;ll send a magic link to this address to verify your identity.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Phone Number <span className="text-gray-300">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={organizerPhone}
                    onChange={(e) => setOrganizerPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <p className="text-xs text-gray-400 mt-5 mb-4">
                By submitting this form you confirm you are an authorized representative of{" "}
                <strong>{selected.name}</strong> and agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>.
              </p>

              <button
                type="submit"
                disabled={submitting || !organizerName.trim() || !organizerEmail.trim()}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
              >
                {submitting ? "Sending magic link…" : "Send Verification Email"}
              </button>
            </form>
          )}

          {/* ── Step 3: Sent ── */}
          {step === "sent" && (
            <div className="text-center py-4">
              <div className="text-5xl mb-5">📬</div>
              <h2 className="font-bold text-gray-900 text-xl mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-4">
                We sent a magic link to <strong>{organizerEmail}</strong>.
                Click the link in that email to verify your identity and complete your claim.
              </p>
              <p className="text-gray-400 text-xs">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setStep("confirm"); setError(""); }}
                  className="text-blue-700 hover:underline"
                >
                  try again
                </button>.
              </p>
            </div>
          )}

          {/* ── Already claimed ── */}
          {step === "already_claimed" && (
            <div className="text-center py-4">
              <div className="text-5xl mb-5">✋</div>
              <h2 className="font-bold text-gray-900 text-xl mb-2">Already claimed</h2>
              <p className="text-gray-500 text-sm mb-4">
                This listing has already been claimed by a verified organizer.
                If you believe this is an error, please{" "}
                <Link href="/contact" className="text-blue-700 hover:underline">contact us</Link>.
              </p>
              <Link href="/competitions" className="inline-block mt-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
                ← Back to competitions
              </Link>
            </div>
          )}
        </div>

        {(step === "search" || step === "confirm") && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Claiming your listing is free. We verify ownership before displaying the Verified badge.
          </p>
        )}

        {/* ── Pricing comparison (shown on search + sent steps) ── */}
        {(step === "search" || step === "sent") && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Free Listing</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">$0</p>
              <p className="text-xs text-gray-400 mb-5">Always free</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Claim & verify your listing",
                  "Update competition dates",
                  "Add website & registration link",
                  "Add description and venue",
                  "Appear in search results",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Featured */}
            <div className="bg-white rounded-2xl border-2 border-blue-400 p-6 relative overflow-hidden">
              <div
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
              >
                ⭐ Best Value
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Featured Listing</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">$199</p>
              <p className="text-xs text-gray-400 mb-5">per year</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Everything in Free, plus:",
                  "⭐ Featured badge on listings",
                  "Priority placement in results",
                  "\"Near You\" city page widget",
                  "Style & region landing pages",
                  "Direct registration promotion",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="font-bold text-blue-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CompetitionClaimPage() {
  return (
    <Suspense
      fallback={
        <main style={{ background: "#f8f7f4", minHeight: "100vh" }} className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
        </main>
      }
    >
      <CompetitionClaimPageInner />
    </Suspense>
  );
}
