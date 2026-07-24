"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { KeyRound, CheckCircle2, Circle, Loader2, ShieldAlert, GitBranch } from "lucide-react";
import {
  getSettings,
  updateSettings,
  getFallbackChain,
  updateFallbackChain,
  type SettingsOut,
  type FallbackTier,
} from "@/lib/settings";
import FallbackChainEditor, { validateChain } from "@/components/settings/FallbackChainEditor";
import { listModels, type ModelOption } from "@/lib/bots";

/** A secret field: shows whether it's already set (+hint), with an input to replace it. */
function SecretField({
  label,
  help,
  isSet,
  hint,
  value,
  onChange,
}: {
  label: string;
  help: string;
  isSet: boolean;
  hint: string | null;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        {isSet ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 size={13} /> set {hint}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Circle size={13} /> not set
          </span>
        )}
      </div>
      <input
        type="password"
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isSet ? "Enter a new key to replace it" : "Paste key…"}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800"
      />
      <p className="mt-1 text-xs text-slate-500">{help}</p>
    </div>
  );
}

function FallbackChainCard() {
  const [tiers, setTiers] = useState<FallbackTier[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFallbackChain()
      .then(setTiers)
      .catch(() => toast.error("Failed to load fallback chain"))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiers) return;
    const problem = validateChain(tiers);
    if (problem) {
      toast.error(problem);
      return;
    }
    setSaving(true);
    try {
      setTiers(await updateFallbackChain(tiers));
      toast.success("Fallback chain saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !tiers) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 dark:border-slate-800">
        <Loader2 className="animate-spin" size={18} />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
          <GitBranch size={20} />
        </div>
        <div>
          <div className="text-lg font-semibold">Default chat fallback chain</div>
          <p className="text-sm text-slate-500">
            Used by any package that hasn&apos;t defined its own chain. Models are tried top to
            bottom until one answers. Set a per-plan chain under Admin &rarr; Packages.
          </p>
        </div>
      </div>

      <FallbackChainEditor tiers={tiers} onChange={setTiers} />

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save fallback chain"}
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsOut | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);

  // editable fields
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [voyageKey, setVoyageKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [defaultModel, setDefaultModel] = useState("");

  const load = async () => {
    try {
      const s = await getSettings();
      setSettings(s);
      setBaseUrl(s.openrouter_base_url);
      setDefaultModel(s.default_chat_model);
      setModels(await listModels());
    } catch (err: any) {
      if (err?.response?.status === 403) setForbidden(true);
      else toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateSettings({
        openrouter_api_key: openrouterKey || undefined,
        voyage_api_key: voyageKey || undefined,
        openrouter_base_url: baseUrl || undefined,
        default_chat_model: defaultModel || undefined,
      });
      setSettings(updated);
      setOpenrouterKey("");
      setVoyageKey("");
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert size={18} /> Platform admin only
        </div>
        <p className="mt-2 text-sm">
          These settings are global API keys for the platform. Ask an operator to grant your account
          platform-admin (<code>scripts/make_admin.py your@email</code>).
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
          <KeyRound size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">API Keys & Models</h1>
          <p className="text-sm text-slate-500">
            Stored securely server-side. Keys are never shown in full after saving.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <SecretField
          label="OpenRouter API key"
          help="Chat models (Claude, GPT, gpt-oss, Mistral, Gemma…) — one key. Get it at openrouter.ai/keys"
          isSet={settings!.openrouter_api_key_set}
          hint={settings!.openrouter_api_key_hint}
          value={openrouterKey}
          onChange={setOpenrouterKey}
        />
        <SecretField
          label="Voyage API key"
          help="Embeddings for knowledge-base search. Get it at dashboard.voyageai.com"
          isSet={settings!.voyage_api_key_set}
          hint={settings!.voyage_api_key_hint}
          value={voyageKey}
          onChange={setVoyageKey}
        />

        <div>
          <label className="mb-1 block text-sm font-medium">Default chat model</label>
          <select value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)} className={inputCls}>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.provider}
              </option>
            ))}
            {/* keep whatever is stored even if not in the catalog */}
            {defaultModel && !models.some((m) => m.id === defaultModel) && (
              <option value={defaultModel}>{defaultModel} (custom)</option>
            )}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Rarely used now — only as a last-resort fallback if the chain below is empty or misconfigured.
            The fallback chain below controls which model actually answers.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">OpenRouter base URL</label>
          <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className={`${inputCls} font-mono`} />
          <p className="mt-1 text-xs text-slate-500">Advanced — change only to use a different gateway (e.g. a local model server).</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>

      <div className="mt-6">
        <FallbackChainCard />
      </div>
    </div>
  );
}
