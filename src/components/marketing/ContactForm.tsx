"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/content/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (res.ok) setSent(true);
      else if (res.status === 429) setError("Too many messages — please try again in a few minutes.");
      else setError("Couldn't send that. Please check your details and try again.");
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <CheckCircle2 size={20} /> Thanks — we&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className={inputCls} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Your email" className={inputCls} />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder="How can we help?" className={inputCls} />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : "Send message"}
      </button>
    </form>
  );
}
