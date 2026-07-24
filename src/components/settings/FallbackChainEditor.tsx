"use client";

import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { FallbackTier } from "@/lib/settings";

const emptyTier: FallbackTier = { label: "", provider: "self_hosted", base_url: "", model: "" };

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

/** Validate a chain before saving. Returns an error message, or null when valid. */
export function validateChain(tiers: FallbackTier[]): string | null {
  if (tiers.length === 0) return "At least one tier is required";
  for (const t of tiers) {
    if (!t.label.trim() || !t.model.trim()) return "Every tier needs a label and a model";
    if (t.provider === "self_hosted" && !(t.base_url || "").trim()) {
      return `"${t.label || "Untitled"}" is self-hosted and needs a server URL`;
    }
  }
  return null;
}

/** Editor for an ordered chat fallback chain — the models tried top to bottom
 *  until one answers. Used for both a package's own chain and the platform-wide
 *  default in Settings. */
export default function FallbackChainEditor({
  tiers,
  onChange,
}: {
  tiers: FallbackTier[];
  onChange: (tiers: FallbackTier[]) => void;
}) {
  const update = (i: number, patch: Partial<FallbackTier>) =>
    onChange(tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  const remove = (i: number) => onChange(tiers.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...tiers];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...tiers, { ...emptyTier }]);

  return (
    <div className="space-y-3">
      {tiers.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700">
          No tiers yet — this plan inherits the platform-wide chain from Settings.
        </p>
      )}

      {tiers.map((t, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Tier {i + 1}
              {i === 0 ? " — tried first" : ""}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30" title="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === tiers.length - 1} className="rounded p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30" title="Move down">
                <ArrowDown size={14} />
              </button>
              <button type="button" onClick={() => remove(i)} className="rounded p-1 text-slate-400 hover:text-rose-600" title="Remove tier">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Label</label>
              <input value={t.label} onChange={(e) => update(i, { label: e.target.value })} className={inputCls} placeholder="black" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Provider</label>
              <select
                value={t.provider}
                onChange={(e) => update(i, { provider: e.target.value as FallbackTier["provider"] })}
                className={inputCls}
              >
                <option value="self_hosted">Self-hosted (Ollama)</option>
                <option value="openrouter">OpenRouter</option>
              </select>
            </div>
            {t.provider === "self_hosted" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Server URL (IP:port)</label>
                <input value={t.base_url || ""} onChange={(e) => update(i, { base_url: e.target.value })} className={`${inputCls} font-mono`} placeholder="http://100.102.172.23:11434" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Model</label>
              <input value={t.model} onChange={(e) => update(i, { model: e.target.value })} className={`${inputCls} font-mono`} placeholder="qwen3:8b" />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        <Plus size={14} /> Add tier
      </button>
    </div>
  );
}
