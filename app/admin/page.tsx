"use client";

/**
 * /admin — BDD Studio Claims Command Center
 * ─────────────────────────────────────────
 * Password-gated admin dashboard with three tabs:
 *   1. Pending Review  — status "verified", awaiting approval
 *   2. Claimed (Free)  — status "approved", tier "claimed"
 *   3. Featured        — status "approved", tier "paid"
 *
 * Pending tab: one-click Google verification + Approve / Reject buttons.
 * Claimed tab: Push to GHL button.
 *
 * Auth: simple password stored in sessionStorage, validated server-side.
 */

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Claim {
  id:            string;
  studio_id:     number;
  studio_slug:   string;
  studio_title:  string;
  owner_name:    string;
  owner_email:   string;
  owner_phone:   string;
  status:        string;
  tier:          "claimed" | "paid";
  stripe_subscription_id: string | null;
  created_at:    string;
  updated_at:    string;
  studio_profiles: {
    custom_description:  string | null;
    facebook_url:        string | null;
    instagram_url:       string | null;
    promo_text:          string | null;
    show_google_reviews: boolean;
  } | null;
  // UI state
  ghlStatus?:    "idle" | "loading" | "success" | "error";
  ghlMessage?:   string;
  reviewStatus?: "idle" | "approving" | "rejecting" | "approved" | "rejected" | "error";
  reviewMessage?: string;
  featureStatus?:  "idle" | "loading" | "success" | "error";
  featureMessage?: string;
}

interface ClaimsData {
  pending:  Claim[];
  claimed:  Claim[];
  featured: Claim[];
  total:    number;
}

type ActiveTab = "pending" | "claimed" | "featured";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function googleSearchUrl(studioTitle: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(studioTitle + " dance studio")}`;
}

const SITE_URL = "https://www.ballroomdancedirectory.com";
const WP_ADMIN = "http://5.78.144.42/wp-admin/post.php";

// ── Sub-components ────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: "claimed" | "paid" }) {
  return tier === "paid" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      ⭐ Featured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
      🔵 Claimed
    </span>
  );
}

function ProfileCompleteness({ claim }: { claim: Claim }) {
  const p = claim.studio_profiles;
  const items = [
    { label: "Description", done: !!p?.custom_description },
    { label: "Instagram",   done: !!p?.instagram_url },
    { label: "Facebook",    done: !!p?.facebook_url },
    { label: "Promotion",   done: !!p?.promo_text },
  ];
  const done = items.filter(i => i.done).length;
  return (
    <div className="text-xs text-gray-500">
      <span className={done === items.length ? "text-green-600 font-medium" : "text-orange-500"}>
        {done}/{items.length} profile fields
      </span>
      <span className="ml-1 text-gray-400">
        ({items.filter(i => !i.done).map(i => i.label).join(", ") || "complete ✓"})
      </span>
    </div>
  );
}

// ── Pending Review Row ────────────────────────────────────────────────────────

function PendingRow({
  claim,
  adminToken,
  onReviewUpdate,
}: {
  claim: Claim;
  adminToken: string;
  onReviewUpdate: (id: string, status: Claim["reviewStatus"], msg: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject,   setShowReject]   = useState(false);
  const days = daysSince(claim.created_at);

  async function approve() {
    onReviewUpdate(claim.id, "approving", "");
    try {
      const res = await fetch("/api/admin/approve-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ claim_id: claim.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      onReviewUpdate(claim.id, "approved", "Approved — approval email sent");
    } catch (err: any) {
      onReviewUpdate(claim.id, "error", err.message);
    }
  }

  async function reject() {
    onReviewUpdate(claim.id, "rejecting", "");
    try {
      const res = await fetch("/api/admin/reject-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ claim_id: claim.id, reason: rejectReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      onReviewUpdate(claim.id, "rejected", "Rejected — rejection email sent");
    } catch (err: any) {
      onReviewUpdate(claim.id, "error", err.message);
    }
  }

  const isProcessing = claim.reviewStatus === "approving" || claim.reviewStatus === "rejecting";
  const isDone       = claim.reviewStatus === "approved" || claim.reviewStatus === "rejected";

  return (
    <tr className={`border-b border-gray-100 transition-colors ${isDone ? "opacity-40" : "hover:bg-amber-50/30"}`}>

      {/* Studio */}
      <td className="py-4 px-4">
        <div className="font-semibold text-gray-900 text-sm">{claim.studio_title}</div>
        <div className="text-xs text-gray-400 mt-0.5 font-mono">{claim.studio_slug}</div>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <a
            href={`${SITE_URL}/studios/${claim.studio_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            View listing ↗
          </a>
          <a
            href={`${WP_ADMIN}?post=${claim.studio_id}&action=edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-500 hover:underline"
          >
            WP editor ↗
          </a>
          <a
            href={googleSearchUrl(claim.studio_title)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-green-600 hover:underline flex items-center gap-0.5"
          >
            🔍 Google verify ↗
          </a>
        </div>
      </td>

      {/* Owner */}
      <td className="py-4 px-4">
        <div className="text-sm font-semibold text-gray-800">{claim.owner_name}</div>
        <div className="text-xs text-gray-500 mt-0.5">
          <a href={`mailto:${claim.owner_email}`} className="hover:underline">{claim.owner_email}</a>
        </div>
        {claim.owner_phone && (
          <div className="text-xs text-gray-500 mt-0.5">
            <a href={`tel:${claim.owner_phone}`} className="hover:underline">{claim.owner_phone}</a>
          </div>
        )}
      </td>

      {/* Submitted */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">{fmtDate(claim.created_at)}</div>
        <div className={`text-xs mt-0.5 ${days > 1 ? "text-orange-500 font-medium" : "text-gray-400"}`}>
          {days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`}
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        {isDone ? (
          <div className={`text-xs font-semibold ${claim.reviewStatus === "approved" ? "text-green-600" : "text-red-500"}`}>
            {claim.reviewMessage}
          </div>
        ) : claim.reviewStatus === "error" ? (
          <div className="space-y-1">
            <div className="text-xs text-red-500">{claim.reviewMessage}</div>
            <button onClick={() => onReviewUpdate(claim.id, "idle", "")} className="text-xs text-blue-500 hover:underline">Reset</button>
          </div>
        ) : showReject ? (
          <div className="space-y-2">
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason (optional — included in rejection email)"
              rows={2}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
            />
            <div className="flex gap-1.5">
              <button
                onClick={reject}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button
                onClick={() => setShowReject(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={approve}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
            >
              {isProcessing ? <span className="animate-spin text-sm">⟳</span> : "✓"} Approve
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors disabled:opacity-50"
            >
              ✕ Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ── Pending Table ─────────────────────────────────────────────────────────────

function PendingTable({
  claims,
  adminToken,
  onReviewUpdate,
}: {
  claims: Claim[];
  adminToken: string;
  onReviewUpdate: (id: string, status: Claim["reviewStatus"], msg: string) => void;
}) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-gray-500 text-sm font-medium">All clear — no pending claims to review.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th className="py-2 px-4">Studio</th>
            <th className="py-2 px-4">Claimant</th>
            <th className="py-2 px-4">Submitted</th>
            <th className="py-2 px-4 w-52">Review</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(claim => (
            <PendingRow
              key={claim.id}
              claim={claim}
              adminToken={adminToken}
              onReviewUpdate={onReviewUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Claimed / Featured Row ────────────────────────────────────────────────────

function ClaimRow({
  claim,
  adminToken,
  onGhlUpdate,
  onFeature,
}: {
  claim: Claim;
  adminToken: string;
  onGhlUpdate: (id: string, status: Claim["ghlStatus"],    msg: string) => void;
  onFeature:   (id: string, status: Claim["featureStatus"], msg: string) => void;
}) {
  const days = daysSince(claim.created_at);

  async function makeFeature() {
    onFeature(claim.id, "loading", "");
    try {
      const res = await fetch("/api/admin/make-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ claim_id: claim.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      onFeature(claim.id, "success", "Upgraded to Featured");
    } catch (err: any) {
      onFeature(claim.id, "error", err.message);
    }
  }

  async function pushToGHL() {
    onGhlUpdate(claim.id, "loading", "");
    try {
      const res = await fetch("/api/admin/push-ghl", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({
          claim_id:     claim.id,
          owner_name:   claim.owner_name,
          owner_email:  claim.owner_email,
          owner_phone:  claim.owner_phone,
          studio_title: claim.studio_title,
          studio_slug:  claim.studio_slug,
          tier:         claim.tier,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      onGhlUpdate(claim.id, "success", `✓ ${data.pipeline} → ${data.stage}`);
    } catch (err: any) {
      onGhlUpdate(claim.id, "error", err.message);
    }
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Studio */}
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900 text-sm">{claim.studio_title}</div>
        <div className="text-xs text-gray-500 mt-0.5 flex gap-2">
          <a
            href={`${SITE_URL}/studios/${claim.studio_slug}`}
            target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View listing ↗
          </a>
          <a
            href={`${WP_ADMIN}?post=${claim.studio_id}&action=edit`}
            target="_blank" rel="noopener noreferrer"
            className="text-purple-500 hover:underline"
          >
            WP editor ↗
          </a>
        </div>
      </td>

      {/* Tier */}
      <td className="py-3 px-4">
        <TierBadge tier={claim.tier} />
        {claim.tier === "paid" && claim.stripe_subscription_id && (
          <div className="text-xs text-gray-400 mt-1">
            <a
              href={`https://dashboard.stripe.com/subscriptions/${claim.stripe_subscription_id}`}
              target="_blank" rel="noopener noreferrer"
              className="hover:underline"
            >
              Stripe ↗
            </a>
          </div>
        )}
        {claim.tier === "claimed" && (
          <div className="mt-2">
            {claim.featureStatus === "success" ? (
              <span className="text-xs text-amber-600 font-semibold">⭐ Upgraded!</span>
            ) : claim.featureStatus === "error" ? (
              <div className="space-y-1">
                <div className="text-xs text-red-500 max-w-[130px] truncate">{claim.featureMessage}</div>
                <button onClick={makeFeature} className="text-xs text-blue-500 hover:underline">Retry</button>
              </div>
            ) : (
              <button
                onClick={makeFeature}
                disabled={claim.featureStatus === "loading"}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors disabled:opacity-50"
              >
                {claim.featureStatus === "loading"
                  ? <><span className="animate-spin text-sm">⟳</span> Upgrading…</>
                  : <>⭐ Make Featured</>
                }
              </button>
            )}
          </div>
        )}
      </td>

      {/* Owner */}
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-gray-800">{claim.owner_name}</div>
        <div className="text-xs text-gray-500">
          <a href={`mailto:${claim.owner_email}`} className="hover:underline">{claim.owner_email}</a>
        </div>
        {claim.owner_phone && (
          <div className="text-xs text-gray-500">
            <a href={`tel:${claim.owner_phone}`} className="hover:underline">{claim.owner_phone}</a>
          </div>
        )}
      </td>

      {/* Profile */}
      <td className="py-3 px-4">
        <ProfileCompleteness claim={claim} />
      </td>

      {/* Date */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">{fmtDate(claim.created_at)}</div>
        <div className={`text-xs ${days > 14 ? "text-red-500 font-medium" : "text-gray-400"}`}>
          {days}d ago
        </div>
      </td>

      {/* GHL */}
      <td className="py-3 px-4">
        {claim.ghlStatus === "success" ? (
          <div className="text-xs text-green-600 font-medium">{claim.ghlMessage}</div>
        ) : claim.ghlStatus === "error" ? (
          <div className="space-y-1">
            <div className="text-xs text-red-500">{claim.ghlMessage}</div>
            <button onClick={pushToGHL} className="text-xs text-blue-500 hover:underline">Retry</button>
          </div>
        ) : (
          <button
            onClick={pushToGHL}
            disabled={claim.ghlStatus === "loading"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0f2d6b] hover:bg-[#1a3d8a] text-white transition-colors disabled:opacity-50"
          >
            {claim.ghlStatus === "loading" ? (
              <><span className="animate-spin">⟳</span> Pushing…</>
            ) : (
              <>⚡ Push to GHL</>
            )}
          </button>
        )}
      </td>
    </tr>
  );
}

function ClaimsTable({
  claims,
  adminToken,
  onGhlUpdate,
  onFeature,
  emptyMsg,
}: {
  claims: Claim[];
  adminToken: string;
  onGhlUpdate: (id: string, status: Claim["ghlStatus"],    msg: string) => void;
  onFeature:   (id: string, status: Claim["featureStatus"], msg: string) => void;
  emptyMsg: string;
}) {
  if (claims.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">{emptyMsg}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th className="py-2 px-4">Studio</th>
            <th className="py-2 px-4">Tier</th>
            <th className="py-2 px-4">Owner</th>
            <th className="py-2 px-4">Profile</th>
            <th className="py-2 px-4">Claimed</th>
            <th className="py-2 px-4">GHL</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(claim => (
            <ClaimRow
              key={claim.id}
              claim={claim}
              adminToken={adminToken}
              onGhlUpdate={onGhlUpdate}
              onFeature={onFeature}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/claims", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setError("Incorrect password.");
      } else {
        sessionStorage.setItem("bdd_admin_token", password);
        onLogin(password);
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c1428] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎯</div>
          <h1 className="text-xl font-bold text-gray-900">BDD Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Admin access only</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c1428]"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#0c1428] hover:bg-[#1a2d5a] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

function Dashboard({ adminToken }: { adminToken: string }) {
  const [data,      setData]      = useState<ClaimsData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("pending");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/claims", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error("Failed to load claims");
      const json = await res.json();
      const addState = (c: Claim): Claim => ({
        ...c,
        ghlStatus:     "idle",
        reviewStatus:  "idle",
        featureStatus: "idle",
      });
      setData({
        pending:  (json.pending  ?? []).map(addState),
        claimed:  (json.claimed  ?? []).map(addState),
        featured: (json.featured ?? []).map(addState),
        total:    json.total,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function updateReview(id: string, status: Claim["reviewStatus"], msg: string) {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pending: prev.pending.map(c =>
          c.id === id ? { ...c, reviewStatus: status, reviewMessage: msg } : c
        ),
      };
    });
  }

  function updateGhl(id: string, status: Claim["ghlStatus"], msg: string) {
    setData(prev => {
      if (!prev) return prev;
      const update = (list: Claim[]) =>
        list.map(c => c.id === id ? { ...c, ghlStatus: status, ghlMessage: msg } : c);
      return { ...prev, claimed: update(prev.claimed), featured: update(prev.featured) };
    });
  }

  function updateFeature(id: string, status: Claim["featureStatus"], msg: string) {
    setData(prev => {
      if (!prev) return prev;
      if (status === "success") {
        // Move claim from claimed → featured list
        const claim = prev.claimed.find(c => c.id === id);
        if (!claim) return prev;
        const upgraded: Claim = { ...claim, tier: "paid", featureStatus: "success", featureMessage: msg };
        return {
          ...prev,
          claimed:  prev.claimed.filter(c => c.id !== id),
          featured: [...prev.featured, upgraded],
        };
      }
      return {
        ...prev,
        claimed: prev.claimed.map(c =>
          c.id === id ? { ...c, featureStatus: status, featureMessage: msg } : c
        ),
      };
    });
  }

  const pendingCount  = data?.pending.length  ?? 0;
  const claimedCount  = data?.claimed.length  ?? 0;
  const featuredCount = data?.featured.length ?? 0;

  const tabs = [
    { key: "pending"  as ActiveTab, label: "Pending Review", count: pendingCount,  color: pendingCount > 0 ? "text-orange-600" : "text-gray-400", dot: pendingCount > 0 },
    { key: "claimed"  as ActiveTab, label: "Claimed — Free", count: claimedCount,  color: "text-blue-600",  dot: false },
    { key: "featured" as ActiveTab, label: "Featured",       count: featuredCount, color: "text-amber-600", dot: false },
  ];

  const mrr = featuredCount * 49;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-[#0c1428] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">BDD Command Center</h1>
            <p className="text-xs text-blue-300">Ballroom Dance Directory — Studio Claims</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {data && (
            <span className="text-sm text-gray-400">{data.total} total</span>
          )}
          <button
            onClick={fetchData}
            className="text-xs text-blue-300 hover:text-white transition-colors flex items-center gap-1"
          >
            ↺ Refresh
          </button>
          <button
            onClick={() => { sessionStorage.removeItem("bdd_admin_token"); window.location.reload(); }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-8 flex-wrap">
          <div className="text-center">
            <div className={`text-2xl font-bold ${pendingCount > 0 ? "text-orange-500" : "text-gray-400"}`}>
              {pendingCount}
            </div>
            <div className="text-xs text-gray-500">Pending Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{claimedCount}</div>
            <div className="text-xs text-gray-500">Claimed (Free)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{featuredCount}</div>
            <div className="text-xs text-gray-500">Featured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${mrr.toLocaleString()}<span className="text-sm font-normal">/mo</span>
            </div>
            <div className="text-xs text-gray-500">MRR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">
              {claimedCount + featuredCount > 0
                ? `${Math.round(featuredCount / (featuredCount + claimedCount) * 100)}%`
                : "—"}
            </div>
            <div className="text-xs text-gray-500">Conversion</div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#0c1428] text-[#0c1428]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.dot && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
              )}
              {tab.label}
              <span className={`ml-2 text-xs font-bold ${activeTab === tab.key ? tab.color : "text-gray-400"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Loading claims…</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">{error}</div>
        )}
        {!loading && !error && data && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">

            {/* Tab header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                {activeTab === "pending"
                  ? "Claims awaiting review — verify ownership before approving"
                  : activeTab === "claimed"
                  ? "Approved studios on the free tier — push to GHL to start upgrade sequence"
                  : "Studios on the Featured plan ($49/mo)"}
              </h2>
              {activeTab === "pending" && pendingCount > 0 && (
                <span className="text-xs text-gray-400 italic">
                  Click 🔍 Google verify to check the studio before acting
                </span>
              )}
            </div>

            {/* Tab content */}
            {activeTab === "pending" && (
              <PendingTable
                claims={data.pending}
                adminToken={adminToken}
                onReviewUpdate={updateReview}
              />
            )}
            {activeTab !== "pending" && (
              <ClaimsTable
                claims={activeTab === "claimed" ? data.claimed : data.featured}
                adminToken={adminToken}
                onGhlUpdate={updateGhl}
                onFeature={updateFeature}
                emptyMsg={
                  activeTab === "claimed"
                    ? "No approved studios yet. Approve pending claims first."
                    : "No featured studios yet."
                }
              />
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [checked,    setChecked]    = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("bdd_admin_token");
    if (stored) setAdminToken(stored);
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!adminToken) {
    return <LoginScreen onLogin={token => setAdminToken(token)} />;
  }

  return <Dashboard adminToken={adminToken} />;
}

