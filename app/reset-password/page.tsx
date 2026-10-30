"use client";

// ─── /reset-password — choose a new password ─────────────────────────────────
// Reached from the password-reset email (via /claim/callback, which establishes the
// Supabase session) or from the dashboard. Requires a signed-in session.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const GOLD = { background: "linear-gradient(135deg,#b8922a,#e8c560)" };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state,    setState]    = useState<"loading" | "no_session" | "form" | "done">("loading");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setState("no_session"); return; }
      setEmail(data.session.user.email || "");
      setState("form");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password, data: { has_password: true } });
    setBusy(false);
    if (err) { setError(err.message || "Could not update your password. Please try again."); return; }
    try { localStorage.removeItem("bddAuthIntent"); } catch { /* ignore */ }
    setState("done");
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <main style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)", minHeight: "100vh" }}
      className="flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full">
        {state === "loading" && (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full" />
          </div>
        )}

        {state === "no_session" && (
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-xl mb-2">This link has expired</h1>
            <p className="text-gray-500 text-sm mb-6">Password links work once and expire after about an hour. Request a new one below.</p>
            <Link href="/login?mode=forgot" className="block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center hover:brightness-110" style={GOLD}>
              Send a new reset link
            </Link>
          </div>
        )}

        {state === "form" && (
          <>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#b8922a" }}>Studio owner account</p>
            <h1 className="font-bold text-gray-900 text-2xl mb-1">Choose a password</h1>
            <p className="text-gray-500 text-sm mb-6">For <strong>{email}</strong>. You&apos;ll use this to sign in from now on.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pw" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">New password</label>
                <input id="pw" type="password" autoComplete="new-password" required minLength={8} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1">At least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="pw2" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Confirm password</label>
                <input id="pw2" type="password" autoComplete="new-password" required value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 outline-none text-sm" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={busy}
                className="w-full py-3 rounded-xl font-bold text-gray-900 text-sm hover:brightness-110 disabled:opacity-50" style={GOLD}>
                {busy ? "Saving…" : "Save password"}
              </button>
            </form>
          </>
        )}

        {state === "done" && (
          <div className="text-center">
            <div className="text-5xl mb-4">&#9989;</div>
            <h1 className="font-bold text-gray-900 text-xl mb-2">Password saved</h1>
            <p className="text-gray-500 text-sm">Taking you to your dashboard&hellip;</p>
          </div>
        )}
      </div>
    </main>
  );
}
