"use client";

// ─── /dashboard — Studio Owner Portal ────────────────────────────────────────
// App-style owner dashboard: sidebar navigation, an overview with listing status,
// plan, profile strength and next steps, plus listing details, Featured tools
// (photos, description & promos), plan & billing, and account security.
//
// Everything shown is real: the owner's claim, the public WordPress listing and
// Supabase (photos, Featured profile), all returned by /api/owner/claims.
// No placeholder metrics.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Store, Images, Sparkles, CreditCard, ShieldCheck, LifeBuoy,
  LogOut, ExternalLink, CircleCheck, Circle, ChevronsUpDown, Phone, Globe,
  MapPin, Clock, Mail, Lock, ArrowRight, Menu, X, BadgeCheck, Crown, Info,
  Copy, Check, Hourglass, KeyRound, User, ChevronRight, Music2, Eye, ListChecks,
  type LucideIcon,
} from "lucide-react";
import { supabase, type Claim } from "@/lib/supabase";
import PhotoManager from "@/components/PhotoManager";
import StudioProfileEditor from "@/components/StudioProfileEditor";

// ── Types ─────────────────────────────────────────────────────────────────────

type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type Hours = Partial<Record<Day, string>>;

interface ListingData {
  title:       string;
  address:     string;
  city:        string;
  state:       string;
  zip:         string;
  phone:       string;
  email:       string;
  website:     string;
  hours:       Hours;
  danceStyles: string[];
  tagline:     string;
}

interface FeaturedProfile {
  custom_description?:  string | null;
  facebook_url?:        string | null;
  instagram_url?:       string | null;
  tiktok_url?:          string | null;
  promo_text?:          string | null;
  show_google_reviews?: boolean | null;
}

type OwnerClaim = Claim & {
  listing?:     ListingData | null;
  photo_count?: number;
  profile?:     FeaturedProfile | null;
};

type PageState = "loading" | "unauthenticated" | "no_claim" | "ready";
type SectionId = "overview" | "listing" | "photos" | "profile" | "plan" | "account";

interface CheckItem {
  id:      string;
  title:   string;
  detail:  string;
  done:    boolean;
  locked?: boolean;
  action?: { label: string; section?: SectionId; href?: string };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon; featured?: boolean }[] = [
  { id: "overview", label: "Overview",             icon: LayoutDashboard },
  { id: "listing",  label: "Listing details",      icon: Store },
  { id: "photos",   label: "Photos",               icon: Images,   featured: true },
  { id: "profile",  label: "Description & promos", icon: Sparkles, featured: true },
  { id: "plan",     label: "Plan & billing",       icon: CreditCard },
  { id: "account",  label: "Account & security",   icon: ShieldCheck },
];

const SITE         = "https://www.ballroomdancedirectory.com";
const SUPPORT_MAIL = "info@ballroomdancedirectory.com";
const DAYS: Day[]  = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const FONT         = { fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" };

const BTN_PRIMARY   = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0c1428] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a2d5a] disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SECONDARY = "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900";
const BTN_GOLD      = "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#d4a840] to-[#e8c560] px-4 py-2 text-sm font-semibold text-[#0c1428] shadow-sm transition hover:brightness-105";

const FEATURES: { label: string; claimed: boolean }[] = [
  { label: "Verified Owner badge",                      claimed: true  },
  { label: "Owner dashboard",                           claimed: true  },
  { label: "Listing corrections on request",            claimed: true  },
  { label: "Featured badge",                            claimed: false },
  { label: "Lead form: dancer messages emailed to you", claimed: false },
  { label: "Priority placement in search results",      claimed: false },
  { label: "Up to 6 gallery photos",                    claimed: false },
  { label: "Your own studio description",               claimed: false },
  { label: "Social profile links",                      claimed: false },
  { label: "Google reviews on your listing",            claimed: false },
  { label: "Promotions and special offers",             claimed: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function firstName(name?: string | null) {
  return (name || "").replace(/\(.*?\)/g, "").trim().split(/\s+/)[0] || "";
}
function initials(text?: string | null) {
  const words = (text || "").replace(/\(.*?\)/g, "").split(/[\s@._-]+/).filter((w) => /^[A-Za-z]/.test(w));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "BD";
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function prettyUrl(u: string) {
  return u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}
function hrefUrl(u: string) {
  return /^https?:\/\//.test(u) ? u : `https://${u}`;
}
function changeRequestHref(studio: string) {
  return `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(`Listing update: ${studio}`)}`;
}

function buildChecklist(c: OwnerClaim, hasPassword: boolean): CheckItem[] {
  const l        = c.listing;
  const paid     = c.tier === "paid";
  const p        = c.profile || {};
  const photos   = c.photo_count ?? 0;
  const hasHours = !!l && DAYS.some((d) => (l.hours?.[d] || "").trim());
  const update   = { label: "Send update", href: changeRequestHref(c.studio_title) };

  return [
    {
      id: "verified", title: "Verify ownership",
      detail: c.status === "approved" ? "Your Verified Owner badge is showing." : "We're reviewing your claim.",
      done: c.status === "approved",
    },
    {
      id: "password", title: "Create a password",
      detail: hasPassword ? "You can sign in with your email and password." : "Sign in any time without waiting for an email link.",
      done: hasPassword, action: { label: "Set password", section: "account" },
    },
    {
      id: "phone", title: "Phone number",
      detail: l?.phone ? l.phone : "Dancers can't call you from your listing yet.",
      done: !!l?.phone, action: update,
    },
    {
      id: "website", title: "Website link",
      detail: l?.website ? prettyUrl(l.website) : "Add your website so dancers can book with you directly.",
      done: !!l?.website, action: update,
    },
    {
      id: "hours", title: "Business hours",
      detail: hasHours ? "Your hours are showing on your listing." : "Listings with hours look more trustworthy.",
      done: hasHours, action: update,
    },
    {
      id: "styles", title: "Dance styles",
      detail: l?.danceStyles?.length ? l.danceStyles.slice(0, 4).map(titleCase).join(", ") + (l.danceStyles.length > 4 ? "…" : "") : "Tell dancers which styles you teach.",
      done: !!l?.danceStyles?.length, action: update,
    },
    {
      id: "description", title: "Write your own description",
      detail: "Tell dancers what makes your studio different.",
      done: paid && !!p.custom_description?.trim(), locked: !paid,
      action: { label: "Write it", section: "profile" },
    },
    {
      id: "photos", title: "Upload at least 3 photos",
      detail: paid ? `${photos} of 6 photos uploaded.` : "Replace stock images with photos of your studio.",
      done: paid && photos >= 3, locked: !paid,
      action: { label: "Add photos", section: "photos" },
    },
    {
      id: "social", title: "Link your social profiles",
      detail: "Facebook, Instagram or TikTok.",
      done: paid && !!(p.facebook_url || p.instagram_url || p.tiktok_url), locked: !paid,
      action: { label: "Add links", section: "profile" },
    },
  ];
}

// ── Small UI pieces ───────────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]", className)}>
      {children}
    </section>
  );
}

function CardHeader({ title, description, right }: { title: string; description?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-[#d4a840]" : "bg-amber-500";
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-gray-100", className)}>
      <div className={cx("h-full rounded-full transition-all duration-500", color)} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

const TONES = {
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  gold:  "bg-[#fdf4e3] text-[#9a7620]",
  navy:  "bg-[#f0f3f9] text-[#1e3a8a]",
  gray:  "bg-gray-100 text-gray-500",
} as const;

function Kpi({ icon: Icon, label, value, sub, tone = "navy", progress }: {
  icon: LucideIcon; label: string; value: string; sub: string; tone?: keyof typeof TONES; progress?: number;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={cx("flex h-8 w-8 items-center justify-center rounded-lg", TONES[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{value}</p>
      {typeof progress === "number" && <ProgressBar value={progress} className="mt-3" />}
      <p className="mt-2 text-xs leading-5 text-gray-500">{sub}</p>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · Verified owner
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {status === "verified" ? "In review" : "Pending review"}
    </span>
  );
}

function PlanPill({ paid }: { paid: boolean }) {
  return paid ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf4e3] px-2.5 py-1 text-xs font-medium text-[#7a5c18] ring-1 ring-inset ring-[#b8922a]/30">
      <Crown className="h-3.5 w-3.5" /> Featured plan
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
      Claimed · Free plan
    </span>
  );
}

function FeaturedTag() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-[#fdf4e3] px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-[#7a5c18]">
      <Crown className="h-3 w-3" /> Featured
    </span>
  );
}

function DetailRow({ label, children, missing }: { label: string; children?: React.ReactNode; missing?: boolean }) {
  return (
    <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 sm:col-span-2">
        {missing ? (
          <span className="inline-flex items-center gap-1.5 text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Not listed
          </span>
        ) : children}
      </dd>
    </div>
  );
}

function StyleChips({ styles }: { styles: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {styles.map((s) => (
        <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{titleCase(s)}</span>
      ))}
    </div>
  );
}

function LockedFeature({ title, body, bullets, onUpgrade }: { title: string; body: string; bullets: string[]; onUpgrade: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 md:grid-cols-5">
        <div className="p-6 md:col-span-3 md:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf4e3] px-2.5 py-1 text-xs font-semibold text-[#7a5c18]">
            <Lock className="h-3.5 w-3.5" /> Featured plan
          </span>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-gray-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">{body}</p>
          <ul className="mt-5 space-y-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {b}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/upgrade" className={BTN_GOLD}>Upgrade to Featured <ArrowRight className="h-4 w-4" /></Link>
            <button onClick={onUpgrade} className="text-sm font-medium text-gray-500 hover:text-gray-900">Compare plans</button>
          </div>
        </div>
        <div className="hidden items-center justify-center bg-gradient-to-br from-[#0c1428] via-[#1a2d5a] to-[#2d1f0e] p-8 md:col-span-2 md:flex">
          <div className="text-center">
            <Crown className="mx-auto h-10 w-10 text-[#e8c560]" />
            <p className="mt-3 text-sm font-semibold text-white">$49/mo promo rate</p>
            <p className="text-xs text-white/50">Regularly $99 · Cancel anytime</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Gate({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7f9] px-6 py-12" style={FONT}>
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Ballroom Dance Directory" width={480} height={190} className="h-16 w-auto mix-blend-multiply" priority />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f3f9] text-[#1e3a8a]">{icon}</span>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">{title}</h1>
        {children}
      </div>
    </main>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [pageState,    setPageState]    = useState<PageState>("loading");
  const [claims,       setClaims]       = useState<OwnerClaim[]>([]);
  const [selected,     setSelected]     = useState(0);
  const [email,        setEmail]        = useState("");
  const [hasPassword,  setHasPassword]  = useState(false);
  const [section,      setSection]      = useState<SectionId>("overview");
  const [mobileNav,    setMobileNav]    = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [copied,       setCopied]       = useState(false);

  // Password card state
  const [pw,     setPw]     = useState("");
  const [pw2,    setPw2]    = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg,  setPwMsg]  = useState<{ ok: boolean; text: string } | null>(null);

  const claim: OwnerClaim | null = claims[selected] ?? null;

  // ── Data ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      setEmail(session.user.email || "");
      setHasPassword(!!session.user.user_metadata?.has_password);

      try {
        const res = await fetch("/api/owner/claims", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 401) { setPageState("unauthenticated"); return; }
        const body = await res.json();
        const list = (body.claims || []) as OwnerClaim[];
        if (!list.length) { setPageState("no_claim"); return; }
        setClaims(list);
        setPageState("ready");
      } catch {
        setPageState("no_claim");
      }
    }
    load();
  }, []);

  // ── Section routing via the URL hash (#photos, #account, …) ─────────────────
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as SectionId;
      if (SECTIONS.some((s) => s.id === h)) setSection(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const go = useCallback((id: SectionId) => {
    setSection(id);
    setMobileNav(false);
    setSwitcherOpen(false);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.length < 8) { setPwMsg({ ok: false, text: "Use at least 8 characters." }); return; }
    if (pw !== pw2)    { setPwMsg({ ok: false, text: "The two passwords don't match." }); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw, data: { has_password: true } });
    setPwBusy(false);
    if (error) { setPwMsg({ ok: false, text: error.message || "Could not save your password." }); return; }
    setHasPassword(true);
    setPw(""); setPw2("");
    setPwMsg({ ok: true, text: "Password saved. You can now sign in with your email and password." });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function copyLink(slug: string) {
    try {
      await navigator.clipboard.writeText(`${SITE}/studios/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — ignore */ }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-[#f6f7f9]" style={FONT}>
        <aside className="fixed inset-y-0 hidden w-64 border-r border-gray-200 bg-white lg:block">
          <div className="space-y-3 p-5 animate-pulse">
            <div className="h-10 w-36 rounded bg-gray-100" />
            <div className="mt-6 h-14 rounded-lg bg-gray-100" />
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 rounded-md bg-gray-50" />)}
          </div>
        </aside>
        <div className="lg:pl-64">
          <div className="h-16 border-b border-gray-200 bg-white" />
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 animate-pulse sm:px-6 lg:px-8">
            <div className="h-8 w-72 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-36 rounded-xl border border-gray-200 bg-white" />)}
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="h-96 rounded-xl border border-gray-200 bg-white xl:col-span-2" />
              <div className="h-96 rounded-xl border border-gray-200 bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not signed in ───────────────────────────────────────────────────────────
  if (pageState === "unauthenticated") {
    return (
      <Gate icon={<Lock className="h-5 w-5" />} title="Sign in to your Owner Portal">
        <p className="mt-2 text-sm text-gray-500">Studio owners sign in here to manage their listing.</p>
        <Link href="/login" className={cx(BTN_PRIMARY, "mt-6 w-full py-2.5")}>Owner Login</Link>
        <p className="mt-4 text-xs text-gray-400">
          Don&apos;t manage a listing yet?{" "}
          <Link href="/claim" className="font-medium text-[#9a7620] hover:underline">Claim your studio</Link>
        </p>
      </Gate>
    );
  }

  // ── Signed in, no listing ───────────────────────────────────────────────────
  if (pageState === "no_claim" || !claim) {
    return (
      <Gate icon={<Store className="h-5 w-5" />} title="No listing found for this account">
        <p className="mt-2 text-sm text-gray-500">Signed in as <span className="font-medium text-gray-900">{email}</span></p>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          You may have claimed your studio with a different email, or it isn&apos;t claimed yet. If our team set up
          your listing, sign in with the email you gave us, or{" "}
          <Link href="/contact" className="font-medium text-[#9a7620] hover:underline">contact us</Link>.
        </p>
        <Link href="/claim" className={cx(BTN_PRIMARY, "mt-6 w-full py-2.5")}>Claim a listing</Link>
        <button onClick={handleSignOut} className="mt-3 text-sm text-gray-400 hover:text-gray-700">Sign out</button>
      </Gate>
    );
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const paid       = claim.tier === "paid";
  const approved   = claim.status === "approved";
  const canUpgrade = !paid && (claim.status === "approved" || claim.status === "verified");
  const listing    = claim.listing ?? null;
  const city       = listing?.city  || claim.studio_city  || "";
  const state      = listing?.state || claim.studio_state || "";
  const location   = [city, state].filter(Boolean).join(", ");
  const ownerName  = (claim.owner_name || "").replace(/\s*\(.*?\)\s*/g, " ").trim() || email;
  const fn         = firstName(claim.owner_name);
  const listingUrl = `/studios/${claim.studio_slug}`;
  const photos     = claim.photo_count ?? 0;
  const items      = buildChecklist(claim, hasPassword);
  const applicable = items.filter((i) => !i.locked);
  const doneCount  = applicable.filter((i) => i.done).length;
  const score      = applicable.length ? Math.round((doneCount / applicable.length) * 100) : 0;
  const nextItem   = applicable.find((i) => !i.done && i.action);
  const current    = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];
  const cityLine   = listing ? [[listing.city, listing.state].filter(Boolean).join(", "), listing.zip].filter(Boolean).join(" ") : "";
  const streetLine = listing ? [listing.address, cityLine].filter(Boolean).join(", ") : "";
  const hasAnyHours = !!listing && DAYS.some((d) => (listing.hours?.[d] || "").trim());

  // ── Sidebar (shared by desktop and the mobile drawer) ───────────────────────
  const nav = (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 px-5 pb-4 pt-5">
        <Link href="/" className="block w-fit">
          <Image src="/logo.png" alt="Ballroom Dance Directory" width={480} height={190} className="h-14 w-auto" priority />
        </Link>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Owner Portal</p>
      </div>

      {/* Listing switcher */}
      <div className="relative px-3 pt-4">
        <button
          onClick={() => claims.length > 1 && setSwitcherOpen((o) => !o)}
          className={cx(
            "flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition",
            claims.length > 1 ? "hover:border-gray-300 hover:bg-gray-50" : "cursor-default",
          )}
          aria-expanded={switcherOpen}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0c1428] text-xs font-bold text-[#e8c560]">
            {initials(claim.studio_title)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-gray-900">{claim.studio_title}</span>
            <span className="block truncate text-xs text-gray-500">{location || "Your listing"}</span>
          </span>
          {claims.length > 1 && <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />}
        </button>
        {switcherOpen && claims.length > 1 && (
          <div className="absolute left-3 right-3 z-20 mt-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Your listings ({claims.length})
            </p>
            {claims.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setSelected(i); setSwitcherOpen(false); }}
                className={cx(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm",
                  i === selected ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <span className="truncate">{c.studio_title}</span>
                {i === selected && <Check className="h-4 w-4 shrink-0 text-[#b8922a]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Manage</p>
        {SECTIONS.map((s) => {
          const Icon   = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className={cx(
                "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active ? "bg-[#0c1428] text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cx("h-[18px] w-[18px]", active ? "text-[#e8c560]" : "text-gray-400 group-hover:text-gray-600")} />
              <span className="flex-1 text-left">{s.label}</span>
              {s.featured && !paid && <Lock className={cx("h-3.5 w-3.5", active ? "text-white/50" : "text-gray-300")} />}
            </button>
          );
        })}
        <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Support</p>
        <Link href="/contact" className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
          <LifeBuoy className="h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600" /> Help &amp; contact
        </Link>
        <a href={listingUrl} target="_blank" rel="noopener noreferrer" className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
          <Eye className="h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600" />
          <span className="flex-1">View live listing</span>
          <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
        </a>
      </nav>

      {canUpgrade && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-[#0c1428] to-[#1a2d5a] p-4 text-white">
          <Crown className="h-5 w-5 text-[#e8c560]" />
          <p className="mt-2 text-sm font-semibold">Upgrade to Featured</p>
          <p className="mt-1 text-xs leading-5 text-white/60">Lead form, your own photos and priority placement.</p>
          <button onClick={() => go("plan")} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#e8c560] hover:text-white">
            See what&apos;s included <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Signed-in user */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
            {initials(ownerName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{ownerName}</p>
            <p className="truncate text-xs text-gray-500">{email}</p>
          </div>
          <button onClick={handleSignOut} title="Sign out" aria-label="Sign out" className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Sections ────────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            {greeting()}{fn ? `, ${fn}` : ""}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s where <span className="font-medium text-gray-700">{claim.studio_title}</span> stands on Ballroom Dance Directory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill status={claim.status} />
          <PlanPill paid={paid} />
        </div>
      </div>

      {/* Claim review progress */}
      {!approved && (
        <Card className="border-amber-200 bg-amber-50/40 p-5">
          <div className="flex items-start gap-3">
            <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Your claim is being reviewed</p>
              <p className="mt-0.5 text-sm text-gray-600">
                {claim.status === "verified"
                  ? "Your email is verified. We'll send an approval email within 1 business day."
                  : "We'll review your claim within 1–2 business days and email you when it's approved."}
              </p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Claim submitted", done: true },
                  { label: "Email verified",  done: claim.status === "verified" },
                  { label: "Approved",        done: false },
                ].map((s, i) => (
                  <li key={s.label} className="flex items-center gap-2 text-sm">
                    {s.done
                      ? <CircleCheck className="h-5 w-5 text-emerald-500" />
                      : <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-500">{i + 1}</span>}
                    <span className={s.done ? "text-gray-900" : "text-gray-500"}>{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi
          icon={BadgeCheck} tone={approved ? "green" : "amber"} label="Listing status"
          value={approved ? "Live" : "In review"}
          sub={approved ? "Verified Owner badge is showing" : "We'll email you when it's approved"}
        />
        <Kpi
          icon={Crown} tone={paid ? "gold" : "gray"} label="Plan"
          value={paid ? "Featured" : "Claimed"}
          sub={paid ? "Lead form and priority placement are on" : "Free plan · Upgrade any time"}
        />
        <Kpi
          icon={ListChecks} tone="navy" label="Profile strength"
          value={`${score}%`} progress={score}
          sub={`${doneCount} of ${applicable.length} steps done`}
        />
        <Kpi
          icon={Images} tone={paid ? "navy" : "gray"} label="Photos"
          value={paid ? `${photos} of 6` : "Locked"}
          sub={paid ? (photos >= 3 ? "Your gallery looks good" : "Add at least 3 photos") : "Featured owners add their own photos"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Checklist */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Profile checklist"
            description="Complete listings earn more trust from dancers comparing studios."
            right={nextItem?.action ? (
              nextItem.action.section
                ? <button onClick={() => go(nextItem.action!.section!)} className={BTN_PRIMARY}>Next: {nextItem.title} <ArrowRight className="h-4 w-4" /></button>
                : <a href={nextItem.action.href} className={BTN_PRIMARY}>Next: {nextItem.title} <ArrowRight className="h-4 w-4" /></a>
            ) : undefined}
          />
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between pb-2 text-xs text-gray-500">
              <span>{doneCount} of {applicable.length} complete</span>
              <span className="font-semibold text-gray-900">{score}%</span>
            </div>
            <ProgressBar value={score} />
          </div>
          <ul className="divide-y divide-gray-100 border-t border-gray-100">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 px-5 py-3.5">
                {it.done
                  ? <CircleCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                  : it.locked
                    ? <Lock className="h-5 w-5 shrink-0 text-gray-300" />
                    : <Circle className="h-5 w-5 shrink-0 text-gray-300" />}
                <div className="min-w-0 flex-1">
                  <p className={cx("text-sm font-medium", it.done ? "text-gray-500" : it.locked ? "text-gray-400" : "text-gray-900")}>
                    {it.title}{it.locked && <FeaturedTag />}
                  </p>
                  <p className="truncate text-xs text-gray-500">{it.detail}</p>
                </div>
                {!it.done && it.action && (
                  it.locked ? (
                    <button onClick={() => go("plan")} className="shrink-0 text-xs font-semibold text-[#9a7620] hover:text-[#7a5c18]">Unlock</button>
                  ) : it.action.section ? (
                    <button onClick={() => go(it.action!.section!)} className="shrink-0 text-xs font-semibold text-[#1e3a8a] hover:text-[#0c1428]">{it.action.label}</button>
                  ) : (
                    <a href={it.action.href} className="shrink-0 text-xs font-semibold text-[#1e3a8a] hover:text-[#0c1428]">{it.action.label}</a>
                  )
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-2 border-t border-gray-100 px-5 py-3 text-xs leading-5 text-gray-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Phone, website, hours and styles come from your public listing. Send us a change and we&apos;ll update it within 1–2 business days.
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Listing preview */}
          <Card className="overflow-hidden">
            <div className="h-20 bg-gradient-to-br from-[#0c1428] via-[#1a2d5a] to-[#2d1f0e]" />
            <div className="px-5 pb-5">
              <div className="-mt-7 flex h-14 w-14 items-center justify-center rounded-xl border-4 border-white bg-[#0c1428] text-base font-bold text-[#e8c560] shadow-sm">
                {initials(claim.studio_title)}
              </div>
              <h3 className="mt-3 text-base font-semibold leading-snug text-gray-900">{claim.studio_title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {approved && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified Owner
                  </span>
                )}
                {paid && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9a7620]">
                    <Crown className="h-3.5 w-3.5" /> Featured
                  </span>
                )}
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span className={listing?.address ? "text-gray-700" : "text-gray-400"}>{streetLine || location || "Address not listed"}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span className={listing?.phone ? "text-gray-700" : "text-gray-400"}>{listing?.phone || "Phone not listed"}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {listing?.website
                    ? <a href={hrefUrl(listing.website)} target="_blank" rel="noopener noreferrer" className="truncate text-[#1e3a8a] hover:underline">{prettyUrl(listing.website)}</a>
                    : <span className="text-gray-400">Website not listed</span>}
                </div>
              </dl>
              {!!listing?.danceStyles?.length && <div className="mt-4"><StyleChips styles={listing.danceStyles.slice(0, 6)} /></div>}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a href={listingUrl} target="_blank" rel="noopener noreferrer" className={BTN_SECONDARY}>
                  <ExternalLink className="h-4 w-4" /> View
                </a>
                <button onClick={() => copyLink(claim.studio_slug)} className={BTN_SECONDARY}>
                  {copied ? <><Check className="h-4 w-4 text-emerald-600" /> Copied</> : <><Copy className="h-4 w-4" /> Copy link</>}
                </button>
              </div>
            </div>
          </Card>

          {/* Plan */}
          {paid ? (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#b8922a]" />
                <p className="text-sm font-semibold text-gray-900">Featured plan · Active</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your listing has the Featured badge, a lead form and priority placement. Dancer messages go straight to {claim.owner_email}.
              </p>
              <button onClick={() => go("plan")} className={cx(BTN_SECONDARY, "mt-4 w-full")}>Manage plan</button>
            </Card>
          ) : canUpgrade ? (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-[#0c1428] to-[#1a2d5a] p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#e8c560]">Featured listing</p>
                <p className="mt-2 text-2xl font-semibold">$49<span className="text-sm font-normal text-white/60">/mo</span>
                  <span className="ml-2 text-sm font-normal text-white/40 line-through">$99</span>
                </p>
                <p className="mt-1 text-xs text-white/60">Promo rate · Cancel anytime</p>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {["Lead form on your listing", "Priority placement in search", "Your own photos and description"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/upgrade" className={cx(BTN_GOLD, "mt-5 w-full")}>Upgrade to Featured</Link>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderListing = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Public listing information"
          description="This is what dancers see on your listing page."
          right={<a href={changeRequestHref(claim.studio_title)} className={BTN_SECONDARY}><Mail className="h-4 w-4" /> Request a change</a>}
        />
        {listing ? (
          <dl className="divide-y divide-gray-100 border-t border-gray-100">
            <DetailRow label="Studio name">{listing.title || claim.studio_title}</DetailRow>
            <DetailRow label="Address" missing={!listing.address}>
              {streetLine}
            </DetailRow>
            <DetailRow label="Phone" missing={!listing.phone}>{listing.phone}</DetailRow>
            <DetailRow label="Email" missing={!listing.email}>{listing.email}</DetailRow>
            <DetailRow label="Website" missing={!listing.website}>
              <a href={hrefUrl(listing.website)} target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline">{prettyUrl(listing.website)}</a>
            </DetailRow>
            <DetailRow label="Tagline" missing={!listing.tagline}>{listing.tagline}</DetailRow>
            <DetailRow label="Dance styles" missing={!listing.danceStyles.length}>
              <StyleChips styles={listing.danceStyles} />
            </DetailRow>
          </dl>
        ) : (
          <div className="border-t border-gray-100 px-5 py-12 text-center">
            <Store className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">Listing details aren&apos;t available right now</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">Try again in a few minutes. If it keeps happening, contact us and we&apos;ll take a look.</p>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Business hours" description="Shown on your listing so dancers know when to reach you." />
        {hasAnyHours && listing ? (
          <dl className="divide-y divide-gray-100 border-t border-gray-100">
            {DAYS.map((d) => (
              <div key={d} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <dt className="flex items-center gap-2 font-medium text-gray-700"><Clock className="h-3.5 w-3.5 text-gray-400" /> {titleCase(d)}</dt>
                <dd className={listing.hours?.[d] ? "text-gray-900" : "text-gray-400"}>{listing.hours?.[d] || "Closed / not listed"}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="flex flex-col items-start gap-3 border-t border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">No hours are listed yet.</p>
            <a href={changeRequestHref(claim.studio_title)} className={BTN_SECONDARY}>Send your hours</a>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <PenLineIcon paid={paid} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{paid ? "Edit your description, social links and promotions" : "Want to write your own description?"}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              {paid
                ? "Featured owners can update these any time. Changes appear on your listing within a few minutes."
                : "Featured owners write their own description, add photos and link their social profiles."}
            </p>
          </div>
          <button onClick={() => go(paid ? "profile" : "plan")} className={cx(paid ? BTN_PRIMARY : BTN_SECONDARY, "shrink-0")}>
            {paid ? "Open editor" : "See Featured"}
          </button>
        </div>
      </Card>
    </div>
  );

  const renderPhotos = () => paid ? (
    <div className="space-y-6">
      <PhotoManager key={claim.id} claimId={claim.id} studioSlug={claim.studio_slug} />
    </div>
  ) : (
    <LockedFeature
      title="Show dancers your real studio"
      body="Featured owners replace the stock images on their listing with up to 6 photos of their own studio, floor and team."
      bullets={["Up to 6 gallery photos", "Changes show within minutes", "JPG, PNG or WebP up to 5 MB"]}
      onUpgrade={() => go("plan")}
    />
  );

  const renderProfile = () => paid ? (
    <div className="space-y-6">
      <StudioProfileEditor
        key={claim.id}
        claimId={claim.id}
        studioSlug={claim.studio_slug}
        studioTitle={claim.studio_title}
        studioCity={city}
        studioState={state}
      />
    </div>
  ) : (
    <LockedFeature
      title="Tell your studio's story in your own words"
      body="Featured owners write their own description, link their social profiles, show Google reviews and run promotions on their listing."
      bullets={["Your own studio description", "Facebook, Instagram and TikTok links", "Google reviews and special offers"]}
      onUpgrade={() => go("plan")}
    />
  );

  const renderPlan = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", paid ? TONES.gold : TONES.gray)}>
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current plan</p>
              <p className="mt-0.5 text-lg font-semibold text-gray-900">{paid ? "Featured" : "Claimed (free)"}</p>
              <p className="mt-0.5 text-sm text-gray-500">
                {paid
                  ? "Active · Billed monthly through Stripe."
                  : canUpgrade ? "Upgrade any time for $49/mo (promo rate, regularly $99)." : "Upgrades open once your claim is approved."}
              </p>
            </div>
          </div>
          {paid ? (
            <a href={`mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(`Billing: ${claim.studio_title}`)}`} className={BTN_SECONDARY}>
              <Mail className="h-4 w-4" /> Contact billing
            </a>
          ) : canUpgrade ? (
            <Link href="/upgrade" className={BTN_GOLD}>Upgrade to Featured <ArrowRight className="h-4 w-4" /></Link>
          ) : null}
        </div>
        {paid && (
          <p className="mt-5 flex items-start gap-2 rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            To update your card or cancel, email us and we&apos;ll take care of it within one business day. Your listing keeps its claimed status if you cancel.
          </p>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Compare plans" description="Everything included with each plan." />
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Feature</th>
                <th className={cx("px-5 py-3 text-center", !paid && "bg-[#f0f3f9] text-gray-900")}>Claimed{!paid && <span className="ml-1 rounded bg-[#0c1428] px-1.5 py-0.5 text-[9px] font-semibold text-white">CURRENT</span>}<span className="block text-[11px] font-normal normal-case tracking-normal text-gray-400">Free</span></th>
                <th className={cx("px-5 py-3 text-center", paid && "bg-[#fdf4e3] text-gray-900")}>Featured{paid && <span className="ml-1 rounded bg-[#b8922a] px-1.5 py-0.5 text-[9px] font-semibold text-white">CURRENT</span>}<span className="block text-[11px] font-normal normal-case tracking-normal text-gray-400">$49/mo promo</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FEATURES.map((f) => (
                <tr key={f.label}>
                  <td className="px-5 py-3 text-gray-700">{f.label}</td>
                  <td className={cx("px-5 py-3 text-center", !paid && "bg-[#f0f3f9]/60")}>{f.claimed ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <span className="text-gray-300">—</span>}</td>
                  <td className={cx("px-5 py-3 text-center", paid && "bg-[#fdf4e3]/60")}><Check className="mx-auto h-4 w-4 text-emerald-500" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Owner profile" description="The contact details on file for your claim." />
        <dl className="divide-y divide-gray-100 border-t border-gray-100">
          <DetailRow label="Name" missing={!ownerName}>{ownerName}</DetailRow>
          <DetailRow label="Sign-in email">{email}</DetailRow>
          <DetailRow label="Claim email" missing={!claim.owner_email}>{claim.owner_email}</DetailRow>
          <DetailRow label="Phone" missing={!claim.owner_phone}>{claim.owner_phone}</DetailRow>
          <DetailRow label="Owner since">{fmtDate(claim.created_at)}</DetailRow>
        </dl>
        <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
          Need to change your sign-in email? <a href={`mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent("Change owner email")}`} className="font-medium text-[#1e3a8a] hover:underline">Email us</a>.
        </p>
      </Card>

      <Card>
        <CardHeader
          title={hasPassword ? "Change password" : "Create a password"}
          description={hasPassword
            ? "Update the password you use to sign in."
            : "Set a password so you can sign in any time without waiting for an email link."}
          right={hasPassword ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <KeyRound className="h-3.5 w-3.5" /> Password set
            </span>
          ) : undefined}
        />
        <form onSubmit={handleSetPassword} className="border-t border-gray-100 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">New password</span>
              <input
                type="password" autoComplete="new-password" placeholder="At least 8 characters"
                value={pw} onChange={(e) => setPw(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/15"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Confirm password</span>
              <input
                type="password" autoComplete="new-password" placeholder="Type it again"
                value={pw2} onChange={(e) => setPw2(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/15"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={pwBusy || !pw} className={BTN_PRIMARY}>
              {pwBusy ? "Saving…" : "Save password"}
            </button>
            {pwMsg && (
              <span className={cx("inline-flex items-center gap-1.5 text-sm", pwMsg.ok ? "text-emerald-700" : "text-red-600")}>
                {pwMsg.ok && <Check className="h-4 w-4" />} {pwMsg.text}
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Sign out</p>
              <p className="text-sm text-gray-500">Sign out of the Owner Portal on this device.</p>
            </div>
          </div>
          <button onClick={handleSignOut} className={BTN_SECONDARY}><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </Card>
    </div>
  );

  const content =
    section === "listing" ? renderListing()
    : section === "photos"  ? renderPhotos()
    : section === "profile" ? renderProfile()
    : section === "plan"    ? renderPlan()
    : section === "account" ? renderAccount()
    : renderOverview();

  // ── Shell ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900" style={FONT}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:block">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <button onClick={() => setMobileNav(false)} className="absolute right-3 top-3 z-10 rounded-md p-2 text-gray-400 hover:bg-gray-100" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button onClick={() => setMobileNav(true)} className="-ml-1 rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="hidden sm:inline">Owner Portal</span>
              <ChevronRight className="hidden h-3 w-3 sm:inline" />
              <span className="truncate">{claim.studio_title}</span>
            </div>
            <h1 className="truncate text-base font-semibold text-gray-900">{current.label}</h1>
          </div>
          <a href={listingUrl} target="_blank" rel="noopener noreferrer" className={BTN_SECONDARY}>
            <Eye className="h-4 w-4" /><span className="hidden sm:inline">View live listing</span>
          </a>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {content}
          <footer className="mt-12 flex flex-col gap-2 border-t border-gray-200 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Ballroom Dance Directory</span>
            <span className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-600">Terms</Link>
              <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Small icon wrapper used in the Listing details "edit your description" card.
function PenLineIcon({ paid }: { paid: boolean }) {
  return (
    <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", paid ? TONES.navy : TONES.gold)}>
      {paid ? <Sparkles className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
    </span>
  );
}
