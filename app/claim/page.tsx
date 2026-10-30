"use client";

// ─── /claim — Studio Claim Flow ──────────────────────────────────────────────────────────────────────────────
// 3-step wizard:
//   Step 1 → Search for your studio
//   Step 2 → Confirm selection + enter owner info
//   Step 3 → Email sent — check inbox for magic link

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────────────────────

interface StudioResult {
  id:    number;
  slug:  string;
  title: string;
  city:  string;
  state: string;
}

type Step = "search" | "confirm" | "sent" | "already_claimed";

// ── Constants ─────────────────────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

// ── Sub-components ─────────────────────────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ["Find your studio", "Confirm & verify", "Check your email"];
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
                  background: done ? "#b8922a" : active ? "linear-gradient(135deg,#b8922a,#e8c560)" : "#e5e7eb",
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
                style={{ background: done ? "#b8922a" : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────────────────────────

function ClaimPageInner() {
  const searchParams = useSearchParams();
  const preloadSlug  = searchParams.get("slug") || "";

  const [step,          setStep]          = useState<Step>("search");
  const [query,         setQuery]         = useState("");
  const [results,       setResults]       = useState<StudioResult[]>([]);
  const [searching,     setSearching]     = useState(false);
  const [selected,      setSelected]      = useState<StudioResult | null>(null);
  const [ownerName,     setOwnerName]     = useState("");
  const [ownerPhone,    setOwnerPhone]    = useState("");
  const [ownerEmail,    setOwnerEmail]    = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-select studio when slug is passed from the studio detail page
  useEffect(() => {
    if (!preloadSlug) return;
    (async () => {
      try {
        const res = await fetch(`/api/studios/search?slug=${encodeURIComponent(preloadSlug)}`);
        if (!res.ok) return;
        const data: StudioResult[] = await res.json();
        if (!data.length) return;
        const studio = data[0];
        setSelected(studio);
        setQuery(studio.title);
        setStep("confirm");
      } catch { /* non-fatal */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadSlug]);

  // Search proxy as user types
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/studios/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error();
        const mapped: StudioResult[] = await res.json();
        setResults(mapped);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function handleSelect(studio: StudioResult) {
    setSelected(studio);
    setQuery(studio.title);
    setResults([]);
    setStep("confirm");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !ownerName.trim() || !ownerEmail.trim()) return;
    setSubmitting(true);
    setError("");

    localStorage.setItem("pendingClaim", JSON.stringify({
      studio_id:    selected.id,
      studio_slug:  selected.slug,
      studio_title: selected.title,
      owner_name:   ownerName.trim(),
      owner_email:  ownerEmail.trim(),
      owner_phone:  ownerPhone.trim(),
    }));

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: ownerEmail.trim(),
      options: {
        emailRedirectTo: `${SITE_URL}/claim/callback`,
        // Pass ALL claim fields so the callback can read them via user_metadata
        // even if the magic link is opened in a different browser (localStorage fallback)
        data: {
          studio_id:    selected.id,
          studio_slug:  selected.slug,
          studio_title: selected.title,
          owner_name:   ownerName.trim(),
          owner_email:  ownerEmail.trim(),
          owner_phone:  ownerPhone.trim(),
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
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
        className="py-12 px-6 text-center">
        <nav className="text-sm mb-6">
          <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
          <span className="text-white/30 mx-2">/</span>
          <span className="text-white/80">Claim Your Listing</span>
        </nav>
        <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>
          Claim Your Studio Listing
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-base">
          Are you the owner or manager of a dance studio listed here? Claim your listing to
          get a Verified Owner badge and manage your studio&apos;s information.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step !== "already_claimed" && <StepIndicator current={stepNum} />}

          {step === "search" && (
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Find your studio</h2>
              <p className="text-gray-500 text-sm mb-5">Search by studio name, city, or address.</p>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Arthur Murray Las Vegas"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  autoFocus
                />
                {searching && <div className="absolute right-3 top-3.5 text-gray-400 text-xs">Searching…</div>}
              </div>
              {results.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {results.map((s, i) => (
                    <button key={s.id} onClick={() => handleSelect(s)}
                      className={`w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors flex items-center justify-between group ${i > 0 ? "border-t border-gray-100" : ""}`}>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-yellow-800">{s.title}</div>
                        {(s.city || s.state) && <div className="text-gray-400 text-xs mt-0.5">{[s.city, s.state].filter(Boolean).join(", ")}</div>}
                      </div>
                      <span className="text-yellow-500 text-xs font-semibold opacity-0 group-hover:opacity-100">Select →</span>
                    </button>
                  ))}
                </div>
              )}
              {query.length >= 2 && !searching && results.length === 0 && (
                <p className="text-gray-400 text-sm mt-3 text-center">
                  No studios found for &ldquo;{query}&rdquo;.{" "}
                  <Link href="/contact" className="text-yellow-700 hover:underline">Contact us</Link>{" "}
                  if your studio isn&apos;t listed yet.
                </p>
              )}
            </div>
          )}

          {step === "confirm" && selected && (
            <form onSubmit={handleSubmit}>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Confirm your studio</h2>
              <p className="text-gray-500 text-sm mb-5">Verify this is the correct listing, then enter your contact info.</p>
              <div className="rounded-xl p-4 mb-6 flex items-start justify-between"
                style={{ background: "#fffbf0", border: "1.5px solid #e8c560" }}>
                <div>
                  <div className="font-bold text-gray-900">{selected.title}</div>
                  {(selected.city || selected.state) && (
                    <div className="text-gray-500 text-sm mt-0.5">{[selected.city, selected.state].filter(Boolean).join(", ")}</div>
                  )}
                  <Link href={`/studios/${selected.slug}`} target="_blank"
                    className="text-xs text-yellow-700 hover:underline mt-1 inline-block">View listing ↗</Link>
                </div>
                <button type="button" onClick={() => { setSelected(null); setStep("search"); setQuery(""); }}
                  className="text-xs text-gray-400 hover:text-gray-700 ml-2 shrink-0">Change</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input type="email" required value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="you@yourstudio.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100" />
                  <p className="text-xs text-gray-400 mt-1">We&apos;ll send a magic link to this address to verify your identity.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Phone Number <span className="text-gray-300">(optional)</span>
                  </label>
                  <input type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100" />
                </div>
              </div>
              {error && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
              <p className="text-xs text-gray-400 mt-5 mb-4">
                By submitting this form you confirm you are an authorized representative of{" "}
                <strong>{selected.title}</strong> and agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>.
              </p>
              <button type="submit" disabled={submitting || !ownerName.trim() || !ownerEmail.trim()}
                className="w-full py-3 rounded-xl font-bold text-gray-900 text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
                {submitting ? "Sending magic link…" : "Send Verification Email"}
              </button>
            </form>
          )}

          {step === "sent" && (
            <div className="text-center py-4">
              <div className="text-5xl mb-5">📬</div>
              <h2 className="font-bold text-gray-900 text-xl mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-4">
                We sent a magic link to <strong>{ownerEmail}</strong>.
                Click the link in that email to verify your identity and complete your claim.
              </p>
              <p className="text-gray-400 text-xs">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button onClick={() => { setStep("confirm"); setError(""); }} className="text-yellow-700 hover:underline">try again</button>.
              </p>
            </div>
          )}

          {step === "already_claimed" && (
            <div className="text-center py-4">
              <div className="text-5xl mb-5">✋</div>
              <h2 className="font-bold text-gray-900 text-xl mb-2">Already claimed</h2>
              <p className="text-gray-500 text-sm mb-4">
                This listing has already been claimed by a verified owner.
                If you believe this is an error, please{" "}
                <Link href="/contact" className="text-yellow-700 hover:underline">contact us</Link>.
              </p>
              <Link href="/studios" className="inline-block mt-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
                ← Back to directory
              </Link>
            </div>
          )}
        </div>

        {step === "search" || step === "confirm" ? (
          <p className="text-center text-xs text-gray-400 mt-6">
            Claiming your listing is free. We verify ownership before displaying the Verified badge.
          </p>
        ) : null}
        {step === "search" || step === "confirm" ? (
          <p className="text-center text-sm text-gray-500 mt-3">
            Already manage a listing?{" "}
            <Link href="/login" className="font-semibold text-yellow-700 hover:underline">Owner Login</Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<main style={{ background: "#f8f7f4", minHeight: "100vh" }} className="flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full" /></main>}>
      <ClaimPageInner />
    </Suspense>
  );
}
