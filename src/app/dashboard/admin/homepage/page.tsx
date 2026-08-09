"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { getHomepageAdmin, updateHomepage } from "@/lib/cms";
import type { Homepage } from "@/lib/content";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";
const ICONS = ["bolt", "chat", "user", "shield", "globe", "chart"];

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={inputCls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function HomepageEditor() {
  const [c, setC] = useState<Homepage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    getHomepageAdmin()
      .then(setC)
      .catch((err) => {
        if (err?.response?.status === 403) setForbidden(true);
        else toast.error("Failed to load");
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (updater: (draft: Homepage) => void) =>
    setC((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      updater(next);
      return next;
    });

  const save = async () => {
    if (!c) return;
    setSaving(true);
    try {
      setC(await updateHomepage(c));
      toast.success("Homepage saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>;
  if (forbidden) return <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40">Platform admin only.</div>;
  if (!c) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft size={14} /> Admin</Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Homepage</h1>
          <p className="mt-1 text-sm text-slate-500">Edit the public landing page content.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="space-y-5">
        <Section title="SEO">
          <Field label="Meta title" value={c.meta_title} onChange={(v) => set((d) => { d.meta_title = v; })} />
          <Field label="Meta description" value={c.meta_description} onChange={(v) => set((d) => { d.meta_description = v; })} textarea />
        </Section>

        <Section title="Hero">
          <Field label="Badge" value={c.hero.badge} onChange={(v) => set((d) => { d.hero.badge = v; })} />
          <Field label="Headline" value={c.hero.headline} onChange={(v) => set((d) => { d.hero.headline = v; })} />
          <Field label="Subheadline" value={c.hero.subhead} onChange={(v) => set((d) => { d.hero.subhead = v; })} textarea />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Primary button" value={c.hero.cta_primary} onChange={(v) => set((d) => { d.hero.cta_primary = v; })} />
            <Field label="Secondary button" value={c.hero.cta_secondary} onChange={(v) => set((d) => { d.hero.cta_secondary = v; })} />
          </div>
        </Section>

        <Section title="Features">
          {c.features.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-2">
                <select value={f.icon} onChange={(e) => set((d) => { d.features[i].icon = e.target.value; })} className={`${inputCls} w-32`}>
                  {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <input value={f.title} onChange={(e) => set((d) => { d.features[i].title = e.target.value; })} placeholder="Title" className={`${inputCls} flex-1`} />
                <button onClick={() => set((d) => { d.features.splice(i, 1); })} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
              </div>
              <textarea value={f.text} onChange={(e) => set((d) => { d.features[i].text = e.target.value; })} rows={2} placeholder="Description" className={inputCls} />
            </div>
          ))}
          <button onClick={() => set((d) => { d.features.push({ icon: "bolt", title: "", text: "" }); })} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600"><Plus size={15} /> Add feature</button>
        </Section>

        <Section title="Pricing section">
          <Field label="Heading" value={c.pricing.heading} onChange={(v) => set((d) => { d.pricing.heading = v; })} />
          <Field label="Subheading" value={c.pricing.subhead} onChange={(v) => set((d) => { d.pricing.subhead = v; })} />
          <p className="text-xs text-slate-400">Plans themselves are managed under Admin → Packages.</p>
        </Section>

        <Section title="FAQ">
          {c.faq.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-2">
                <input value={f.q} onChange={(e) => set((d) => { d.faq[i].q = e.target.value; })} placeholder="Question" className={`${inputCls} flex-1`} />
                <button onClick={() => set((d) => { d.faq.splice(i, 1); })} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
              </div>
              <textarea value={f.a} onChange={(e) => set((d) => { d.faq[i].a = e.target.value; })} rows={2} placeholder="Answer" className={inputCls} />
            </div>
          ))}
          <button onClick={() => set((d) => { d.faq.push({ q: "", a: "" }); })} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600"><Plus size={15} /> Add question</button>
        </Section>

        <Section title="Call to action">
          <Field label="Headline" value={c.cta.headline} onChange={(v) => set((d) => { d.cta.headline = v; })} />
          <Field label="Text" value={c.cta.text} onChange={(v) => set((d) => { d.cta.text = v; })} textarea />
          <Field label="Button" value={c.cta.button} onChange={(v) => set((d) => { d.cta.button = v; })} />
        </Section>

        <Section title="Footer & demo">
          <Field label="Footer tagline" value={c.footer.tagline} onChange={(v) => set((d) => { d.footer.tagline = v; })} />
          <Field label="Live demo widget public key (optional)" value={c.demo_public_key} onChange={(v) => set((d) => { d.demo_public_key = v; })} />
          <p className="text-xs text-slate-400">Paste a bot&apos;s widget public key to show a live chat bubble on the homepage.</p>
        </Section>
      </div>
    </div>
  );
}
