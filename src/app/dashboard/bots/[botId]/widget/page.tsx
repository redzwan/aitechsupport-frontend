"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Copy,
  RotateCw,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getWidgetConfig,
  updateWidgetConfig,
  rotateWidgetKey,
  type WidgetConfig,
  type WidgetAppearance,
} from "@/lib/widget";
import { getBot, type Bot } from "@/lib/bots";
import BotTabs from "@/components/bot/BotTabs";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

// Same YIQ contrast rule the widget uses: dark or white text over a hex background.
function onPrimary(hex: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return "#ffffff";
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 140 ? "#111111" : "#ffffff";
}

export default function WidgetPage() {
  const botId = Number(useParams().botId);

  const [bot, setBot] = useState<Bot | undefined>();
  const [cfg, setCfg] = useState<WidgetConfig | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // editable local state
  const [enabled, setEnabled] = useState(false);
  const [origins, setOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState("");
  const [appearance, setAppearance] = useState<WidgetAppearance>({
    title: "",
    subtitle: "",
    greeting: "",
    primary_color: "#4f46e5",
    position: "right",
    launcher_label: "Chat",
    theme: "auto",
  });

  const hydrate = (c: WidgetConfig) => {
    setCfg(c);
    setEnabled(c.enabled);
    setOrigins(c.allowed_origins);
    setAppearance(c.appearance);
  };

  useEffect(() => {
    getBot(botId).then(setBot).catch(() => {});
    getWidgetConfig(botId)
      .then(hydrate)
      .catch(() => toast.error("Failed to load widget settings"))
      .finally(() => setLoading(false));
  }, [botId]);

  const addOrigin = () => {
    const v = newOrigin.trim();
    if (!v) return;
    const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    setOrigins((prev) => (prev.includes(withScheme) ? prev : [...prev, withScheme]));
    setNewOrigin("");
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateWidgetConfig(botId, {
        enabled,
        allowed_origins: origins,
        appearance,
      });
      hydrate(updated);
      toast.success("Saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const rotate = async () => {
    if (!confirm("Rotate the embed key? Any snippet already pasted on a site will stop working until you replace it.")) return;
    try {
      hydrate(await rotateWidgetKey(botId));
      toast.success("New key generated — update your embed snippet");
    } catch {
      toast.error("Failed to rotate key");
    }
  };

  const copySnippet = async () => {
    if (!cfg) return;
    try {
      await navigator.clipboard.writeText(cfg.snippet);
      toast.success("Snippet copied");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  const setAp = (patch: Partial<WidgetAppearance>) => setAppearance((a) => ({ ...a, ...patch }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Preview palette — mirrors the widget's theme + contrast rules (dark only when forced).
  const pvDark = appearance.theme === "dark";
  const pv = {
    panel: pvDark ? "#1f2023" : "#ffffff",
    text: pvDark ? "#f2f2f4" : "#111418",
    border: pvDark ? "#34363a" : "#e5e5ea",
    onPri: onPrimary(appearance.primary_color),
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/bots" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Bots
      </Link>

      <BotTabs botId={botId} active="widget" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Website widget</h1>
          <p className="mt-1 text-sm text-slate-500">{bot ? bot.name : `Bot #${botId}`} — embed a chat bubble on your site.</p>
        </div>
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <span className={enabled ? "" : "text-slate-400"}>{enabled ? "Enabled" : "Disabled"}</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={enabled ? "Disable widget" : "Enable widget"}
            onClick={() => setEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              enabled ? "bg-indigo-600" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* left column: config */}
        <div className="space-y-6">
          {/* embed snippet */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-semibold">Embed snippet</h2>
            <p className="mb-3 text-xs text-slate-500">Paste this just before <code>&lt;/body&gt;</code> on your site.</p>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-slate-100">{cfg?.snippet}</pre>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={copySnippet} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                <Copy size={13} /> Copy
              </button>
              <button onClick={rotate} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <RotateCw size={13} /> Rotate key
              </button>
            </div>
            {!enabled && <p className="mt-3 text-xs text-amber-600">The widget is disabled — enable it and add an allowed domain for it to answer.</p>}
          </section>

          {/* allowed domains */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-1 text-sm font-semibold">Allowed domains</h2>
            <p className="mb-3 text-xs text-slate-500">Sites permitted to embed this widget (browser origin check).</p>
            <div className="flex gap-2">
              <input
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOrigin();
                  }
                }}
                className={inputCls}
                placeholder="https://yoursite.com"
              />
              <button onClick={addOrigin} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <Plus size={15} /> Add
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {origins.length === 0 ? (
                <p className="text-xs text-slate-400">No domains yet.</p>
              ) : (
                origins.map((o) => (
                  <div key={o} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700">
                    <span className="truncate">{o}</span>
                    <button onClick={() => setOrigins((prev) => prev.filter((x) => x !== o))} className="text-slate-400 hover:text-rose-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* appearance */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold">Appearance</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Header title</label>
                <input value={appearance.title} onChange={(e) => setAp({ title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Header subtitle</label>
                <input value={appearance.subtitle} onChange={(e) => setAp({ subtitle: e.target.value })} className={inputCls} placeholder="e.g. We reply in a few minutes" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Greeting</label>
                <input value={appearance.greeting} onChange={(e) => setAp({ greeting: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Launcher label</label>
                <input value={appearance.launcher_label} onChange={(e) => setAp({ launcher_label: e.target.value })} className={inputCls} />
              </div>
              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Color</label>
                  <input type="color" value={appearance.primary_color} onChange={(e) => setAp({ primary_color: e.target.value })} className="h-9 w-14 cursor-pointer rounded border border-slate-300 dark:border-slate-700" />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Position</label>
                  <select value={appearance.position} onChange={(e) => setAp({ position: e.target.value as "right" | "left" })} className={inputCls}>
                    <option value="right">Bottom right</option>
                    <option value="left">Bottom left</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Theme</label>
                  <select value={appearance.theme} onChange={(e) => setAp({ theme: e.target.value as "auto" | "light" | "dark" })} className={inputCls}>
                    <option value="auto">Auto (visitor&apos;s OS)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <button onClick={save} disabled={saving} className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        {/* right column: live preview (CSS mock — does not call the bot) */}
        <div className="md:sticky md:top-6 md:self-start">
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Preview</h2>
          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            {/* mock chat panel */}
            <div className={`absolute bottom-16 w-56 overflow-hidden rounded-xl shadow-xl ${appearance.position === "left" ? "left-4" : "right-4"}`} style={{ background: pv.panel, border: `1px solid ${pv.border}` }}>
              <div className="px-3 py-2.5" style={{ background: appearance.primary_color, color: pv.onPri }}>
                <div className="text-sm font-semibold leading-tight">{appearance.title || "Chat with us"}</div>
                {appearance.subtitle && <div className="text-[10px] opacity-85">{appearance.subtitle}</div>}
              </div>
              <div className="space-y-2 p-3">
                <div className="max-w-[85%] rounded-lg rounded-bl-sm px-2.5 py-1.5 text-xs" style={{ background: pv.panel, color: pv.text, border: `1px solid ${pv.border}` }}>
                  {appearance.greeting || "Hi! How can I help?"}
                </div>
                <div className="ml-auto max-w-[85%] rounded-lg rounded-br-sm px-2.5 py-1.5 text-xs" style={{ background: appearance.primary_color, color: pv.onPri }}>
                  Do you ship to Malaysia?
                </div>
              </div>
            </div>
            {/* mock launcher */}
            <div className={`absolute bottom-4 flex h-11 items-center rounded-full px-4 text-sm font-semibold shadow-lg ${appearance.position === "left" ? "left-4" : "right-4"}`} style={{ background: appearance.primary_color, color: pv.onPri }}>
              {appearance.launcher_label || "Chat"}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">A visual mock — it doesn&apos;t call the bot or use quota.</p>
        </div>
      </div>
    </div>
  );
}
