"use client";

// ââ /claim â Studio Claim Flow âââââââââââââââââââââââââââââââââââââââââââââââ
// 3-step wizard:
//   Step 1 â Search for your studio
//   Step 2 â Confirm selection + enter owner info
//   Step 3 â Email sent â check inbox for magic link

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ââ Types âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

interface StudioResult {
  id:    number;
  slug:  string;
  title: string;
  city:  string;
  state: string;
}

type Step = "search" | "confirm" | "sent" | "already_claimed";

// ââ Constants âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || "http://5.78.144.42/wp-json";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

// ââ Sub-components âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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
                {done ? "â" : num}
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

// ââ Main Page âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function ClaimPage() {
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

  // Search WP API as user types
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `${WP_API}/wp/v2/dance_studio?search=${encodeURIComponent(query)}&per_page=8&_fields=id,slug,title,acf&status=publish`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const mapped: StudioResult[] = data.map((p: Record<string, unknown>) => ({
          id:    p.id as number,
          slug:  p.slug as string,
          title: (p.title as Record<string, string>)?.rendered || "",
          city:  ((p.acf as Record<string, unknown>)?.studio_address_city  as string) || "",
          state: ((p.acf as Record<string, unknown>)?.studio_address_state as string) || "",
        }));
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

    // Store pending claim data in localStorage so callback page can read it
    localStorage.setItem("pendingClaim", JSON.stringify({
      studio_id:    selected.id,
      studio_slug:  selected.slug,
      studio_title: selected.title,
      owner_name:   ownerName.trim(),
      owner_email:  ownerEmail.trim(),
      owner_phone:  ownerPhone.trim(),
    }));

    // Send magic link via Supabase Auth
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: ownerEmail.trim(),
      options: {
        emailRedirectTo: `${SITE_URL}/claim/callback`,
        data: {
          studio_slug: selected.slug,
          owner_name:  ownerName.trim(),
        },
      },
    });

    setSubmitting(false);
    if (authError) {
      setError(authError.message || "Something went wrong. Please try again.");
      return;
    }
    setStep("sent");
  }

  // ââ Render âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  const stepNum = step === "search" ? 1 : step === "confirm" ? 2 : 3;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>

      {/* Header */}
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

      {/* Card */}
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {step !== "already_claimed" && <StepIndicator current={stepNum} />}

          {/* ââ Step 1: Search ââ */}
          {step === "search" && (
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Find your studio</h2>
              <p className="text-gray-500 text-sm mb-5">
                Search by studio name, city, or address.
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Arthur Murray Las Vegas"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-3 top-3.5 text-gray-400 text-xs">Searchingâ¦</div>
                )}
              </div>

              {results.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {results.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(s)}
                      className={`w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors
                                  flex items-center justify-between group
                                  ${i > 0 ? "border-t border-gray-100" : ""}`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-yellow-800">
                          {s.title}
                        </div>
                        {(s.city || s.state) && (
                          <div className="text-gray-400 text-xs mt-0.5">
                            {[s.city, s.state].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                      <span className="text-yellow-500 text-xs font-semibold opacity-0 group-hover:opacity-100">
                        Select â
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && !searching && results.length === 0 && (
                <p className="text-gray-400 text-sm mt-3 text-center">
                  No studios found for &ldquo;{query}&rdquo;.{" "}
                  <Link href="/contact" className="text-yellow-700 hover:underline">
                    Contact us
                  </Link>{" "}
                  if your studio isn&apos;t listed yet.
                </p>
              )}
            </div>
          )}

          {/* ââ Step 2: Confirm + owner info ââ */}
          {step === "confirm" && selected && (
            <form onSubmit={handleSubmit}>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Confirm your studio</h2>
              <p className="text-gray-500 text-sm mb-5">
                Verify this is the correct listing, then enter your contact info.
              </p>

              {/* Selected studio card */}
              <div
                className="rounded-xl p-4 mb-6 flex items-start justify-between"
                style={{ background: "#fffbf0", border: "1.5px solid #e8c560" }}
              >
                <div>
                  <div className="font-bold text-gray-900">{selected.title}</div>
                  {(selected.city || selected.state) && (
                    <div className="text-gray-500 text-sm mt-0.5">
                      {[selected.city, selected.state].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <Link
                    href={`/studios/${selected.slug}`}
                    target="_blank"
                    className="text-xs text-yellow-700 hover:underline mt-1 inline-block"
                  >
                    View listing â
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

              {/* Owner info fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                               focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="you@yourstudio.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                               focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    We&apos;ll send a magic link to this address to verify your identity.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Phone Number <span className="text-gray-300">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                               focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-5 mb-4">
                By submitting this form you confirm you are an authorized representative of{" "}
                <strong>{selected.title}</strong> and agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>.
              </p>

              <button
                type="submit"
                disabled={submitting || !ownerName.trim() || !ownerEmail.trim()}
                className="w-full py-3 rounded-xl font-bold text-gray-900 text-sm
                           transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
              >
                {submitting ? "Sending magic linkâ¦" : "Send Verification Email"}
              </button>
            </form>
          )}

          {/* ââ Step 3: Email sent ââ */}
          {step === "sent" && (
            <div className="text-center py-4">
              <div className="text-5xl mb-5">ð¬</div>
              <h2 className="font-bold text-gray-900 text-xl mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-4">
                We sent a magic link to <strong>{ownerEmail}</strong>.
                Click the link in that email to verify your identity and complete your claim.
              </p>
              <p className="text-gray-400 text-xs">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setStep("confirm"); setError(""); }}
                  className="text-yellow-700 hover:underline"
                >
                  try again
                </button>.
              </p>
            </div>
          )}

          {/* ââ Already claimed ââ */}
          {step === "already_claimed" && (
            <div className="text-center py-4">
              <div className="text-5xl mb-5">â</div>
              <h2 className="font-bold text-gray-900 text-xl mb-2">Already claimed</h2>
              <p className="text-gray-500 text-sm mb-4">
                This listing has already been claimed by a verified owner.
                If you believe this is an error, please{" "}
                <Link href="/contact" className="text-yellow-700 hover:underline">contact us</Link>.
              </p>
              <Link
                href="/studios"
                className="inline-block mt-2 text-sm font-semibold text-gray-500 hover:text-gray-900"
              >
                â Back to directory
              </Link>
            </div>
          )}

        </div>

        {/* Trust note */}
        {step === "search" || step === "confirm" ? (
          <p className="text-center text-xs text-gray-400 mt-6">
            Claiming your listing is free. We verify ownership before displaying the Verified badge.
          </p>
        ) : null}
      </div>
    </main>
  );
}
