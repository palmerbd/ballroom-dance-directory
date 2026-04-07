"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function LeadCaptureForm({
  studioSlug,
  studioTitle,
}: {
  studioSlug: string;
  studioTitle: string;
}) {
  const [state,   setState]   = useState<FormState>("idle");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [errMsg,  setErrMsg]  = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setState("submitting");
    setErrMsg("");
    try {
      const res = await fetch(`/api/contact/${studioSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error || "Something went wrong."); setState("error"); return; }
      setState("success");
    } catch { setErrMsg("Network error. Please try again."); setState("error"); }
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all";

  if (state === "success") {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm text-center">
        <div className="text-3xl mb-3">\u2705</div>
        <h3 className="font-bold text-gray-900 text-base mb-1">Message Sent!</h3>
        <p className="text-gray-500 text-sm">{studioTitle} will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-400 text-lg">⭐</span>
        <div>
          <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Featured Studio</div>
          <h3 className="font-bold text-white text-base leading-tight">Send a Message</h3>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        <input type="email" placeholder="Your email *" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        <textarea placeholder="Your message — what are you looking for? *" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className={inputClass + " resize-none"} />
        {errMsg && <p className="text-red-400 text-xs">{errMsg}</p>}
        <button type="submit" disabled={state === "submitting"} className="w-full py-3 rounded-xl font-bold text-gray-900 text-sm transition-all hover:brightness-110 disabled:opacity-60" style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
          {state === "submitting" ? "Sending\u2026" : "Send Message \u2192"}
        </button>
        <p className="text-white/30 text-xs text-center">Your message goes directly to the studio owner.</p>
      </form>
    </div>
  );
}
