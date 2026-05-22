"use client";
// ─── StudioProfileEditor ──────────────────────────────────────────────────────
// Four-section dashboard panel for Featured-tier studio owners:
//   1. Custom Description
//   2. Social Media Links
//   3. Google Reviews toggle
//   4. Current Promotion builder

import { useEffect, useState } from "react";

interface Profile {
  custom_description?:  string | null;
  facebook_url?:        string | null;
  instagram_url?:       string | null;
  tiktok_url?:          string | null;
  show_google_reviews?: boolean;
  promo_text?:          string | null;
  promo_type?:          string | null;
  promo_savings?:       string | null;
  promo_end_date?:      string | null;
}

interface Props {
  claimId:     string;
  studioSlug:  string;
  studioTitle: string;
  studioCity:  string;
  studioState: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";
type ReviewFetchState = "idle" | "fetching" | "done" | "error";

export default function StudioProfileEditor({ claimId, studioSlug, studioTitle, studioCity, studioState }: Props) {
  const [profile,       setProfile]      = useState<Profile>({});
  const [loading,       setLoading]      = useState(true);
  const [saveState,     setSaveState]    = useState<SaveState>("idle");
  const [reviewState,   setReviewState]  = useState<ReviewFetchState>("idle");
  const [reviewMsg,     setReviewMsg]    = useState("");

  // Load existing profile
  useEffect(() => {
    fetch(`/api/studios/${studioSlug}/profile`)
      .then(r => r.json())
      .then(data => { setProfile(data || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studioSlug]);

  const update = (patch: Partial<Profile>) => setProfile(p => ({ ...p, ...patch }));

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/studios/${studioSlug}/profile`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ claim_id: claimId, ...profile }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 4000);
    }
  }

  async function handleFetchReviews() {
    setReviewState("fetching");
    setReviewMsg("");
    try {
      const res = await fetch(`/api/studios/${studioSlug}/reviews`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ claim_id: claimId, studio_title: studioTitle, city: studioCity, state: studioState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReviewMsg(`✅ ${data.count} review${data.count !== 1 ? "s" : ""} fetched and published to your listing.`);
      setReviewState("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setReviewMsg(`❌ ${msg}`);
      setReviewState("error");
    }
  }

  const saveLabel: Record<SaveState, string> = {
    idle:   "Save Changes",
    saving: "Saving…",
    saved:  "✅ Saved!",
    error:  "❌ Error — try again",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Section header ── */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
        >
          ✏️
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Featured Listing Settings</h2>
          <p className="text-xs text-gray-400">Customize how your studio appears to potential students</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          1. CUSTOM DESCRIPTION
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>📝</span> Studio Description
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Write your own description. This replaces the auto-generated text on your listing page.
        </p>
        <textarea
          value={profile.custom_description ?? ""}
          onChange={e => update({ custom_description: e.target.value })}
          rows={6}
          placeholder="Tell potential students what makes your studio special — your teaching approach, atmosphere, styles offered, instructor experience…"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-y"
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {(profile.custom_description?.length ?? 0)}/800 characters recommended
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. SOCIAL MEDIA LINKS
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>📲</span> Social Media
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Add your social profiles — icons will appear on your listing page so students can follow you.
        </p>

        <div className="space-y-3">
          {/* Facebook */}
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "#1877F218", color: "#1877F2" }}
            >
              f
            </span>
            <input
              type="url"
              value={profile.facebook_url ?? ""}
              onChange={e => update({ facebook_url: e.target.value })}
              placeholder="https://facebook.com/yourstudio"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: "#E1306C18", color: "#E1306C" }}
            >
              📸
            </span>
            <input
              type="url"
              value={profile.instagram_url ?? ""}
              onChange={e => update({ instagram_url: e.target.value })}
              placeholder="https://instagram.com/yourstudio"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          {/* TikTok */}
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: "#00000012", color: "#000" }}
            >
              🎵
            </span>
            <input
              type="url"
              value={profile.tiktok_url ?? ""}
              onChange={e => update({ tiktok_url: e.target.value })}
              placeholder="https://tiktok.com/@yourstudio"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. GOOGLE REVIEWS
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>⭐</span> Google Reviews
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Pull your Google reviews directly onto your listing. We fetch up to 5 recent reviews from your Google Business Profile.
        </p>

        {/* Toggle */}
        <label className="flex items-center justify-between cursor-pointer mb-4">
          <span className="text-sm font-medium text-gray-700">
            Show Google Reviews on my listing
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={profile.show_google_reviews ?? false}
            onClick={() => update({ show_google_reviews: !(profile.show_google_reviews ?? false) })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
              profile.show_google_reviews ? "bg-yellow-400" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                profile.show_google_reviews ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>

        {profile.show_google_reviews && (
          <div className="space-y-3">
            <button
              onClick={handleFetchReviews}
              disabled={reviewState === "fetching"}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)", color: "#1a1a1a" }}
            >
              {reviewState === "fetching" ? "Fetching from Google…" : "📥 Fetch My Google Reviews Now"}
            </button>
            {reviewMsg && (
              <p className="text-xs text-center text-gray-500">{reviewMsg}</p>
            )}
            <p className="text-xs text-gray-400 text-center">
              Reviews update when you click the button above. Refresh anytime to get your latest reviews.
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. PROMOTION BUILDER
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span>🎉</span> Current Promotion
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Running a special? Add a promotion banner to your listing page — shown prominently in the hero area.
        </p>

        {/* Promo text */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
            Promotion Headline
          </label>
          <input
            type="text"
            value={profile.promo_text ?? ""}
            onChange={e => update({ promo_text: e.target.value })}
            placeholder="e.g. First lesson FREE for new students!"
            maxLength={120}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>

        {/* Promo type + savings row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
              Offer Type
            </label>
            <select
              value={profile.promo_type ?? ""}
              onChange={e => update({ promo_type: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white"
            >
              <option value="">Select type…</option>
              <option value="percentage">% Discount</option>
              <option value="dollar">$ Off</option>
              <option value="free_trial">Free Trial</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
              Savings Amount
            </label>
            <input
              type="text"
              value={profile.promo_savings ?? ""}
              onChange={e => update({ promo_savings: e.target.value })}
              placeholder={
                profile.promo_type === "percentage" ? "e.g. 20%" :
                profile.promo_type === "dollar"     ? "e.g. $30 off" :
                profile.promo_type === "free_trial" ? "e.g. First Lesson Free" :
                "e.g. Buy 5 get 1 free"
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>
        </div>

        {/* Expiry date */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
            Offer End Date <span className="font-normal normal-case text-gray-400">(optional — leave blank for no expiry)</span>
          </label>
          <input
            type="date"
            value={profile.promo_end_date ?? ""}
            onChange={e => update({ promo_end_date: e.target.value || null })}
            min={new Date().toISOString().split("T")[0]}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>

        {/* Live preview */}
        {profile.promo_text && (
          <div className="mt-2 mb-1">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Preview</p>
            <div
              className="rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: "linear-gradient(135deg, #451a03, #78350f)", border: "1.5px solid #d97706" }}
            >
              <span className="text-xl flex-shrink-0">🎉</span>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Special Offer</span>
                  {profile.promo_savings && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#d97706", color: "#fff" }}>
                      {profile.promo_savings}
                    </span>
                  )}
                </div>
                <p className="text-amber-100 text-sm font-medium">{profile.promo_text}</p>
                {profile.promo_end_date && (
                  <p className="text-amber-400/70 text-xs mt-1">
                    Offer ends {new Date(profile.promo_end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Save button ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saveState === "saving"}
        className="w-full py-3.5 rounded-xl font-bold text-gray-900 text-sm transition-all hover:brightness-110 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
      >
        {saveLabel[saveState]}
      </button>
    </div>
  );
}
